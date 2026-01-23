import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spinner, Button, Alert, Badge } from "react-bootstrap";
import { fetchExamItemDetail } from "@/services/labService";

export default function DetalleItem() {
  const { item_id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadItem();
  }, []);

  async function loadItem() {
    try {
      setLoading(true);
      const data = await fetchExamItemDetail(Number(item_id));
      console.log("📌 Item recibido:", data);
      setItem(data);
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Error cargando el examen");
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
          minHeight: "100vh",
          padding: 0,
          margin: 0,
        }}
      >
        <div style={{ padding: '2rem 1rem' }}>
          <div className="mx-auto" style={{ maxWidth: 1100 }}>
            <div className="skeleton" style={{ height: '40px', width: '150px', marginBottom: '1.5rem', borderRadius: '8px' }}></div>
            
            <Card style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
              <Card.Body className="p-4">
                <div className="skeleton" style={{ height: '32px', width: '200px', marginBottom: '1rem', borderRadius: '8px' }}></div>
                <div className="skeleton" style={{ height: '20px', width: '300px', marginBottom: '2rem', borderRadius: '8px' }}></div>
                
                <div className="skeleton" style={{ height: '150px', width: '100%', marginBottom: '1.5rem', borderRadius: '12px' }}></div>
                <div className="skeleton" style={{ height: '150px', width: '100%', marginBottom: '1.5rem', borderRadius: '12px' }}></div>
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
    );
  }

  if (!item) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
          minHeight: "100vh",
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
            <div>{message || "Item no encontrado."}</div>
          </Alert>
        </div>
      </div>
    );
  }

  // Identificar tipo de archivo
  const resultUrl = item.result_url || null;
  let isPDF = false;
  let isImage = false;

  if (resultUrl) {
    const lower = resultUrl.toLowerCase();
    isPDF = lower.includes(".pdf");
    isImage =
      lower.includes(".png") ||
      lower.includes(".jpg") ||
      lower.includes(".jpeg") ||
      lower.includes(".webp");
  }

  return (
    <div
      className="detalle-item-container"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        minHeight: "100vh",
        padding: 0,
        margin: 0,
      }}
    >
      <div style={{ padding: '2rem 1rem' }}>
        <div className="mx-auto content-wrapper" style={{ maxWidth: 1100 }}>
          
          {/* BOTÓN VOLVER MEJORADO */}
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
            Volver a exámenes
          </Button>

          <Card
            className="main-card"
            style={{
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            <Card.Body className="p-4">

              {/* ================= HEADER MEJORADO ================= */}
              <div className="header-section mb-4 pb-4" style={{ borderBottom: '2px solid #e5e7eb' }}>
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span style={{ fontSize: '2rem' }}>🧪</span>
                      <h3 className="fw-bold mb-0" style={{ color: "#2c3e50", fontSize: '1.8rem' }}>
                        Examen #{item.item_id}
                      </h3>
                    </div>
                    <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                      Detalle completo del examen de laboratorio
                    </p>
                  </div>
                  
                  {/* Badge de estado SIN PULSE */}
                  <Badge 
                    bg={item.status === "completado" ? "success" : "warning"}
                    className="status-badge"
                    style={{
                      fontSize: '1rem',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.status === "completado" ? "✓ Completado" : "⏳ Pendiente"}
                  </Badge>
                </div>
              </div>

              {/* ================= DATOS PACIENTE MEJORADOS ================= */}
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
                  Información del paciente
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
                          {item.patient_name}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="info-item">
                        <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Cédula
                        </span>
                        <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>
                          {item.patient_doc_id}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= DATOS MÉDICO MEJORADOS ================= */}
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
                  Solicitud médica
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
                          Médico solicitante
                        </span>
                        <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>
                          {item.doctor_name}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="info-item">
                        <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Especialidad
                        </span>
                        <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>
                          {item.especialidad}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= DATOS EXAMEN MEJORADOS (SIN PULSE) ================= */}
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
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    🔬
                  </div>
                  Detalles del examen
                </div>

                <div
                  className="exam-details-card"
                  style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    padding: '1.5rem',
                    borderRadius: '14px',
                    border: '2px solid #fbbf24',
                    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.2)',
                  }}
                >
                  <div className="mb-3">
                    <span style={{ color: '#92400e', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Tipo de examen
                    </span>
                    <div style={{ color: '#78350f', fontSize: '1.1rem', fontWeight: 700, marginTop: '4px' }}>
                      {item.exam_type_name}
                    </div>
                  </div>

                  <div className="mb-0">
                    <span style={{ color: '#92400e', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Descripción
                    </span>
                    <div style={{ color: '#78350f', fontSize: '0.95rem', marginTop: '4px', lineHeight: '1.6' }}>
                      {item.exam_type_description || "Sin descripción disponible"}
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= RESULTADO MEJORADO ================= */}
              {item.status === "completado" && resultUrl && (
                <div className="result-section mb-4">
                  <div 
                    className="section-title mb-3"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '1.2rem',
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
                      📄
                    </div>
                    Resultado del examen
                  </div>

                  {/* PDF */}
                  {isPDF && (
                    <div className="result-content">
                      <div
                        style={{
                          border: "2px solid #e3e6eb",
                          borderRadius: "14px",
                          overflow: "hidden",
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      >
                        <iframe
                          src={resultUrl}
                          style={{
                            width: "100%",
                            height: "600px",
                            border: "none",
                          }}
                          title="Resultado PDF"
                        />
                      </div>

                      <Button
                        className="download-btn mt-3"
                        href={resultUrl}
                        target="_blank"
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '10px',
                          fontWeight: 600,
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        📥 Descargar PDF
                      </Button>
                    </div>
                  )}

                  {/* IMAGEN */}
                  {isImage && (
                    <div className="result-content">
                      <div
                        style={{
                          textAlign: "center",
                          background: "#fff",
                          border: "2px solid #e3e6eb",
                          borderRadius: "14px",
                          padding: "1.5rem",
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      >
                        <img
                          src={resultUrl}
                          alt="Resultado examen"
                          style={{
                            maxWidth: "100%",
                            borderRadius: "10px",
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          }}
                        />
                      </div>

                      <Button
                        className="download-btn mt-3"
                        href={resultUrl}
                        target="_blank"
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '10px',
                          fontWeight: 600,
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        🔍 Ver imagen completa
                      </Button>
                    </div>
                  )}

                  {/* OTRO */}
                  {!isPDF && !isImage && (
                    <Alert 
                      variant="info"
                      style={{
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                        color: '#1e40af',
                        padding: '1.25rem',
                        fontWeight: 500,
                      }}
                    >
                      <div style={{ marginBottom: '0.5rem' }}>
                        ℹ️ Tipo de archivo no soportado para vista previa.
                      </div>
                      <a 
                        href={resultUrl} 
                        target="_blank"
                        style={{
                          color: '#1e40af',
                          fontWeight: 600,
                          textDecoration: 'underline',
                        }}
                      >
                        📥 Descargar archivo
                      </a>
                    </Alert>
                  )}
                </div>
              )}

              {/* ================= SUBIR RESULTADO MEJORADO ================= */}
              {item.status === "pendiente" && (
                <div className="text-end mt-4 pt-4" style={{ borderTop: '2px solid #e5e7eb' }}>
                  <Button
                    className="upload-btn"
                    onClick={() =>
                      navigate(`/laboratorio/item/${item.item_id}/subir`)
                    }
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      padding: '14px 28px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      fontSize: '1.05rem',
                      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    📤 Subir resultado del examen
                  </Button>
                </div>
              )}

            </Card.Body>
          </Card>
        </div>
      </div>

      {/* ESTILOS (SIN PULSE) */}
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
          .detalle-item-container {
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

          /* === CARD PRINCIPAL === */
          .main-card {
            animation: slideInUp 0.6s ease-out 0.2s backwards;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .main-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 48px rgba(0,0,0,0.12) !important;
          }

          /* === SECCIONES === */
          .header-section {
            animation: fadeIn 0.6s ease-out 0.3s backwards;
          }

          .info-section {
            animation: slideInUp 0.5s ease-out backwards;
          }

          .info-section:nth-child(2) { animation-delay: 0.4s; }
          .info-section:nth-child(3) { animation-delay: 0.5s; }
          .info-section:nth-child(4) { animation-delay: 0.6s; }

          .result-section {
            animation: slideInUp 0.5s ease-out 0.7s backwards;
          }

          /* === CARDS === */
          .info-card {
            transition: all 0.3s ease;
          }

          .info-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.08);
          }

          /* === BOTONES === */
          .download-btn:hover,
          .upload-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4) !important;
          }

          .upload-btn:hover {
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4) !important;
          }

          .download-btn:active,
          .upload-btn:active {
            transform: translateY(-1px);
          }

          /* === RESPONSIVE === */
          @media (max-width: 768px) {
            .section-title {
              font-size: 1rem !important;
            }

            .section-title > div {
              width: 35px !important;
              height: 35px !important;
            }

            .header-section h3 {
              font-size: 1.4rem !important;
            }

            .info-card,
            .exam-details-card {
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
    </div>
  );
}