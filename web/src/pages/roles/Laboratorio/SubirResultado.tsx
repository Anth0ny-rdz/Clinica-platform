import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Form, Alert, Spinner, Badge } from "react-bootstrap";

import { uploadExamFile } from "@/services/storageService";
import { registerExamResult } from "@/services/labService";
import { fetchUserProfileId } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";

export default function SubirResultado() {
  const { item_id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [userProfileId, setUserProfileId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Obtener user_profile_id al cargar
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!user?.auth_id) {
          setMessage("❌ Usuario no autenticado.");
          return;
        }

        const profile = await fetchUserProfileId(user.auth_id);

        if (!profile?.user_profile_id) {
          return setMessage("❌ No se pudo obtener el ID del usuario.");
        }

        setUserProfileId(profile.user_profile_id);
      } catch (err) {
        console.error("🔥 [DEBUG] Error cargando perfil:", err);
      }
    };

    loadProfile();
  }, [user]);

  // Captura archivo
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] || null;
    console.log("📸 [DEBUG] Archivo seleccionado:", selected?.name);
    setFile(selected);
    setMessage(null); // Limpiar mensajes previos
  }

  // Eliminar archivo seleccionado
  function handleRemoveFile() {
    setFile(null);
    setMessage(null);
  }

  // Envío del formulario
  async function handleSubmit(e: any) {
    e.preventDefault();

    console.log("🟧 [DEBUG] handleSubmit iniciado…");

    if (!user) {
      console.log("❌ [DEBUG] user es null");
      return setMessage("❌ Usuario no autenticado.");
    }

    if (!userProfileId) {
      console.log("❌ [DEBUG] userProfileId null → no puedo registrar");
      return setMessage("❌ Error obteniendo ID del usuario.");
    }

    if (!file) {
      console.log("⚠️ [DEBUG] No hay archivo seleccionado");
      return setMessage("⚠️ Selecciona un archivo.");
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setMessage("📤 Subiendo archivo…");

      console.log("📤 [DEBUG] Enviando archivo al storage:", file.name);

      // Simular progreso (puedes implementar progreso real si tu API lo soporta)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // 1️⃣ SUBIR ARCHIVO
      const file_path = await uploadExamFile(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log("📁 [DEBUG] Storage devolvió file_path:", file_path);

      if (!file_path) {
        console.log("❌ [DEBUG] ERROR: file_path viene vacío");
        setMessage("❌ Error subiendo archivo al storage.");
        return;
      }

      // 2️⃣ REGISTRAR RESULTADO EN BACKEND
      console.log("📝 [DEBUG] Llamando a registerExamResult con:");
      console.log({
        item_id: Number(item_id),
        file_path,
        uploaded_by: userProfileId
      });

      const result = await registerExamResult(
        Number(item_id),
        file_path,
        userProfileId
      );

      console.log("🟢 [DEBUG] Respuesta de registerExamResult:", result);

      setMessage("✅ Resultado subido exitosamente");

      // 3️⃣ Redirigir después de éxito
      console.log("➡️ [DEBUG] Redirigiendo a detalle del item en 1.2s…");

      setTimeout(() => {
        navigate(`/laboratorio/item/${item_id}`);
      }, 1200);

    } catch (err: any) {
      console.error("🔥 [DEBUG] ERROR FINAL EN handleSubmit:", err);
      setMessage("❌ Error subiendo resultado: " + err.message);
      setUploadProgress(0);
    } finally {
      setUploading(false);
      console.log("🟩 [DEBUG] handleSubmit finalizado.");
    }
  }

  // Determinar tipo de archivo
  const getFileIcon = (fileName: string) => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.pdf')) return '📄';
    if (lower.match(/\.(jpg|jpeg|png|webp|gif)$/)) return '🖼️';
    return '📎';
  };

  const getFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div
      className="subir-resultado-container"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        minHeight: "100vh",
        padding: 0,
        margin: 0,
      }}
    >
      <div style={{ padding: '2rem 1rem' }}>
        <div className="mx-auto content-wrapper" style={{ maxWidth: 800 }}>
          
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
            Volver al detalle
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

              {/* ================= HEADER ================= */}
              <div className="header-section mb-4 pb-4" style={{ borderBottom: '2px solid #e5e7eb' }}>
                <div className="d-flex align-items-center gap-3 mb-2">
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
                    📤
                  </div>
                  <div>
                    <h3 className="fw-bold mb-1" style={{ color: "#2c3e50", fontSize: '1.8rem' }}>
                      Subir Resultado del Examen
                    </h3>
                    <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                      Examen #{item_id}
                    </p>
                  </div>
                </div>
              </div>

              {/* ================= MENSAJE ================= */}
              {message && (
                <Alert 
                  variant={message.startsWith("✅") ? "success" : message.startsWith("⚠️") ? "warning" : message.startsWith("📤") ? "info" : "danger"}
                  className="message-alert"
                  style={{
                    borderRadius: '12px',
                    border: 'none',
                    padding: '1rem 1.25rem',
                    fontWeight: 500,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                >
                  {message}
                </Alert>
              )}

              {/* ================= FORMULARIO ================= */}
              <Form onSubmit={handleSubmit}>

                {/* INSTRUCCIONES */}
                <div 
                  className="instructions-box mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #93c5fd',
                  }}
                >
                  <div className="d-flex align-items-start gap-2">
                    <span style={{ fontSize: '1.5rem' }}>💡</span>
                    <div>
                      <strong style={{ color: '#1e40af', display: 'block', marginBottom: '0.5rem' }}>
                        Instrucciones importantes
                      </strong>
                      <ul style={{ color: '#1e40af', margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                        <li>Formatos aceptados: PDF, JPG, PNG, WEBP</li>
                        <li>Tamaño máximo: 10 MB</li>
                        <li>Asegúrate de que el archivo sea legible</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* SELECTOR DE ARCHIVO */}
                <Form.Group className="mb-4">
                  <Form.Label 
                    style={{ 
                      fontWeight: 700, 
                      fontSize: '1rem', 
                      color: '#374151',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    📎 Seleccionar archivo
                  </Form.Label>
                  
                  <div
                    className="file-input-wrapper"
                    style={{
                      position: 'relative',
                      border: '2px dashed #cbd5e1',
                      borderRadius: '12px',
                      padding: '2rem',
                      textAlign: 'center',
                      background: file ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : '#f8f9fb',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.background = '#f0fdf4';
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.background = '#f8f9fb';
                    }}
                  >
                    <Form.Control
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={handleFileChange}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer',
                      }}
                      disabled={uploading}
                    />
                    
                    {!file ? (
                      <div>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
                        <p style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                          Click para seleccionar o arrastra el archivo aquí
                        </p>
                        <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
                          PDF, JPG, PNG o WEBP (máx. 10MB)
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
                        <p style={{ fontWeight: 600, color: '#059669', margin: 0 }}>
                          Archivo seleccionado correctamente
                        </p>
                      </div>
                    )}
                  </div>
                </Form.Group>

                {/* ARCHIVO SELECCIONADO */}
                {file && (
                  <div 
                    className="file-preview mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: '2px solid #10b981',
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            background: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          }}
                        >
                          {getFileIcon(file.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#059669', fontSize: '1rem' }}>
                            {file.name}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#047857' }}>
                            {getFileSize(file.size)}
                          </div>
                        </div>
                      </div>
                      
                      {!uploading && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={handleRemoveFile}
                          style={{
                            borderRadius: '8px',
                            fontWeight: 600,
                            padding: '6px 12px',
                          }}
                        >
                          🗑️ Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* BARRA DE PROGRESO */}
                {uploading && uploadProgress > 0 && (
                  <div className="progress-section mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        Subiendo archivo...
                      </span>
                      <Badge 
                        bg="primary"
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '6px',
                        }}
                      >
                        {uploadProgress}%
                      </Badge>
                    </div>
                    <div 
                      style={{
                        height: '12px',
                        background: '#e5e7eb',
                        borderRadius: '10px',
                        overflow: 'hidden',
                      }}
                    >
                      <div 
                        className="progress-bar-fill"
                        style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #10b981, #059669)',
                          width: `${uploadProgress}%`,
                          transition: 'width 0.3s ease',
                          borderRadius: '10px',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* BOTONES */}
                <div className="d-flex gap-3 justify-content-end mt-4 pt-3" style={{ borderTop: '2px solid #e5e7eb' }}>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate(-1)}
                    disabled={uploading}
                    style={{
                      borderRadius: '10px',
                      padding: '12px 24px',
                      fontWeight: 600,
                      border: '2px solid #e5e7eb',
                    }}
                  >
                    Cancelar
                  </Button>

                  <Button 
                    type="submit" 
                    disabled={!file || uploading}
                    className="submit-btn"
                    style={{
                      background: uploading 
                        ? '#6b7280' 
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      padding: '12px 28px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      boxShadow: uploading ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {uploading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Subiendo…
                      </>
                    ) : (
                      <>
                        💾 Guardar Resultado
                      </>
                    )}
                  </Button>
                </div>
              </Form>

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

          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }

          /* === CONTAINER === */
          .subir-resultado-container {
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

          .header-section {
            animation: fadeIn 0.6s ease-out 0.3s backwards;
          }

          /* === MENSAJE === */
          .message-alert {
            animation: slideInUp 0.4s ease-out;
          }

          /* === INSTRUCCIONES === */
          .instructions-box {
            animation: slideInUp 0.5s ease-out 0.4s backwards;
          }

          /* === FILE INPUT === */
          .file-input-wrapper:hover {
            border-color: #10b981 !important;
            background: #f0fdf4 !important;
            transform: scale(1.01);
          }

          /* === FILE PREVIEW === */
          .file-preview {
            animation: slideInUp 0.4s ease-out;
          }

          /* === PROGRESS BAR === */
          .progress-section {
            animation: slideInUp 0.3s ease-out;
          }

          .progress-bar-fill {
            position: relative;
            overflow: hidden;
          }

          .progress-bar-fill::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.3),
              transparent
            );
            animation: shimmer 1s infinite;
          }

          /* === BOTONES === */
          .submit-btn:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4) !important;
          }

          .submit-btn:active:not(:disabled) {
            transform: translateY(-1px);
          }

          .submit-btn:disabled {
            cursor: not-allowed;
            opacity: 0.7;
          }

          /* === RESPONSIVE === */
          @media (max-width: 768px) {
            .header-section h3 {
              font-size: 1.4rem !important;
            }

            .file-input-wrapper {
              padding: 1.5rem !important;
            }

            .d-flex.gap-3.justify-content-end {
              flex-direction: column !important;
            }

            .d-flex.gap-3.justify-content-end button {
              width: 100% !important;
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