import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spinner, Button, Alert, Badge } from "react-bootstrap";

import { getSignedResultUrl } from "@/services/labService";
import { fetchExamResultsByItem } from "@/services/examService";

export default function ResultadoExamen() {
  const { item_id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState<any>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadResult();
  }, []);

  async function loadResult() {
    try {
      setLoading(true);

      const data = await fetchExamResultsByItem(Number(item_id));

      if (!data || data.length === 0) {
        setMessage("⚠️ No existen resultados para este examen.");
        return;
      }

      const first = data[0];
      setResult(first);

      // Obtener URL firmada desde backend
      const signed = await getSignedResultUrl(Number(item_id));
      setSignedUrl(signed.url);

    } catch (err: any) {
      console.error(err);
      setMessage("❌ Error cargando resultados.");
    } finally {
      setLoading(false);
    }
  }

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
                Cargando resultado del examen...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Decodificar extensión
  const isPDF = signedUrl?.toLowerCase().includes(".pdf");
  const isImage =
    signedUrl?.toLowerCase().includes(".png") ||
    signedUrl?.toLowerCase().includes(".jpg") ||
    signedUrl?.toLowerCase().includes(".jpeg") ||
    signedUrl?.toLowerCase().includes(".webp");

  return (
    <div
      className="resultado-examen-container"
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
            className="main-card"
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
                <div className="d-flex align-items-center gap-3">
                  <div 
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    🧪
                  </div>
                  <div>
                    <h3 className="fw-bold mb-1" style={{ color: "#2c3e50", fontSize: '1.8rem' }}>
                      Resultado del Examen
                    </h3>
                    <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                      Visualización del resultado de laboratorio
                    </p>
                  </div>
                </div>
              </div>

              {/* MENSAJE DE ADVERTENCIA */}
              {message && (
                <Alert 
                  variant={message.startsWith("⚠️") ? "warning" : "danger"}
                  style={{
                    borderRadius: '12px',
                    border: 'none',
                    background: message.startsWith("⚠️")
                      ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                      : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                    color: message.startsWith("⚠️") ? '#92400e' : '#991b1b',
                    fontWeight: 500,
                    padding: '1.25rem',
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: '1.5rem' }}>
                      {message.startsWith("⚠️") ? "⚠️" : "❌"}
                    </span>
                    <span>{message}</span>
                  </div>
                </Alert>
              )}

              {/* INFORMACIÓN DEL RESULTADO */}
              {result && signedUrl && (
                <>
                  <div 
                    className="result-info mb-4"
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
                            👤 Subido por
                          </span>
                          <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>
                            Usuario #{result.uploaded_by}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="info-item">
                          <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            📅 Fecha de carga
                          </span>
                          <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>
                            {result.uploaded_at ? new Date(result.uploaded_at).toLocaleString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VISUALIZACIÓN DEL ARCHIVO */}
                  <div className="file-viewer">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h5 className="fw-bold mb-0" style={{ color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📄</span>
                        Documento del resultado
                      </h5>
                      <Badge 
                        bg={isPDF ? "danger" : isImage ? "info" : "secondary"}
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          padding: '6px 12px',
                          borderRadius: '8px',
                        }}
                      >
                        {isPDF ? "PDF" : isImage ? "Imagen" : "Archivo"}
                      </Badge>
                    </div>

                    {/* PDF VIEWER */}
                    {isPDF && (
                      <div className="pdf-viewer">
                        <div
                          style={{
                            border: "2px solid #e5e7eb",
                            borderRadius: "14px",
                            overflow: "hidden",
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            marginBottom: '1rem',
                          }}
                        >
                          <iframe
                            src={signedUrl}
                            style={{
                              width: "100%",
                              height: "600px",
                              border: "none",
                            }}
                            title="Resultado PDF"
                          />
                        </div>

                        <Button
                          className="download-btn"
                          href={signedUrl}
                          target="_blank"
                          style={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '10px',
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          📥 Descargar PDF
                        </Button>
                      </div>
                    )}

                    {/* IMAGE VIEWER */}
                    {isImage && (
                      <div className="image-viewer">
                        <div
                          style={{
                            textAlign: "center",
                            background: "#fff",
                            border: "2px solid #e5e7eb",
                            borderRadius: "14px",
                            padding: "1.5rem",
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            marginBottom: '1rem',
                          }}
                        >
                          <img
                            src={signedUrl}
                            alt="Resultado examen"
                            style={{
                              maxWidth: "100%",
                              borderRadius: "10px",
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                          />
                        </div>

                        <Button
                          className="download-btn"
                          href={signedUrl}
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

                    {/* OTRO TIPO DE ARCHIVO */}
                    {!isPDF && !isImage && (
                      <Alert 
                        variant="info"
                        style={{
                          borderRadius: '12px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                          color: '#1e40af',
                          padding: '1.5rem',
                          fontWeight: 500,
                        }}
                      >
                        <div className="d-flex align-items-start gap-3">
                          <span style={{ fontSize: '2rem' }}>ℹ️</span>
                          <div>
                            <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
                              Tipo de archivo no soportado para vista previa
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                              Este formato de archivo no puede mostrarse directamente en el navegador.
                            </div>
                            <a 
                              href={signedUrl} 
                              target="_blank"
                              style={{
                                color: '#1e40af',
                                fontWeight: 600,
                                textDecoration: 'underline',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              📥 Descargar archivo
                            </a>
                          </div>
                        </div>
                      </Alert>
                    )}
                  </div>
                </>
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

          /* === CONTAINER === */
          .resultado-examen-container {
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

          /* === SECCIONES === */
          .header-section {
            animation: fadeIn 0.6s ease-out 0.3s backwards;
          }

          .result-info {
            animation: slideInUp 0.5s ease-out 0.4s backwards;
          }

          .file-viewer {
            animation: slideInUp 0.5s ease-out 0.5s backwards;
          }

          /* === BOTONES === */
          .download-btn:hover {
            transform: translateY(-3px);
            filter: brightness(1.1);
          }

          .download-btn:active {
            transform: translateY(-1px);
          }

          /* === RESPONSIVE === */
          @media (max-width: 768px) {
            .header-section h3 {
              font-size: 1.4rem !important;
            }

            .result-info,
            .file-viewer {
              padding: 1rem !important;
            }

            iframe {
              height: 400px !important;
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