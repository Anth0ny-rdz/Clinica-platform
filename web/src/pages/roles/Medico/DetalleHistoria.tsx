import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchEncounterDetail } from '@/services/encounterService'
import { fetchExamOrdersByEncounter } from '@/services/examService'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Card, Table, Button, Alert, Badge } from 'react-bootstrap'

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
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)


  const pdfRef = useRef<HTMLDivElement>(null)
  const [hideExams, setHideExams] = useState(false)

  /* CARGAR HISTORIA + EXÁMENES */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  /* EXPORTAR PDF */
  const handleExportPDF = async () => {
  if (!pdfRef.current) return

  try {
    setHideExams(true)

    // Esperar a que React re-renderice
    await new Promise((r) => setTimeout(r, 500))

    // Modo PDF (desactiva animaciones y sombras)
    pdfRef.current.classList.add('pdf-mode')

    const canvas = await html2canvas(pdfRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: pdfRef.current.scrollWidth,
      scrollY: -window.scrollY,
    })

    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    const imgWidth = pdfWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    // Primera página
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pdfHeight

    // Páginas adicionales
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight
    }

    pdf.save(`Historia_Medica_${encounter_id}.pdf`)
    setMessage('✅ PDF exportado correctamente')
  } catch (error) {
    console.error(error)
    setMessage('❌ Error al exportar PDF')
  } finally {
    if (pdfRef.current) {
      pdfRef.current.classList.remove('pdf-mode')
    }
    setHideExams(false)
  }
}




  /* LOADING */
  if (loading) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
          minHeight: '100vh',
          padding: 0,
          margin: 0,
        }}
      >
        <div style={{ padding: '2rem 1rem' }}>
          <div className="mx-auto" style={{ maxWidth: 1000 }}>
            <div className="skeleton" style={{ height: '40px', width: '150px', marginBottom: '1.5rem', borderRadius: '8px' }}></div>
            
            <Card style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
              <Card.Body className="p-4">
                <div className="skeleton" style={{ height: '32px', width: '250px', marginBottom: '1.5rem', borderRadius: '8px' }}></div>
                <div className="skeleton" style={{ height: '20px', width: '100%', marginBottom: '1rem', borderRadius: '8px' }}></div>
                <div className="skeleton" style={{ height: '20px', width: '80%', marginBottom: '1rem', borderRadius: '8px' }}></div>
                <div className="skeleton" style={{ height: '200px', width: '100%', borderRadius: '12px' }}></div>
              </Card.Body>
            </Card>
          </div>
        </div>

        <style>
          {`
            .skeleton {
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: loading 1.5s ease-in-out infinite;
            }

            @keyframes loading {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}
        </style>
      </div>
    )
  }

  if (!encounter) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
          minHeight: '100vh',
          padding: 0,
          margin: 0,
        }}
      >
        <div style={{ padding: '2rem 1rem' }}>
          <Alert 
            variant="danger"
            style={{
              maxWidth: 600,
              margin: '4rem auto',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              color: '#991b1b',
              padding: '1.5rem',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
            <div>{message || 'Historia no encontrada.'}</div>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div
      className="detalle-historia-container"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        minHeight: '100vh',
        padding: 0,
        margin: 0,
      }}
    >
      <div style={{ padding: '2rem 1rem' }}>
        <div className="mx-auto content-wrapper" style={{ maxWidth: 1000 }}>

          {/* BOTONES SUPERIORES */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <Button
              variant="link"
              className="back-button px-0"
              onClick={() => navigate(-1)}
              style={{
                textDecoration: "none",
                fontWeight: 600,
                color: '#667eea',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>←</span>
              Volver
            </Button>

            <div className="d-flex gap-2 flex-wrap">
              <Button
                className="action-btn"
                onClick={() => navigate(`/medico/examenes/nuevo/${encounter_id}`)}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s ease',
                }}
              >
                ➕ Solicitar Examen
              </Button>

              <Button 
                className="action-btn"
                onClick={handleExportPDF}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.3s ease',
                }}
              >
                📄 Exportar PDF
              </Button>

            </div>
          </div>

          {/* CONTENIDO EXPORTABLE */}
          <div ref={pdfRef}>

            {/* CABECERA */}
            <Card 
              className="main-card mb-4"
              style={{
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                overflow: 'hidden',
              }}
            >
              <Card.Body className="p-4">
                <h2 className="text-center mb-4" style={{ color: '#2c3e50', fontWeight: 700 }}>
                  📋 Historia Clínica
                </h2>

                <div 
                  className="info-grid"
                  style={{
                    background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '2px solid #e3e6eb',
                  }}
                >
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="info-item mb-3">
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                          📅 Fecha
                        </div>
                        <div style={{ fontWeight: 600, color: '#1f2937' }}>
                          {encounter.date ? new Date(encounter.date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }) : '—'}
                        </div>
                      </div>

                      <div className="info-item mb-3">
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                          🕐 Hora
                        </div>
                        <div style={{ fontWeight: 600, color: '#1f2937' }}>
                          {encounter.hour || '—'}
                        </div>
                      </div>

                      <div className="info-item">
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                          👨‍⚕️ Médico tratante
                        </div>
                        <div style={{ fontWeight: 600, color: '#1f2937' }}>
                          {encounter.doctor_name || '—'}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="info-item mb-3">
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                          🏥 Especialidad
                        </div>
                        <div style={{ fontWeight: 600, color: '#1f2937' }}>
                          {encounter.especialidad || '—'}
                        </div>
                      </div>

                      <div className="info-item">
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                          🩺 Subespecialidad
                        </div>
                        <div style={{ fontWeight: 600, color: '#1f2937' }}>
                          {encounter.subespecialidad || '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* SECCIONES CLÍNICAS */}
            <Card 
              className="clinical-card mb-4"
              style={{
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                overflow: 'hidden',
              }}
            >
              <Card.Body className="p-4">
                {[
                  { icon: '🩺', title: 'Motivo de Consulta', key: 'reason_for_consultation' },
                  { icon: '📝', title: 'Síntomas Principales', key: 'main_symptoms' },
                  { icon: '📋', title: 'Síntomas Secundarios', key: 'secondary_symptoms' },
                  { icon: '🔬', title: 'Revisión de Órganos y Sistemas', key: 'revision_organos' },
                  { icon: '👁️', title: 'Examen Físico', key: 'examen_fisico' },
                  { icon: '🏥', title: 'Diagnóstico', key: 'diagnostico' },
                  { icon: '💊', title: 'Tratamiento', key: 'treatment' },
                  { icon: '📌', title: 'Observaciones', key: 'observations' },
                  { icon: '📅', title: 'Próxima Fecha de Control', key: 'fecha_para_control' },
                ].map((section, index) => (
                  <div key={section.key} className="clinical-section mb-4" style={{ paddingBottom: '1rem', borderBottom: index < 8 ? '1px solid #e5e7eb' : 'none' }}>
                    <h5 style={{ color: '#374151', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{section.icon}</span>
                      {section.title}
                    </h5>
                    <p style={{ color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
                      {encounter[section.key] || '—'}
                    </p>
                  </div>
                ))}
              </Card.Body>
            </Card>

            {/* SIGNOS VITALES */}
            <Card 
              className="vitals-card mb-4"
              style={{
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                overflow: 'hidden',
              }}
            >
              <Card.Body className="p-4">
                <h5 style={{ color: '#374151', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>❤️</span>
                  Signos Vitales
                </h5>

                {encounter.vitals ? (
                  <div 
                    style={{
                      background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: '2px solid #fca5a5',
                    }}
                  >
                    <div className="row g-3">
                      <div className="col-md-4">
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#991b1b', marginBottom: '4px' }}>
                          🩸 Presión arterial
                        </div>
                        <div style={{ fontWeight: 700, color: '#7f1d1d', fontSize: '1.1rem' }}>
                          {encounter.vitals.presion_arterial || '—'}
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#991b1b', marginBottom: '4px' }}>
                          💓 Pulso (x min)
                        </div>
                        <div style={{ fontWeight: 700, color: '#7f1d1d', fontSize: '1.1rem' }}>
                          {encounter.vitals.pulso_xmin || '—'}
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#991b1b', marginBottom: '4px' }}>
                          🌡️ Temperatura
                        </div>
                        <div style={{ fontWeight: 700, color: '#7f1d1d', fontSize: '1.1rem' }}>
                          {encounter.vitals.temperatura ? `${encounter.vitals.temperatura} °C` : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                    No se registraron signos vitales.
                  </p>
                )}
              </Card.Body>
            </Card>


            {/* ÓRDENES DE EXÁMENES */}
            {!hideExams && (
              <Card 
                className="exams-card"
                style={{
                  borderRadius: '20px',
                  border: 'none',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                }}
              >
                <Card.Body className="p-4">
                  <h5 style={{ color: '#374151', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🧪</span>
                    Órdenes de Exámenes Asociadas
                  </h5>

                  {examOrders.length === 0 ? (
                    <div className="text-center py-4">
                      <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>🧪</div>
                      <p style={{ color: '#9ca3af', fontWeight: 500 }}>
                        No existen órdenes de examen vinculadas a esta historia.
                      </p>
                    </div>
                  ) : (
                    <div 
                      className="table-wrapper"
                      style={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '2px solid #e5e7eb',
                      }}
                    >
                      <Table hover responsive className="mb-0 exams-table">
                        <thead style={{ background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)' }}>
                          <tr>
                            <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>ID</th>
                            <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>Fecha</th>
                            <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>Prioridad</th>
                            <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>Exámenes</th>
                            <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {examOrders.map((order) => (
                            <tr key={order.order_id} className="exam-row">
                              <td style={{ padding: '1rem' }}>
                                <Badge 
                                  bg="secondary"
                                  style={{
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                  }}
                                >
                                  #{order.order_id}
                                </Badge>
                              </td>
                              <td style={{ padding: '1rem', fontWeight: 500, color: '#374151' }}>
                                {new Date(order.created_at).toLocaleDateString('es-EC')}
                              </td>
                              <td style={{ padding: '1rem' }}>
                                <Badge 
                                  bg={order.priority === "Alta" ? "danger" : "secondary"}
                                  style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                  }}
                                >
                                  {order.priority}
                                </Badge>
                              </td>
                              <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.95rem' }}>
                                {order.order_exam_items
                                  .map((item: ExamItem) => item.exam_type.name)
                                  .join(', ')}
                              </td>
                              <td style={{ padding: '1rem' }}>
                                <Button
                                  size="sm"
                                  className="detail-btn"
                                  onClick={() => navigate(`/medico/examenes/orden/${order.order_id}`)}
                                  style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                    transition: 'all 0.3s ease',
                                  }}
                                >
                                  Ver detalle
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* ESTILOS */}
      <style>
        {`
          /* === ANIMACIONES === */
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* === CONTAINER === */
          .detalle-historia-container {
            animation: fadeIn 0.6s ease-out;
          }

          .content-wrapper {
            animation: fadeIn 0.7s ease-out 0.1s backwards;
          }

          /* === BOTÓN VOLVER === */
          .back-button:hover {
            color: #764ba2 !important;
            transform: translateX(-5px);
          }

          /* === ACTION BUTTONS === */
          .action-btn:hover:not(:disabled) {
            transform: translateY(-3px);
            filter: brightness(1.1);
          }

          .action-btn:active:not(:disabled) {
            transform: translateY(-1px);
          }

          /* === CARDS === */
          .main-card {
            animation: slideInUp 0.6s ease-out 0.2s backwards;
          }

          .clinical-card {
            animation: slideInUp 0.6s ease-out 0.3s backwards;
          }

          .vitals-card {
            animation: slideInUp 0.6s ease-out 0.4s backwards;
          }

          .exams-card {
            animation: slideInUp 0.6s ease-out 0.5s backwards;
          }

          /* === TABLA === */
          .exams-table tbody tr {
            transition: all 0.3s ease;
            border-bottom: 1px solid #f3f4f6;
          }

          .exams-table tbody tr:hover {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            transform: scale(1.01);
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
          }

          .pdf-mode * {
            animation: none !important;
            transition: none !important;
            transform: none !important;
            box-shadow: none !important;
          }

          .detail-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
          }

          .detail-btn:active {
            transform: translateY(-1px);
          }

          /* === RESPONSIVE === */
          @media (max-width: 768px) {
            .action-btn {
              padding: 8px 16px !important;
              font-size: 0.9rem !important;
            }

            .exams-table {
              font-size: 0.85rem;
            }

            .exams-table th,
            .exams-table td {
              padding: 0.75rem !important;
            }
          }

          /* === ACCESIBILIDAD === */
          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>
    </div>
  )
}