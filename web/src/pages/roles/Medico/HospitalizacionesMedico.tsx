import { useEffect, useState } from "react";
import { Table, Button, Spinner, Card, Badge } from "react-bootstrap";
import { fetchDoctorByAuth } from "@/services/doctorService";
import { fetchHospitalizacionesMedico } from "@/services/admissionService";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function HospitalizacionesMedico() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const auth_id = user?.auth_id;

  const [hospitalizaciones, setHospitalizaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // 1️⃣ Obtener doctor_profile a partir del AUTH_ID
      const doctor = await fetchDoctorByAuth(auth_id!);

      // 2️⃣ Obtener hospitalizaciones
      const data = await fetchHospitalizacionesMedico(doctor.doctor_profile_id);
      setHospitalizaciones(data);

    } catch (error) {
      console.error("❌ Error cargando hospitalizaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0) // Scroll al inicio
    if (!auth_id) return;
    cargarDatos();
  }, [auth_id]);

  // Loading
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
          <div className="mx-auto" style={{ maxWidth: 1400 }}>
            <div className="text-center py-5">
              <Spinner 
                animation="border" 
                style={{ 
                  width: '4rem', 
                  height: '4rem',
                  color: '#667eea',
                  borderWidth: '4px',
                }}
              />
              <p className="mt-3" style={{ fontWeight: 600, fontSize: '1.1rem', color: '#6b7280' }}>
                Cargando hospitalizaciones...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="hospitalizaciones-medico-container"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        minHeight: '100vh',
        padding: 0,
        margin: 0,
      }}
    >
      <div style={{ padding: '2rem 1rem' }}>
        <div className="mx-auto content-wrapper" style={{ maxWidth: 1400 }}>

          {/* HEADER */}
          <div className="header-section mb-4">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3">
                <div 
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  }}
                >
                  🏥
                </div>
                <div>
                  <h2 className="fw-bold mb-0" style={{ color: '#2c3e50', fontSize: '1.8rem' }}>
                    Pacientes Hospitalizados
                  </h2>
                  <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                    Pacientes bajo tu supervisión médica
                  </p>
                </div>
              </div>

              {hospitalizaciones.length > 0 && (
                <Badge 
                  bg="primary"
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    padding: '10px 20px',
                    borderRadius: '10px',
                  }}
                >
                  {hospitalizaciones.length} {hospitalizaciones.length === 1 ? 'paciente' : 'pacientes'}
                </Badge>
              )}
            </div>
          </div>

          {/* CARD CON TABLA */}
          <Card
            className="hospitalizations-card"
            style={{
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            <Card.Body className="p-4">

              {hospitalizaciones.length === 0 ? (
                <div className="text-center py-5">
                  <div style={{ fontSize: '5rem', marginBottom: '1.5rem', opacity: 0.3 }}>🏥</div>
                  <h5 className="mb-3" style={{ color: '#6b7280', fontWeight: 600 }}>
                    No hay pacientes hospitalizados
                  </h5>
                  <p className="text-muted" style={{ fontSize: '0.95rem' }}>
                    No tienes pacientes hospitalizados bajo tu cargo en este momento
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
                  <Table hover responsive className="mb-0 hospitalizaciones-table">
                    <thead style={{ background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)' }}>
                      <tr>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>👤 Paciente</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>🆔 Documento</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>📅 Ingreso</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>🚪 Habitación</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>📝 Razón</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>⚡ Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hospitalizaciones.map((adm, index) => (
                        <tr 
                          key={adm.admission_id}
                          className="hosp-row"
                          style={{
                            animation: `fadeInRow 0.4s ease-out ${index * 0.05}s backwards`,
                          }}
                        >
                          <td style={{ padding: '1rem', fontWeight: 600, color: '#1f2937' }}>
                            {adm.patients?.names} {adm.patients?.last_names}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <Badge 
                              bg="light"
                              text="dark"
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                              }}
                            >
                              {adm.patients?.doc_id}
                            </Badge>
                          </td>
                          <td style={{ padding: '1rem', color: '#6b7280' }}>
                            {adm.fecha_ingreso ? new Date(adm.fecha_ingreso).toLocaleDateString('es-ES') : '—'} {adm.hora_ingreso || ''}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <Badge 
                              bg="info"
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                padding: '6px 12px',
                                borderRadius: '8px',
                              }}
                            >
                              {adm.habitacion_asignada}
                            </Badge>
                          </td>
                          <td style={{ padding: '1rem', color: '#6b7280', maxWidth: '250px' }}>
                            {adm.razon_ingreso}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <Button
                              size="sm"
                              className="detail-btn"
                              onClick={() => navigate(`/medico/hospitalizaciondetalle/${adm.admission_id}`)}
                              style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                transition: 'all 0.3s ease',
                              }}
                            >
                              Ver detalles
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
          .hospitalizaciones-medico-container {
            animation: fadeIn 0.6s ease-out;
          }

          .content-wrapper {
            animation: fadeIn 0.7s ease-out 0.1s backwards;
          }

          /* === HEADER === */
          .header-section {
            animation: slideInUp 0.6s ease-out 0.2s backwards;
          }

          /* === CARD === */
          .hospitalizations-card {
            animation: slideInUp 0.6s ease-out 0.3s backwards;
          }

          /* === TABLA === */
          .hospitalizaciones-table tbody tr {
            transition: all 0.3s ease;
            border-bottom: 1px solid #f3f4f6;
          }

          .hospitalizaciones-table tbody tr:hover {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            transform: scale(1.01);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
          }

          .detail-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4) !important;
          }

          .detail-btn:active {
            transform: translateY(-1px);
          }

          /* === RESPONSIVE === */
          @media (max-width: 768px) {
            .header-section h2 {
              font-size: 1.4rem !important;
            }

            .hospitalizaciones-table {
              font-size: 0.85rem;
            }

            .hospitalizaciones-table th,
            .hospitalizaciones-table td {
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
  );
}