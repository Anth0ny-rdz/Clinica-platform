import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spinner, Button, Table, Alert, Badge } from "react-bootstrap";

import { fetchExamOrderDetail } from "@/services/examService";

export default function DetalleOrdenExamen() {
  const { order_id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadOrder();
  }, []);

  async function loadOrder() {
    try {
      setLoading(true);
      const data = await fetchExamOrderDetail(Number(order_id));
      console.log("📌 DATA ORDEN --->", data);
      setOrder(data);
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Error cargando orden de examen");
    } finally {
      setLoading(false);
    }
  }

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

  if (!order) {
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
            <div>{message || "No se encontró la orden."}</div>
          </Alert>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      'pendiente': { bg: 'warning', text: '⏳ Pendiente' },
      'completado': { bg: 'success', text: '✓ Completado' },
      'realizado': { bg: 'success', text: '✓ Realizado' },
      'en_proceso': { bg: 'info', text: '🔄 En Proceso' },
    }
    return statusMap[status] || { bg: 'secondary', text: status }
  }

  return (
    <div
      className="detalle-orden-container"
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

          {/* CARD PRINCIPAL */}
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

              {/* HEADER */}
              <div className="header-section mb-4 pb-4" style={{ borderBottom: '2px solid #e5e7eb' }}>
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
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
                      <h3 className="fw-bold mb-1" style={{ color: "#2c3e50", fontSize: '1.8rem' }}>
                        Orden de Exámenes
                      </h3>
                      <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                        Detalle completo de la orden médica
                      </p>
                    </div>
                  </div>

                  <Badge 
                    bg="secondary"
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      padding: '10px 20px',
                      borderRadius: '10px',
                    }}
                  >
                    #{order.order_id}
                  </Badge>
                </div>
              </div>

              {/* INFO DEL PACIENTE */}
              <div className="info-section mb-4">
                <div 
                  className="section-title mb-3"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#374151',
                  }}
                >
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    }}
                  >
                    👤
                  </div>
                  Información del Paciente
                </div>

                <div 
                  className="info-card"
                  style={{
                    background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #e3e6eb',
                  }}
                >
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="info-item">
                        <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Paciente
                        </span>
                        <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>
                          {order.patient_name}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="info-item">
                        <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Cédula
                        </span>
                        <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>
                          {order.patient_doc_id}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* INFO DEL MÉDICO */}
              <div className="info-section mb-4">
                <div 
                  className="section-title mb-3"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#374151',
                  }}
                >
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    ⚕️
                  </div>
                  Información del Médico
                </div>

                <div 
                  className="info-card"
                  style={{
                    background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #e3e6eb',
                  }}
                >
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="info-item">
                        <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Médico
                        </span>
                        <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>
                          {order.doctor_name}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="info-item">
                        <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Especialidad
                        </span>
                        <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>
                          {order.especialidad}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="info-item">
                        <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Subespecialidad
                        </span>
                        <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>
                          {order.subespecialidad}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DETALLES DE LA ORDEN */}
              <div 
                className="order-details mb-4"
                style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  padding: '1.5rem',
                  borderRadius: '14px',
                  border: '2px solid #fbbf24',
                }}
              >
                <div className="row g-3">
                  <div className="col-md-4">
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
                        🚨 Prioridad
                      </div>
                      <Badge 
                        bg={order.priority === "Alta" ? "danger" : order.priority === "Media" ? "warning" : "secondary"}
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          padding: '6px 12px',
                          borderRadius: '8px',
                        }}
                      >
                        {order.priority}
                      </Badge>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
                        📅 Fecha de solicitud
                      </div>
                      <div style={{ fontWeight: 700, color: '#78350f', fontSize: '1rem' }}>
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }) : '—'}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
                        🧪 Total de exámenes
                      </div>
                      <div style={{ fontWeight: 700, color: '#78350f', fontSize: '1rem' }}>
                        {order.items?.length || 0} {order.items?.length === 1 ? 'examen' : 'exámenes'}
                      </div>
                    </div>
                  </div>

                  {order.observations && (
                    <div className="col-12 mt-3">
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
                        📝 Observaciones
                      </div>
                      <div style={{ fontWeight: 500, color: '#78350f', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        {order.observations}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </Card.Body>
          </Card>

          {/* TABLA DE EXÁMENES */}
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
              <div className="d-flex align-items-center gap-2 mb-4">
                <span style={{ fontSize: '1.5rem' }}>🧬</span>
                <h4 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>
                  Exámenes Solicitados
                </h4>
              </div>

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
                      <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>🔬 Examen</th>
                      <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>📊 Estado</th>
                      <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>⚡ Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item: any, index: number) => {
                      const statusInfo = getStatusBadge(item.status)
                      return (
                        <tr 
                          key={item.item_id}
                          className="exam-row"
                          style={{
                            animation: `fadeInRow 0.4s ease-out ${index * 0.1}s backwards`,
                          }}
                        >
                          <td style={{ padding: '1rem', fontWeight: 600, color: '#1f2937' }}>
                            {item.exam_type_name}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <Badge 
                              bg={statusInfo.bg}
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                padding: '6px 12px',
                                borderRadius: '8px',
                              }}
                            >
                              {statusInfo.text}
                            </Badge>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {(item.status === "completado" || item.status === "realizado") ? (
                              <Button
                                size="sm"
                                className="result-btn"
                                onClick={() => navigate(`/medico/examenes/resultado/${item.item_id}`)}
                                style={{
                                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                  border: 'none',
                                  padding: '8px 16px',
                                  borderRadius: '8px',
                                  fontWeight: 600,
                                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                  transition: 'all 0.3s ease',
                                }}
                              >
                                📄 Ver Resultados
                              </Button>
                            ) : (
                              <span style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                Sin resultados disponibles
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              </div>
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
          .detalle-orden-container {
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
          .main-card {
            animation: slideInUp 0.6s ease-out 0.2s backwards;
          }

          .exams-card {
            animation: slideInUp 0.6s ease-out 0.3s backwards;
          }

          .info-card {
            transition: all 0.3s ease;
          }

          .info-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.08);
          }

          /* === TABLA === */
          .exams-table tbody tr {
            transition: all 0.3s ease;
            border-bottom: 1px solid #f3f4f6;
          }

          .exams-table tbody tr:hover {
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            transform: scale(1.01);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
          }

          .result-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4) !important;
          }

          .result-btn:active {
            transform: translateY(-1px);
          }

          /* === RESPONSIVE === */
          @media (max-width: 768px) {
            .header-section h3 {
              font-size: 1.4rem !important;
            }

            .section-title {
              font-size: 1rem !important;
            }

            .section-title > div {
              width: 35px !important;
              height: 35px !important;
            }

            .info-card,
            .order-details {
              padding: 1rem !important;
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