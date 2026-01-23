import { useNavigate } from "react-router-dom"
import { Button, Card } from "react-bootstrap"
import { ShieldX, Home } from "lucide-react"

export default function Unauthorized() {
  const navigate = useNavigate()

  return (
    <div
      className="unauthorized-container"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
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
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          filter: 'blur(60px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          filter: 'blur(60px)',
        }}
      />

      {/* CARD PRINCIPAL */}
      <Card
        className="unauthorized-card"
        style={{
          borderRadius: '24px',
          border: 'none',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          maxWidth: '500px',
          width: '100%',
          animation: 'slideInUp 0.6s ease-out',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Card.Body className="p-5 text-center">
          
          {/* ICONO */}
          <div
            className="icon-wrapper mb-4"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              marginBottom: '1.5rem',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            <ShieldX 
              size={60} 
              style={{ 
                color: '#dc2626',
                filter: 'drop-shadow(0 2px 4px rgba(220, 38, 38, 0.3))',
              }} 
            />
          </div>

          {/* TÍTULO */}
          <h1 
            className="fw-bold mb-3" 
            style={{ 
              color: "#dc2626", 
              fontSize: '2rem',
              textShadow: '0 2px 4px rgba(220, 38, 38, 0.1)',
            }}
          >
            🚫 Acceso Denegado
          </h1>

          {/* DESCRIPCIÓN */}
          <p 
            className="mb-4" 
            style={{ 
              color: '#6b7280',
              fontSize: '1rem',
              lineHeight: '1.6',
            }}
          >
            Lo sentimos, no tienes los permisos necesarios para acceder a esta sección del sistema.
          </p>

          <div
            style={{
              height: '2px',
              background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)',
              borderRadius: '2px',
              marginBottom: '2rem',
              maxWidth: '200px',
              margin: '0 auto 2rem auto',
            }}
          />

          {/* INFO ADICIONAL */}
          <div
            className="info-box mb-4"
            style={{
              background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              border: '2px solid #e3e6eb',
            }}
          >
            <p className="mb-2" style={{ fontSize: '0.9rem', color: '#374151', fontWeight: 600 }}>
              💡 ¿Qué puedes hacer?
            </p>
            <ul 
              className="mb-0 text-start" 
              style={{ 
                fontSize: '0.85rem', 
                color: '#6b7280',
                paddingLeft: '1.5rem',
              }}
            >
              <li>Verifica que hayas iniciado sesión con la cuenta correcta</li>
              <li>Contacta al administrador del sistema si necesitas acceso</li>
              <li>Regresa a tu panel de inicio</li>
            </ul>
          </div>

          {/* BOTONES */}
          <div className="d-flex flex-column gap-2">
            <Button
              onClick={() => navigate(-1)}
              className="action-btn"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              ← Volver Atrás
            </Button>

            <Button
              onClick={() => navigate("/")}
              variant="outline-secondary"
              className="outline-btn"
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: 600,
                border: '2px solid #e5e7eb',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Home size={18} />
              Ir al Inicio
            </Button>
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

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        /* === ICON WRAPPER === */
        .icon-wrapper:hover {
          animation: shake 0.6s ease-in-out;
        }

        /* === CARD HOVER === */
        .unauthorized-card {
          transition: all 0.3s ease;
        }

        .unauthorized-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 25px 70px rgba(0,0,0,0.2) !important;
        }

        /* === INFO BOX === */
        .info-box {
          transition: all 0.3s ease;
        }

        .info-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        /* === BOTONES === */
        .action-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          filter: brightness(1.1);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4) !important;
        }

        .action-btn:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .outline-btn:hover {
          background: #f8f9fb !important;
          border-color: #667eea !important;
          color: #667eea !important;
          transform: translateY(-2px);
        }

        .outline-btn:active {
          transform: translateY(0);
        }

        /* === RESPONSIVE === */
        @media (max-width: 576px) {
          .unauthorized-card .p-5 {
            padding: 2rem !important;
          }

          .unauthorized-card h1 {
            font-size: 1.5rem !important;
          }

          .icon-wrapper {
            width: 100px !important;
            height: 100px !important;
          }

          .icon-wrapper svg {
            width: 50px !important;
            height: 50px !important;
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
        .action-btn:focus-visible,
        .outline-btn:focus-visible {
          outline: 3px solid #667eea;
          outline-offset: 3px;
        }
      `}</style>
    </div>
  )
}