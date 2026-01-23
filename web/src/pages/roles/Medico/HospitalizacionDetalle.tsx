import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spinner, Button, Modal, Form, Row, Col, Badge } from "react-bootstrap";
import { fetchAdmissionById, altaMedica } from "@/services/admissionService";

export default function HospitalizacionDetalle() {
  const { admission_id } = useParams();
  const navigate = useNavigate();
  const [admission, setAdmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [motivoAlta, setMotivoAlta] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchAdmissionById(Number(admission_id));
      setAdmission(data);
    } catch (err) {
      console.error("❌ Error obteniendo admisión:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toast profesional
  function showToast(message: string, type: "success" | "error" = "success") {
    const toast = document.createElement("div");

    toast.className = `toast align-items-center text-white border-0 show ${
      type === "success" ? "bg-success" : "bg-danger"
    }`;
    toast.role = "alert";
    toast.style.opacity = "0.95";
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;

    document.getElementById("toastArea")!.appendChild(toast);

    setTimeout(() => toast.remove(), 3500);
  }

  const handleAltaMedica = async () => {
    try {
      await altaMedica(Number(admission_id), { motivo_alta: motivoAlta });

      showToast("Alta médica registrada correctamente.", "success");
      setShowModal(false);

      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err) {
      console.error(err);
      showToast("Error al registrar alta.", "error");
    }
  };

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
          <div className="mx-auto" style={{ maxWidth: 1100 }}>
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
                Cargando información de hospitalización...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className="hospitalizacion-detalle-container"
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
                <div className="header-section mb-4 pb-3" style={{ borderBottom: '2px solid #e5e7eb' }}>
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
                        <h3 className="fw-bold mb-0" style={{ color: "#2c3e50", fontSize: '1.8rem' }}>
                          Detalles de Hospitalización
                        </h3>
                        <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                          Información completa del ingreso hospitalario
                        </p>
                      </div>
                    </div>

                    <Badge 
                      bg={admission.estado_ingreso === "activo" ? "success" : "info"}
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        padding: '10px 20px',
                        borderRadius: '10px',
                      }}
                    >
                      {admission.estado_ingreso === "activo" 
                        ? "✓ Activo" 
                        : admission.estado_ingreso === "alta_medica"
                        ? "📋 Alta Médica"
                        : admission.estado_ingreso}
                    </Badge>
                  </div>
                </div>

                {/* DATOS DEL PACIENTE */}
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
                    Datos del Paciente
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
                    <Row className="g-3">
                      <Col md={6}>
                        <div className="info-item">
                          <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Paciente
                          </span>
                          <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>
                            {admission.patients.names} {admission.patients.lastname}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Documento
                          </span>
                          <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>
                            {admission.patients.doc_id}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>

                {/* INFORMACIÓN DEL INGRESO */}
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
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                      }}
                    >
                      🏥
                    </div>
                    Información del Ingreso
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
                    <Row className="g-3">
                      <Col md={6}>
                        <div className="info-item">
                          <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            📅 Fecha de ingreso
                          </span>
                          <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>
                            {admission.fecha_ingreso ? new Date(admission.fecha_ingreso).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }) : '—'}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            🕐 Hora de ingreso
                          </span>
                          <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>
                            {admission.hora_ingreso || '—'}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            🚑 Tipo de ingreso
                          </span>
                          <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>
                            {admission.tipo_ingreso || '—'}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            🚪 Habitación
                          </span>
                          <Badge 
                            bg="info"
                            style={{
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              padding: '6px 12px',
                              borderRadius: '8px',
                              marginTop: '4px',
                              display: 'inline-block',
                            }}
                          >
                            {admission.habitacion_asignada}
                          </Badge>
                        </div>
                      </Col>
                      <Col md={12}>
                        <div className="info-item">
                          <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            📝 Razón de ingreso
                          </span>
                          <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: 500, marginTop: '4px', lineHeight: '1.6' }}>
                            {admission.razon_ingreso || '—'}
                          </div>
                        </div>
                      </Col>
                      <Col md={12}>
                        <div className="info-item">
                          <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            🩺 Diagnóstico
                          </span>
                          <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: 500, marginTop: '4px', lineHeight: '1.6' }}>
                            {admission.diagnostico_ingreso || '—'}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>

                {/* DATOS DEL ACOMPAÑANTE */}
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
                      👥
                    </div>
                    Datos del Acompañante
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
                    <Row className="g-3">
                      <Col md={4}>
                        <div className="info-item">
                          <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Nombre
                          </span>
                          <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>
                            {admission.persona_acompana || "No especificado"}
                          </div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="info-item">
                          <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Parentesco
                          </span>
                          <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>
                            {admission.parentesco_acompana || "No especificado"}
                          </div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="info-item">
                          <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            📞 Teléfono
                          </span>
                          <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>
                            {admission.telefono_acompana || "No especificado"}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>

                {/* SECCIÓN DE ALTA */}
                {admission.estado_ingreso === "activo" ? (
                  <div className="text-end pt-3" style={{ borderTop: '2px solid #e5e7eb' }}>
                    <Button 
                      className="alta-btn"
                      onClick={() => setShowModal(true)}
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        padding: '14px 32px',
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      ✓ Dar Alta Médica
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="alta-info"
                    style={{
                      background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: '2px solid #10b981',
                    }}
                  >
                    <p className="mb-3" style={{ color: '#065f46', fontWeight: 700, fontSize: '1.1rem' }}>
                      ✓ Este paciente ya fue dado de alta
                    </p>
                    {admission.fecha_alta && (
                      <Row className="g-3">
                        <Col md={6}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#047857', marginBottom: '4px' }}>
                            📅 Fecha de alta
                          </div>
                          <div style={{ fontWeight: 700, color: '#065f46', fontSize: '1rem' }}>
                            {admission.fecha_alta ? new Date(admission.fecha_alta).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }) : '—'}
                          </div>
                        </Col>
                        <Col md={6}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#047857', marginBottom: '4px' }}>
                            🕐 Hora de alta
                          </div>
                          <div style={{ fontWeight: 700, color: '#065f46', fontSize: '1rem' }}>
                            {admission.hora_alta || '—'}
                          </div>
                        </Col>
                        {admission.motivo_alta && (
                          <Col md={12}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#047857', marginBottom: '4px' }}>
                              📝 Motivo de alta
                            </div>
                            <div style={{ fontWeight: 500, color: '#065f46', fontSize: '1rem', lineHeight: '1.6' }}>
                              {admission.motivo_alta}
                            </div>
                          </Col>
                        )}
                      </Row>
                    )}
                  </div>
                )}

              </Card.Body>
            </Card>

          </div>
        </div>

        {/* MODAL ALTA MÉDICA */}
        <Modal 
          show={showModal} 
          onHide={() => setShowModal(false)}
          centered
        >
          <Modal.Header 
            closeButton
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              borderBottom: 'none',
            }}
          >
            <Modal.Title style={{ fontWeight: 700 }}>
              ✓ Dar Alta Médica
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="p-4">
            <Form.Group>
              <Form.Label style={{ fontWeight: 700, color: '#374151', marginBottom: '0.75rem' }}>
                📝 Motivo de Alta
              </Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4}
                value={motivoAlta}
                onChange={(e) => setMotivoAlta(e.target.value)}
                placeholder="Describa el motivo del alta médica..."
                required
                style={{
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  padding: '12px 16px',
                  fontSize: '1rem',
                }}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer style={{ borderTop: 'none' }}>
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowModal(false)}
              style={{
                borderRadius: '10px',
                padding: '10px 24px',
                fontWeight: 600,
                borderWidth: '2px',
              }}
            >
              Cancelar
            </Button>
            <Button 
              className="confirm-btn"
              onClick={handleAltaMedica}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '10px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              ✓ Confirmar Alta
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      {/* CONTENEDOR DEL TOAST */}
      <div
        className="toast-container position-fixed bottom-0 end-0 p-3"
        id="toastArea"
      />

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
          .hospitalizacion-detalle-container {
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

          /* === CARD === */
          .main-card {
            animation: slideInUp 0.6s ease-out 0.2s backwards;
          }

          /* === INFO CARDS === */
          .info-card {
            transition: all 0.3s ease;
          }

          .info-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.08);
          }

          /* === BOTONES === */
          .alta-btn:hover,
          .confirm-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5) !important;
          }

          .alta-btn:active,
          .confirm-btn:active {
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

            .info-card {
              padding: 1rem !important;
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
    </>
  );
}