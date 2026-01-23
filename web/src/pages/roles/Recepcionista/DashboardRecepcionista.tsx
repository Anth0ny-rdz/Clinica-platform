import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, Row, Col, Alert } from "react-bootstrap"
import { CalendarDays, BedDouble, Users } from "lucide-react"
import { fetchPatientsCountToday, fetchAppointmentsCountToday, fetchAvailableRoomsCount } from "@/services/dashboardService"
import logoClinica from "@/assets/logo_clinica.png"

export default function DashboardRecepcionista() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resumen, setResumen] = useState({
    pacientesHoy: 0,
    citasHoy: 0,
    habitacionesDisponibles: 0,
  })

  useEffect(() => {
    window.scrollTo(0, 0)

    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const [patientsData, appointmentsData, roomsData] = await Promise.all([
          fetchPatientsCountToday(),
          fetchAppointmentsCountToday(),
          fetchAvailableRoomsCount(),
        ])

        setResumen({
          pacientesHoy: patientsData.count || 0,
          citasHoy: appointmentsData.count || 0,
          habitacionesDisponibles: roomsData.count || 0,
        })
      } catch (err: any) {
        console.error("Error cargando dashboard:", err)
        setError("⚠️ No se pudieron cargar los datos del servidor.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  /* =============================
     RENDER - LOADING STATE
  ============================= */
  if (loading) {
    return (
      <div
        className="dashboard-recepcionista-container"
        style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
          minHeight: '100vh',
          padding: 0,
          margin: 0,
        }}
      >
        <div style={{ padding: '2rem 1rem' }}>
          <div className="mx-auto content-wrapper" style={{ maxWidth: 1200 }}>
            <div className="text-center mb-4">
              <div className="skeleton" style={{ height: '80px', width: '180px', margin: '0 auto', borderRadius: '12px' }}></div>
            </div>
            <div className="skeleton" style={{ height: '60px', width: '300px', marginBottom: '1rem', borderRadius: '12px' }}></div>
            <div className="skeleton" style={{ height: '30px', width: '400px', marginBottom: '3rem', borderRadius: '8px' }}></div>
            <Row className="g-4 mb-5">
              <Col md={4}>
                <div className="skeleton" style={{ height: '150px', borderRadius: '20px' }}></div>
              </Col>
              <Col md={4}>
                <div className="skeleton" style={{ height: '150px', borderRadius: '20px' }}></div>
              </Col>
              <Col md={4}>
                <div className="skeleton" style={{ height: '150px', borderRadius: '20px' }}></div>
              </Col>
            </Row>
            <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: '2rem', borderRadius: '12px' }}></div>
            <Row className="g-4">
              <Col md={4}>
                <div className="skeleton" style={{ height: '180px', borderRadius: '20px' }}></div>
              </Col>
              <Col md={4}>
                <div className="skeleton" style={{ height: '180px', borderRadius: '20px' }}></div>
              </Col>
              <Col md={4}>
                <div className="skeleton" style={{ height: '180px', borderRadius: '20px' }}></div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    )
  }

  /* =============================
     RENDER PRINCIPAL
  ============================= */
  return (
    <div
      className="dashboard-recepcionista-container"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        minHeight: '100vh',
        padding: 0,
        margin: 0,
      }}
    >
      <div style={{ padding: '2rem 1rem' }}>
        <div className="mx-auto content-wrapper" style={{ maxWidth: 1200 }}>
          
          {/* LOGO */}
          <div className="text-center mb-4" style={{ animation: 'fadeIn 0.6s ease-out' }}>
            <img
              src={logoClinica}
              alt="Logo Clínica Latacunga"
              className="img-fluid"
              style={{ 
                maxWidth: "180px",
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))',
              }}
            />
          </div>

          {/* HEADER */}
          <div className="header-section mb-4 pb-3" style={{ borderBottom: '2px solid #e5e7eb' }}>
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
                👋
              </div>
              <div>
                <h3 className="fw-bold mb-0" style={{ color: "#2c3e50", fontSize: '1.8rem' }}>
                  Bienvenido(a), Recepcionista
                </h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                  Resumen general del día en la Clínica Latacunga
                </p>
              </div>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <Alert 
              variant="danger"
              style={{
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                color: '#991b1b',
                fontWeight: 500,
                padding: '1rem 1.25rem',
                animation: 'slideInUp 0.4s ease-out',
              }}
              dismissible
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* TARJETAS DE RESUMEN */}
          {!error && (
            <>
              <Row className="g-4 mb-5">
                {/* PACIENTES HOY */}
                <Col md={4}>
                  <Card
                    className="stat-card"
                    style={{
                      borderRadius: '20px',
                      border: 'none',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                      overflow: 'hidden',
                      animation: 'slideInUp 0.6s ease-out 0.1s backwards',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-start justify-content-between mb-3">
                        <div>
                          <p 
                            className="mb-1" 
                            style={{ 
                              color: '#6b7280', 
                              fontSize: '0.85rem', 
                              fontWeight: 600, 
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            Pacientes Hoy
                          </p>
                          <h2 
                            className="fw-bold mb-0" 
                            style={{ 
                              fontSize: '2.5rem',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}
                          >
                            {resumen.pacientesHoy}
                          </h2>
                        </div>
                        <div
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                          }}
                        >
                          <Users size={30} color="white" />
                        </div>
                      </div>
                      <div
                        style={{
                          height: '4px',
                          borderRadius: '4px',
                          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                          marginTop: '1rem',
                        }}
                      ></div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* CITAS HOY */}
                <Col md={4}>
                  <Card
                    className="stat-card"
                    style={{
                      borderRadius: '20px',
                      border: 'none',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                      overflow: 'hidden',
                      animation: 'slideInUp 0.6s ease-out 0.2s backwards',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-start justify-content-between mb-3">
                        <div>
                          <p 
                            className="mb-1" 
                            style={{ 
                              color: '#6b7280', 
                              fontSize: '0.85rem', 
                              fontWeight: 600, 
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            Citas Agendadas
                          </p>
                          <h2 
                            className="fw-bold mb-0" 
                            style={{ 
                              fontSize: '2.5rem',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}
                          >
                            {resumen.citasHoy}
                          </h2>
                        </div>
                        <div
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                          }}
                        >
                          <CalendarDays size={30} color="white" />
                        </div>
                      </div>
                      <div
                        style={{
                          height: '4px',
                          borderRadius: '4px',
                          background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                          marginTop: '1rem',
                        }}
                      ></div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* HABITACIONES DISPONIBLES */}
                <Col md={4}>
                  <Card
                    className="stat-card"
                    style={{
                      borderRadius: '20px',
                      border: 'none',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                      overflow: 'hidden',
                      animation: 'slideInUp 0.6s ease-out 0.3s backwards',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-start justify-content-between mb-3">
                        <div>
                          <p 
                            className="mb-1" 
                            style={{ 
                              color: '#6b7280', 
                              fontSize: '0.85rem', 
                              fontWeight: 600, 
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            Habitaciones Disponibles
                          </p>
                          <h2 
                            className="fw-bold mb-0" 
                            style={{ 
                              fontSize: '2.5rem',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}
                          >
                            {resumen.habitacionesDisponibles}
                          </h2>
                        </div>
                        <div
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                          }}
                        >
                          <BedDouble size={30} color="white" />
                        </div>
                      </div>
                      <div
                        style={{
                          height: '4px',
                          borderRadius: '4px',
                          background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                          marginTop: '1rem',
                        }}
                      ></div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* ACCESOS RÁPIDOS */}
              <div 
                className="section-title mb-4"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: '#374151',
                  animation: 'slideInUp 0.6s ease-out 0.4s backwards',
                }}
              >
                <div 
                  style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  }}
                >
                  🚀
                </div>
                Accesos Rápidos
              </div>

              <Row className="g-4">
                {/* GESTIONAR USUARIOS */}
                <Col md={4}>
                  <Card
                    className="access-card"
                    onClick={() => navigate("/recepcionista/usuarios")}
                    style={{
                      borderRadius: '20px',
                      border: 'none',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      animation: 'slideInUp 0.6s ease-out 0.5s backwards',
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fb 100%)',
                    }}
                  >
                    <Card.Body className="p-4">
                      <div className="text-center">
                        <div
                          className="icon-wrapper mb-3"
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <Users size={40} color="white" />
                        </div>
                        <h5 
                          className="fw-bold mb-2" 
                          style={{ 
                            color: '#2c3e50',
                            fontSize: '1.2rem',
                          }}
                        >
                          Gestionar Usuarios
                        </h5>
                        <p 
                          className="text-muted mb-0" 
                          style={{ fontSize: '0.9rem' }}
                        >
                          Administrar pacientes y usuarios del sistema
                        </p>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* VER CITAS */}
                <Col md={4}>
                  <Card
                    className="access-card"
                    onClick={() => navigate("/recepcionista/citas")}
                    style={{
                      borderRadius: '20px',
                      border: 'none',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      animation: 'slideInUp 0.6s ease-out 0.6s backwards',
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fb 100%)',
                    }}
                  >
                    <Card.Body className="p-4">
                      <div className="text-center">
                        <div
                          className="icon-wrapper mb-3"
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <CalendarDays size={40} color="white" />
                        </div>
                        <h5 
                          className="fw-bold mb-2" 
                          style={{ 
                            color: '#2c3e50',
                            fontSize: '1.2rem',
                          }}
                        >
                          Ver Citas
                        </h5>
                        <p 
                          className="text-muted mb-0" 
                          style={{ fontSize: '0.9rem' }}
                        >
                          Gestionar y agendar citas médicas
                        </p>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* HABITACIONES */}
                <Col md={4}>
                  <Card
                    className="access-card"
                    onClick={() => navigate("/recepcionista/habitaciones")}
                    style={{
                      borderRadius: '20px',
                      border: 'none',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      animation: 'slideInUp 0.6s ease-out 0.7s backwards',
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fb 100%)',
                    }}
                  >
                    <Card.Body className="p-4">
                      <div className="text-center">
                        <div
                          className="icon-wrapper mb-3"
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <BedDouble size={40} color="white" />
                        </div>
                        <h5 
                          className="fw-bold mb-2" 
                          style={{ 
                            color: '#2c3e50',
                            fontSize: '1.2rem',
                          }}
                        >
                          Habitaciones
                        </h5>
                        <p 
                          className="text-muted mb-0" 
                          style={{ fontSize: '0.9rem' }}
                        >
                          Consultar disponibilidad de habitaciones
                        </p>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}

        </div>
      </div>

      {/* ESTILOS */}
      <style>{`
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

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* === SKELETON === */
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s ease-in-out infinite;
        }

        /* === STAT CARDS HOVER === */
        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.15) !important;
        }

        /* === ACCESS CARDS HOVER === */
        .access-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.15) !important;
        }

        .access-card:hover .icon-wrapper {
          transform: scale(1.1) rotate(5deg);
        }

        .access-card:active {
          transform: translateY(-4px);
        }

        /* === RESPONSIVE === */
        @media (max-width: 768px) {
          .header-section h3 {
            font-size: 1.4rem !important;
          }

          .section-title {
            font-size: 1.1rem !important;
          }

          .content-wrapper {
            max-width: 100% !important;
          }

          .stat-card h2 {
            font-size: 2rem !important;
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
      `}</style>
    </div>
  )
}