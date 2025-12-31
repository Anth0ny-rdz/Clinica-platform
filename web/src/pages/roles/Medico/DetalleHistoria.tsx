import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchEncounterDetail } from '@/services/encounterService'
import { fetchExamOrdersByEncounter } from '@/services/examService'
import { fetchAISuggestion } from '@/services/encounterService'

import AIApoyoClinicoCards from '@/components/AIApoyoClinicoCards'


import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Card, Table, Button, Alert, Spinner, Badge } from 'react-bootstrap'

type ExamType = {
  name: string
}

type ExamItem = {
  item_id: number
  status: string
  examtype_id: number
  exam_type: ExamType
}

type ExamOrder = {
  order_id: number
  created_at: string
  priority: string
  order_exam_items: ExamItem[]
}

export default function DetalleHistoria() {
  const { encounter_id } = useParams()
  const navigate = useNavigate()

  const [encounter, setEncounter] = useState<any>(null)
  const [examOrders, setExamOrders] = useState<ExamOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)
  const [aiError, setAiError] = useState<string | null>(null)



  const pdfRef = useRef<HTMLDivElement>(null)

  // 👇 Ocultar exámenes solo al exportar PDF (ORIGINAL)
  const [hideExams, setHideExams] = useState(false)

  /* ===========================
     CARGAR HISTORIA + EXÁMENES
  =========================== */
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

  /* ===========================
     EXPORTAR PDF (ORIGINAL)
  =========================== */
  const handleExportPDF = async () => {
    if (!pdfRef.current) return

    setHideExams(true)
    await new Promise((resolve) => setTimeout(resolve, 150))

    const canvas = await html2canvas(pdfRef.current, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`Historia_Medica_${encounter_id}.pdf`)

    setHideExams(false)
  }

  /* ===========================
   APOYO CLÍNICO IA (BAJO DEMANDA)
=========================== */
  const handleAISupport = async () => {
    try {
      setAiLoading(true)
      setAiError(null)
      setAiResult(null)

      const data = await fetchAISuggestion(Number(encounter_id))
      setAiResult(data.recommendation)

    } catch (err: any) {
      setAiError(err.message || 'Error generando apoyo clínico IA')
    } finally {
      setAiLoading(false)
    }
  }



  /* ===========================
     ESTADOS BASE
  =========================== */
  if (loading) {
    return (
      <div className="text-center my-5 text-muted">
        <Spinner animation="border" className="me-2" />
        Cargando historia médica...
      </div>
    )
  }

  if (!encounter) {
    return (
      <Alert variant="danger" className="m-4">
        {message || 'Historia no encontrada.'}
      </Alert>
    )
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 1000 }}>

      {/* ================= BOTONES SUPERIORES ================= */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="link" onClick={() => navigate(-1)}>
          ← Volver
        </Button>

        <div className="d-flex gap-2">
          <Button
            variant="success"
            onClick={() => navigate(`/medico/examenes/nuevo/${encounter_id}`)}
          >
            ➕ Solicitar Examen
          </Button>

          <Button variant="primary" onClick={handleExportPDF}>
            📄 Exportar PDF
          </Button>

          <Button
            variant="outline-primary"
            onClick={handleAISupport}
            disabled={aiLoading}
          >
            {aiLoading ? 'Analizando...' : '🧠 Apoyo clínico IA'}
          </Button>

        </div>
      </div>

      {/* ================= CONTENIDO EXPORTABLE ================= */}
      <div ref={pdfRef}>

        {/* ================= CABECERA ================= */}
        <Card className="shadow p-4 mb-4">
          <h2 className="text-center mb-3">Historia Clínica</h2>

          <div className="row">
            <div className="col-md-6">
              <p><strong>Fecha:</strong> {encounter.date}</p>
              <p><strong>Hora:</strong> {encounter.hour || '—'}</p>
              <p><strong>Médico tratante:</strong> {encounter.doctor_name || '—'}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Especialidad:</strong> {encounter.especialidad || '—'}</p>
              <p><strong>Subespecialidad:</strong> {encounter.subespecialidad || '—'}</p>
            </div>
          </div>
        </Card>

        {/* ================= SECCIONES CLÍNICAS ================= */}
        <Card className="shadow p-4 mb-4">
          <h5>🩺 Motivo de Consulta</h5>
          <p>{encounter.reason_for_consultation || '—'}</p>

          <h5>Síntomas Principales</h5>
          <p>{encounter.main_symptoms || '—'}</p>

          <h5>Síntomas Secundarios</h5>
          <p>{encounter.secondary_symptoms || '—'}</p>

          <h5>Revisión de Órganos y Sistemas</h5>
          <p>{encounter.revision_organos || '—'}</p>

          <h5>Examen Físico</h5>
          <p>{encounter.examen_fisico || '—'}</p>

          <h5>Diagnóstico</h5>
          <p>{encounter.diagnostico || '—'}</p>

          <h5>Tratamiento</h5>
          <p>{encounter.treatment || '—'}</p>

          <h5>Observaciones</h5>
          <p>{encounter.observations || '—'}</p>

          <h5>📅 Próxima Fecha de Control</h5>
          <p>{encounter.fecha_para_control || '—'}</p>
        </Card>

        {/* ================= SIGNOS VITALES ================= */}
        <Card className="shadow p-4 mb-4">
          <h5>❤️ Signos Vitales</h5>

          {encounter.vitals ? (
            <ul>
              <li><strong>Presión arterial:</strong> {encounter.vitals.presion_arterial || '—'}</li>
              <li><strong>Pulso:</strong> {encounter.vitals.pulso_xmin || '—'}</li>
              <li>
                <strong>Temperatura:</strong>{' '}
                {encounter.vitals.temperatura
                  ? `${encounter.vitals.temperatura} °C`
                  : '—'}
              </li>
            </ul>
          ) : (
            <p>No se registraron signos vitales.</p>
          )}
        </Card>

          {/* ================= APOYO CLÍNICO IA ================= */}
          {aiError && (
            <Alert variant="danger" className="mt-3">
              {aiError}
            </Alert>
          )}

          {aiResult && (<AIApoyoClinicoCards data={aiResult} />)}




        {/* ================= ÓRDENES DE EXÁMENES ================= */}
        {!hideExams && (
          <Card className="shadow p-4 mb-4">
            <h5 className="mb-3">🧪 Órdenes de Exámenes Asociadas</h5>

            {examOrders.length === 0 ? (
              <p className="text-muted">
                No existen órdenes de examen vinculadas a esta historia.
              </p>
            ) : (
              <Table bordered hover responsive>
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Prioridad</th>
                    <th>Exámenes</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {examOrders.map((order) => (
                    <tr key={order.order_id}>
                      <td>{order.order_id}</td>
                      <td>{new Date(order.created_at).toLocaleDateString('es-EC')}</td>
                      <td>
                        <Badge bg={order.priority === "Alta" ? "danger" : "secondary"}>
                          {order.priority}
                        </Badge>
                      </td>
                      <td>
                        {order.order_exam_items
                          .map((item: ExamItem) => item.exam_type.name)
                          .join(', ')}
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() =>
                            navigate(`/medico/examenes/orden/${order.order_id}`)
                          }
                        >
                          Ver detalle
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
