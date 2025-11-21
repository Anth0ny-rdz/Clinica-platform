import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchEncounterDetail } from '@/services/encounterService'
import { fetchExamOrdersByEncounter } from '@/services/examService'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Card, Table, Button, Alert } from 'react-bootstrap'

export default function DetalleHistoria() {
  const { encounter_id } = useParams()
  const navigate = useNavigate()

  const [encounter, setEncounter] = useState<any>(null)
  const [examOrders, setExamOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const pdfRef = useRef<HTMLDivElement>(null)

  // ===========================
  //   CARGAR HISTORIA + EXÁMENES
  // ===========================
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        const data = await fetchEncounterDetail(Number(encounter_id))
        if (data?.vital_signs) data.vitals = data.vital_signs
        setEncounter(data)

        const exams = await fetchExamOrdersByEncounter(Number(encounter_id))
        setExamOrders(exams)

      } catch (err: any) {
        setMessage(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [encounter_id])

  // ===========================
  //   EXPORTAR PDF
  // ===========================
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

      {/* BOTONES SUPERIORES */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button onClick={() => navigate(-1)}>← Volver</button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* NUEVO EXAMEN */}
          <button
            onClick={() => navigate(`/medico/examenes/nuevo/${encounter_id}`)}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ➕ Solicitar Examen
          </button>

          {/* EXPORTAR PDF */}
          <button
            onClick={handleExportPDF}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            📄 Exportar PDF
          </button>
        </div>
      </div>

      {/* CONTENIDO EXPORTABLE */}
      <div
        ref={pdfRef}
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }}
      >
        <h2 style={{ textAlign: 'center' }}>Historia Médica</h2>

        <p><strong>Fecha:</strong> {encounter.date}</p>
        <p><strong>Hora:</strong> {encounter.hour || '—'}</p>
        <p><strong>Médico tratante:</strong> {encounter.doctor_name || '—'}</p>
        <p><strong>Especialidad:</strong> {encounter.especialidad || '—'}</p>
        <p><strong>Subespecialidad:</strong> {encounter.subespecialidad || '—'}</p>

        <hr style={{ margin: '1rem 0' }} />

        <h3>Motivo de Consulta</h3>
        <p>{encounter.reason_for_consultation || '—'}</p>

        <h3>Síntomas Principales</h3>
        <p>{encounter.main_symptoms || '—'}</p>

        <h3>Síntomas Secundarios</h3>
        <p>{encounter.secondary_symptoms || '—'}</p>

        <h3>Revisión de Órganos y Sistemas</h3>
        <p>{encounter.revision_organos || '—'}</p>

        <h3>Examen Físico</h3>
        <p>{encounter.examen_fisico || '—'}</p>

        <h3>Diagnóstico</h3>
        <p>{encounter.diagnostico || '—'}</p>

        <h3>Tratamiento</h3>
        <p>{encounter.treatment || '—'}</p>

        <h3>Observaciones</h3>
        <p>{encounter.observations || '—'}</p>

        <h3>Próxima Fecha de Control</h3>
        <p>{encounter.fecha_para_control || '—'}</p>

        <hr style={{ margin: '1rem 0' }} />

        <h3>Signos Vitales</h3>
        {encounter.vitals ? (
          <ul>
            <li><strong>Presión arterial:</strong> {encounter.vitals.presion_arterial || '—'}</li>
            <li><strong>Pulso:</strong> {encounter.vitals.pulso_xmin || '—'}</li>
            <li><strong>Temperatura:</strong> {encounter.vitals.temperatura ? `${encounter.vitals.temperatura} °C` : '—'}</li>
          </ul>
        ) : (
          <p>No se registraron signos vitales.</p>
        )}

        {/* =========================== */}
        {/* SECCIÓN DE ORDENES DE EXAMEN */}
        {/* =========================== */}

        <hr style={{ margin: '2rem 0' }} />
        <h3>🧪 Órdenes de Exámenes Asociadas</h3>

        {examOrders.length === 0 ? (
          <p className="text-muted">No existen órdenes de examen vinculadas a esta historia.</p>
        ) : (
          <Card className="shadow p-3 mt-3">
            <Table bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Prioridad</th>
                  <th>Items</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {examOrders.map((order) => (
                  <tr key={order.order_id}>
                    <td>{order.order_id}</td>
                    <td>{order.created_at}</td>
                    <td>{order.priority}</td>
                    <td>{order.items_count} exámenes</td>
                    <td>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() =>
                          navigate(`/medico/examenes/orden/${order.order_id}`)
                        }
                      >
                        Ver Detalle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}

      </div>
    </div>
  )
}
