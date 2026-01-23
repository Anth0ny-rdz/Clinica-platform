import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, Spinner, Button, Table, Alert, Badge } from "react-bootstrap"

import { fetchEncounterDetail } from "@/services/encounterService"
import { fetchExamOrdersByEncounter } from "@/services/examService"

export default function HistoriaDetalle() {
  const { encounter_id } = useParams()
  const navigate = useNavigate()

  const [encounter, setEncounter] = useState<any>(null)
  const [examOrders, setExamOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!encounter_id) return

        // Cargar historia clínica
        const detail = await fetchEncounterDetail(Number(encounter_id))
        setEncounter(detail)

        // Cargar órdenes de examen asociadas
        const exams = await fetchExamOrdersByEncounter(Number(encounter_id))
        setExamOrders(exams)

      } catch (err: any) {
        console.error("❌ Error:", err)
        setMessage(err.message || "Error cargando detalles")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [encounter_id])

  // Loading skeleton
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
          <div className="mx-auto" style={{ maxWidth: 1100 }}>
            <div className="skeleton" style={{ height: '40px', width: '150px', marginBottom: '1.5rem', borderRadius: '8px' }}></div>
            
            <Card style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
              <Card.Body className="p-4">
                <div className="skeleton" style={{ height: '32px', width: '250px', marginBottom: '1.5rem', borderRadius: '8px' }}></div>
                <div className="skeleton" style={{ height: '20px', width: '100%', marginBottom: '1rem', borderRadius: '8px' }}></div>
                <div className="skeleton" style={{ height: '20px', width: '80%', marginBottom: '1rem', borderRadius: '8px' }}></div>
                <div className="skeleton" style={{ height: '150px', width: '100%', borderRadius: '12px' }}></div>
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
            <div>{message || "No se encontró la historia clínica."}</div>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div
      className="historia-detalle-container"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        minHeight: '100vh',
        padding: 0,
        margin: 0,
      }}
    >
      <div style={{ padding: '2rem 1rem' }}>
        <div className="mx-auto content-wrapper" style={{ maxWidth: 1100 }}>
          
          {/* BOTÓN VOLVER */}
          <Button
            variant="link"
            className="back-button mb-4 px-0"
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

          {/* CARD HISTORIA CLÍNICA */}
          <Card
            className="historia-card mb-4"
            style={{
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            <Card.Body className="p-4">
              
              {/* HEADER */}
              <div className="header-section mb-4 pb-4" style={{ borderBottom: '2px solid #e5e7eb' }}>
                <div className="d-flex align-items-center gap-3">
                  <div 
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    }}
                  >
                    🧑‍⚕️
                  </div>
                  <div>
                    <h3 className="fw-bold mb-1" style={{ color: "#2c3e50", fontSize: '1.8rem' }}>
                      Historia Clínica
                    </h3>
                    <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                      Detalle completo de la consulta médica
                    </p>
                  </div>
                </div>
              </div>

              {/* INFO GENERAL */}
              <div className="info-grid mb-4">
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="info-item">
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                        📅 Fecha
                      </div>
                      <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '1rem' }}>
                        {encounter.date ? new Date(encounter.date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }) : '—'}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-8">
                    <div className="info-item">
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                        👨‍⚕️ Médico
                      </div>
                      <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '1rem' }}>
                        {encounter.doctor_name || '—'}
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="info-item">
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                        📝 Motivo de consulta
                      </div>
                      <div style={{ fontWeight: 500, color: '#374151', fontSize: '1rem', lineHeight: '1.6' }}>
                        {encounter.reason_for_consultation || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SIGNOS VITALES */}
              <div 
                className="vitals-section"
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  padding: '1.5rem',
                  borderRadius: '14px',
                  border: '2px solid #86efac',
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span style={{ fontSize: '1.5rem' }}>🩺</span>
                  <h4 className="fw-bold mb-0" style={{ color: '#065f46' }}>
                    Signos Vitales
                  </h4>
                </div>

                <div className="row g-3">
                  <div className="col-md-4">
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#047857', marginBottom: '4px' }}>
                        Presión arterial
                      </div>
                      <div style={{ fontWeight: 700, color: '#065f46', fontSize: '1.1rem' }}>
                        {encounter.vital_signs?.presion_arterial || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#047857', marginBottom: '4px' }}>
                        Pulso (x min)
                      </div>
                      <div style={{ fontWeight: 700, color: '#065f46', fontSize: '1.1rem' }}>
                        {encounter.vital_signs?.pulso_xmin || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#047857', marginBottom: '4px' }}>
                        Temperatura
                      </div>
                      <div style={{ fontWeight: 700, color: '#065f46', fontSize: '1.1rem' }}>
                        {encounter.vital_signs?.temperatura || "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </Card.Body>
          </Card>

          {/* CARD ÓRDENES DE EXÁMENES */}
          <Card
            className="examenes-card"
            style={{
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            <Card.Body className="p-4">
              
              {/* HEADER CON BOTÓN */}
              <div className="d-flex justify-content-between align-items-center mb-4 pb-3 flex-wrap gap-3" style={{ borderBottom: '2px solid #e5e7eb' }}>
                <div className="d-flex align-items-center gap-3">
                  <div 
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    🧪
                  </div>
                  <div>
                    <h3 className="fw-bold mb-0" style={{ color: "#2c3e50", fontSize: '1.6rem' }}>
                      Órdenes de Exámenes
                    </h3>
                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                      {examOrders.length} {examOrders.length === 1 ? 'orden registrada' : 'órdenes registradas'}
                    </p>
                  </div>
                </div>

                <Button
                  className="solicitar-btn"
                  onClick={() => navigate(`/medico/examenes/nuevo/${encounter_id}`)}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  ➕ Solicitar Examen
                </Button>
              </div>

              {/* TABLA O EMPTY STATE */}
              {examOrders.length === 0 ? (
                <div className="text-center py-5">
                  <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>🧪</div>
                  <p style={{ color: '#9ca3af', fontWeight: 500, fontSize: '1rem' }}>
                    No existen órdenes de examen para esta historia clínica
                  </p>
                  <Button
                    variant="outline-primary"
                    onClick={() => navigate(`/medico/examenes/nuevo/${encounter_id}`)}
                    className="mt-3"
                    style={{
                      borderRadius: '10px',
                      padding: '10px 24px',
                      fontWeight: 600,
                      borderWidth: '2px',
                    }}
                  >
                    ➕ Crear primera orden
                  </Button>
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
                  <Table hover className="mb-0 orders-table">
                    <thead style={{ background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)' }}>
                      <tr>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>📋 ID Orden</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>📅 Fecha</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>🩺 Diagnóstico</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>🧪 Items</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>⚡ Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examOrders.map((order, index) => (
                        <tr 
                          key={order.order_id}
                          className="order-row"
                          style={{
                            animation: `fadeInRow 0.4s ease-out ${index * 0.1}s backwards`,
                          }}
                        >
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
                            {order.created_at ? new Date(order.created_at).toLocaleDateString('es-ES') : '—'}
                          </td>
                          <td style={{ padding: '1rem', color: '#6b7280' }}>
                            {order.diagnosis || "Sin diagnóstico"}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <Badge 
                              bg="warning"
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                padding: '5px 10px',
                                borderRadius: '6px',
                              }}
                            >
                              {order.items_count} {order.items_count === 1 ? 'examen' : 'exámenes'}
                            </Badge>
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
                              📄 Ver Detalle
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

          @keyframes fadeInRow {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* === CONTAINER === */
          .historia-detalle-container {
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

          /* === CARDS === */
          .historia-card {
            animation: slideInUp 0.6s ease-out 0.2s backwards;
          }

          .examenes-card {
            animation: slideInUp 0.6s ease-out 0.3s backwards;
          }

          /* === BOTONES === */
          .solicitar-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4) !important;
          }

          .solicitar-btn:active {
            transform: translateY(-1px);
          }

          .detail-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
          }

          .detail-btn:active {
            transform: translateY(-1px);
          }

          /* === TABLA === */
          .orders-table tbody tr {
            transition: all 0.3s ease;
            border-bottom: 1px solid #f3f4f6;
          }

          .orders-table tbody tr:hover {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            transform: scale(1.01);
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
          }

          /* === RESPONSIVE === */
          @media (max-width: 768px) {
            .header-section h3 {
              font-size: 1.4rem !important;
            }

            .orders-table {
              font-size: 0.85rem;
            }

            .orders-table th,
            .orders-table td {
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