import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchEncounterDetail } from '@/services/encounterService'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function DetalleHistoria() {
  const { encounter_id } = useParams()
  const navigate = useNavigate()
  const [encounter, setEncounter] = useState<any>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const pdfRef = useRef<HTMLDivElement>(null)

  // 🔹 Cargar historia médica
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const data = await fetchEncounterDetail(Number(encounter_id))
        setEncounter(data)
      } catch (err: any) {
        setMessage(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [encounter_id])

  // 🔹 Exportar a PDF
  const handleExportPDF = async () => {
    if (!pdfRef.current) return
    const input = pdfRef.current
    const canvas = await html2canvas(input, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`Historia_Medica_${encounter_id}.pdf`)
  }

  if (loading) return <p style={{ padding: '2rem' }}>Cargando historia médica...</p>
  if (!encounter) return <p style={{ padding: '2rem' }}>{message || 'Historia no encontrada.'}</p>

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button onClick={() => navigate(-1)}>← Volver</button>
        <button
          onClick={handleExportPDF}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          📄 Exportar como PDF
        </button>
      </div>

      {/* Contenido a exportar */}
      <div ref={pdfRef} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center' }}>Historia Médica</h2>
        <p><strong>Fecha:</strong> {encounter.date}</p>
        <p><strong>Hora:</strong> {encounter.hour}</p>
        <p><strong>Médico tratante:</strong> {encounter.doctor_name}</p>

        <hr style={{ margin: '1rem 0' }} />

        <h3>Motivo de Consulta</h3>
        <p>{encounter.reason_for_consultation || '—'}</p>

        <h3>Síntomas Principales</h3>
        <p>{encounter.main_symptoms || '—'}</p>

        <h3>Síntomas Secundarios</h3>
        <p>{encounter.secondary_symptoms || '—'}</p>

        <h3>Tratamiento</h3>
        <p>{encounter.treatment || '—'}</p>

        <h3>Observaciones</h3>
        <p>{encounter.observations || '—'}</p>

        <hr style={{ margin: '1rem 0' }} />

        <h3>❤️ Signos Vitales</h3>
        {encounter.vitals ? (
          <ul>
            <li><strong>Presión arterial:</strong> {encounter.vitals.presion_arterial}</li>
            <li><strong>Pulso:</strong> {encounter.vitals.pulso_xmin}</li>
            <li><strong>Temperatura:</strong> {encounter.vitals.temperatura} °C</li>
          </ul>
        ) : (
          <p>No se registraron signos vitales.</p>
        )}
      </div>
    </div>
  )
}
