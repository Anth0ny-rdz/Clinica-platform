import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Card, Form, Button, Alert } from "react-bootstrap"
import logoClinica from "@/assets/logo_clinica.png"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const authUser = await signIn(email, password)

      if (!authUser) {
        setError("⚠️ Credenciales inválidas o usuario sin rol asignado.")
        setLoading(false)
        return
      }

      switch (authUser.rol) {
        case "Administrador":
          navigate("/admin")
          break

        case "Médico":
          navigate("/medico")
          break

        case "Enfermeria":
          navigate("/enfermeria")
          break

        case "Recepcionista / Asistente administrativo":
          navigate("/recepcionista")
          break

        case "Paciente":
          navigate("/paciente")
          break

        case "Laboratorio":
          navigate("/laboratorio")
          break
          
        default:
          setError(`❌ Rol desconocido: ${authUser.rol}`)
      }
    } catch (err: any) {
      console.error("❌ Error al iniciar sesión:", err)
      setError("⚠️ Credenciales inválidas. Por favor, verifique su correo y contraseña.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="login-container"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* DECORACIÓN DE FONDO */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(60px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(60px)',
        }}
      />

      {/* CARD DE LOGIN */}
      <Card
        className="login-card"
        style={{
          borderRadius: '24px',
          border: 'none',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          maxWidth: '440px',
          width: '100%',
          animation: 'slideInUp 0.6s ease-out',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Card.Body className="p-5">
          
          {/* LOGO Y TÍTULO */}
          <div className="text-center mb-4">
            <div
              className="logo-wrapper"
              style={{
                display: 'inline-block',
                padding: '1rem',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            >
              <img
                src={logoClinica}
                alt="Logo Clínica Latacunga"
                className="img-fluid"
                style={{ 
                  maxWidth: "140px",
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                }}
              />
            </div>

            <h2 
              className="fw-bold mb-2" 
              style={{ 
                color: "#2c3e50", 
                fontSize: '1.8rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Clínica Latacunga
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: '0.95rem', fontWeight: 500 }}>
              Sistema de Gestión Clínica
            </p>
          </div>

          <div
            style={{
              height: '2px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '2px',
              marginBottom: '2rem',
            }}
          />

          {/* FORMULARIO */}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                ✉️ Correo Electrónico
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  padding: '12px 16px',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                🔑 Contraseña
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  padding: '12px 16px',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </Form.Group>

            <Button
              type="submit"
              disabled={loading}
              className="login-button"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                padding: '14px 24px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <div 
                    className="spinner-border spinner-border-sm" 
                    role="status"
                    style={{ width: '18px', height: '18px' }}
                  >
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <span>Ingresando...</span>
                </div>
              ) : (
                "🚀 Iniciar Sesión"
              )}
            </Button>
          </Form>

          {/* MENSAJE DE ERROR */}
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
                marginTop: '1.5rem',
                animation: 'slideInUp 0.4s ease-out',
              }}
              dismissible
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* FOOTER */}
          <div className="text-center mt-4">
            <p 
              className="text-muted mb-0" 
              style={{ 
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              © {new Date().getFullYear()} Clínica Latacunga
            </p>
            <p 
              className="text-muted mb-0" 
              style={{ 
                fontSize: '0.75rem',
              }}
            >
              Todos los derechos reservados
            </p>
          </div>
        </Card.Body>
      </Card>

      {/* ESTILOS */}
      <style>{`
        /* === ANIMACIONES === */
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        /* === LOGO WRAPPER === */
        .logo-wrapper {
          animation: pulse 3s ease-in-out infinite;
        }

        /* === LOGIN BUTTON === */
        .login-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5) !important;
          filter: brightness(1.1);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* === CARD HOVER === */
        .login-card {
          transition: all 0.3s ease;
        }

        .login-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 25px 70px rgba(0,0,0,0.35) !important;
        }

        /* === RESPONSIVE === */
        @media (max-width: 576px) {
          .login-card .p-5 {
            padding: 2rem !important;
          }

          .login-card h2 {
            font-size: 1.5rem !important;
          }

          .logo-wrapper img {
            max-width: 110px !important;
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

        /* === FOCUS VISIBLE === */
        .form-control:focus-visible {
          outline: 3px solid #667eea;
          outline-offset: 2px;
        }

        .login-button:focus-visible {
          outline: 3px solid #ffffff;
          outline-offset: 3px;
        }
      `}</style>
    </div>
  )
}