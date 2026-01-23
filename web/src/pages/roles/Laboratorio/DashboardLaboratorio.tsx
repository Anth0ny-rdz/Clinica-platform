import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { fetchUserProfileId } from '@/services/userService'
import { useNavigate } from 'react-router-dom'

export default function DashboardLaboratorio() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.auth_id) return

      try {
        const data = await fetchUserProfileId(user.auth_id)
        setProfile(data)
      } catch (err) {
        console.error('Error cargando perfil de laboratorio:', err)
      }
    }

    loadProfile()
  }, [user])

  return (
    <div
      className="dashboard-laboratorio"
      style={{
        position: 'fixed',
        top: '77px',
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #e8ecf1 0%, #f5f7fa 100%)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '2rem 1rem',
      }}
    >
      {/* Elementos decorativos de fondo */}
      <div className="bg-decoration bg-decoration-1"></div>
      <div className="bg-decoration bg-decoration-2"></div>
      <div className="bg-decoration bg-decoration-3"></div>

      {/* Contenedor central */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', width: '100%', padding: '0 1rem' }}>
        {/* 🧪 Avatar mejorado (laboratorio) */}
        <div
          className="avatar-container"
          style={{
            width: 160,
            height: 160,
            background: 'linear-gradient(135deg, #e8e0ff 0%, #d4c5ff 100%)',
            borderRadius: '50%',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 10px 30px rgba(156, 122, 255, 0.3)',
            position: 'relative',
            border: '4px solid #ffffff',
            margin: '0 auto 2rem',
          }}
        >
          {/* Efecto de brillo */}
          <div className="avatar-shine"></div>

          {/* Cabeza */}
          <div
            className="avatar-head"
            style={{
              width: 60,
              height: 60,
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              border: '3px solid #9c7aff',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {/* Ojos */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              marginTop: '20px',
            }}>
              <div className="eye" style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#9c7aff',
                borderRadius: '50%',
              }}></div>
              <div className="eye" style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#9c7aff',
                borderRadius: '50%',
              }}></div>
            </div>
            {/* Sonrisa */}
            <div style={{
              width: '16px',
              height: '8px',
              border: '2px solid #9c7aff',
              borderTop: 'none',
              borderRadius: '0 0 16px 16px',
              margin: '4px auto 0',
            }}></div>
          </div>

          {/* Bata de laboratorio mejorada */}
          <div
            className="lab-coat"
            style={{
              position: 'absolute',
              bottom: 0,
              width: 110,
              height: 90,
              background: 'linear-gradient(180deg, #9c7aff 0%, #8561f0 100%)',
              borderRadius: '16px 16px 80px 80px',
              zIndex: 1,
              boxShadow: 'inset 0 -2px 8px rgba(0,0,0,0.1)',
            }}
          >
            {/* Botones de la bata */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              alignItems: 'center',
              paddingTop: '45px',
            }}>
              <div className="coat-button" style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                opacity: 0.8,
              }}></div>
              <div className="coat-button" style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                opacity: 0.8,
              }}></div>
            </div>
          </div>

          {/* Icono de tubo de ensayo flotante */}
          <div className="floating-icon" style={{
            position: 'absolute',
            top: '-10px',
            right: '10px',
            fontSize: '2rem',
          }}>
            🧪
          </div>
        </div>

        {/* Contenido principal */}
        <div className="content-wrapper" style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>
          {/* Texto de bienvenida */}
          <h1 
            className="welcome-title"
            style={{ 
              fontSize: '2.2rem', 
              marginBottom: '0.8rem',
              background: 'linear-gradient(135deg, #6a35ff 0%, #9c7aff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
            }}
          >
            🧪 Bienvenido(a) al Laboratorio
          </h1>

          {/* Nombre del usuario con loading state */}
          {profile ? (
            <h2 
              className="user-name"
              style={{ 
                color: '#6a35ff', 
                marginBottom: '2rem',
                fontSize: '1.5rem',
                fontWeight: 600,
              }}
            >
              {profile.name} {profile.lastname}
            </h2>
          ) : (
            <div className="loading-skeleton" style={{
              height: '36px',
              width: '280px',
              background: 'linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)',
              backgroundSize: '200% 100%',
              borderRadius: '8px',
              margin: '0 auto 2rem',
            }}></div>
          )}

          {/* Descripción mejorada */}
          <p 
            className="description"
            style={{ 
              fontSize: '1.1rem', 
              color: '#555', 
              lineHeight: '1.7',
              marginBottom: '2.5rem',
            }}
          >
            Esta es su pantalla principal. Desde aquí podrá procesar exámenes,
            revisar órdenes pendientes y registrar resultados.
          </p>

          {/* Cards de acceso rápido CON NAVEGACIÓN */}
          <div className="quick-access" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            marginTop: '2rem',
          }}>
            <div 
              className="access-card" 
              onClick={() => navigate('/laboratorio/pendientes')}
              style={{
                background: '#ffffff',
                padding: '1.5rem 1rem',
                borderRadius: '14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: '2px solid transparent',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
              <div style={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.95rem' }}>
                Órdenes Pendientes
              </div>
            </div>


            <div 
              className="access-card" 
              onClick={() => navigate('/laboratorio/completados')}
              style={{
                background: '#ffffff',
                padding: '1.5rem 1rem',
                borderRadius: '14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: '2px solid transparent',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
              <div style={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.95rem' }}>
                Resultados
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ESTILOS */}
      <style>
        {`
          /* === ANIMACIONES === */
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-15px);
            }
          }

          @keyframes floatSlow {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-10px) rotate(5deg);
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

          @keyframes shimmer {
            0% {
              background-position: -1000px 0;
            }
            100% {
              background-position: 1000px 0;
            }
          }

          @keyframes shine {
            0% {
              left: -100%;
            }
            100% {
              left: 100%;
            }
          }

          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          /* === DECORACIONES DE FONDO === */
          .bg-decoration {
            position: absolute;
            border-radius: 50%;
            opacity: 0.08;
            z-index: 0;
            pointer-events: none;
          }

          .bg-decoration-1 {
            width: 500px;
            height: 500px;
            background: linear-gradient(135deg, #9c7aff, #6a35ff);
            top: -150px;
            left: -150px;
            animation: float 8s ease-in-out infinite;
          }

          .bg-decoration-2 {
            width: 400px;
            height: 400px;
            background: linear-gradient(135deg, #6a35ff, #9c7aff);
            bottom: -120px;
            right: -120px;
            animation: float 10s ease-in-out infinite 2s;
          }

          .bg-decoration-3 {
            width: 300px;
            height: 300px;
            background: linear-gradient(135deg, #9c7aff, #d4c5ff);
            top: 40%;
            right: 5%;
            animation: float 12s ease-in-out infinite 4s;
          }

          /* === AVATAR === */
          .avatar-container {
            animation: fadeInUp 0.8s ease-out, pulse 3s ease-in-out infinite 2s;
          }

          .avatar-shine {
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.6),
              transparent
            );
            border-radius: 50%;
            animation: shine 3s ease-in-out infinite;
          }

          .avatar-head {
            animation: floatSlow 4s ease-in-out infinite;
          }

          .lab-coat {
            animation: float 3s ease-in-out infinite 1s;
          }

          .floating-icon {
            animation: float 2s ease-in-out infinite;
          }

          .eye {
            animation: pulse 2s ease-in-out infinite;
          }

          .coat-button {
            animation: pulse 2s ease-in-out infinite alternate;
          }

          /* === CONTENIDO === */
          .welcome-title {
            animation: fadeInUp 0.8s ease-out 0.2s backwards;
          }

          .user-name {
            animation: fadeInUp 0.8s ease-out 0.4s backwards;
          }

          .description {
            animation: fadeInUp 0.8s ease-out 0.6s backwards;
          }

          .loading-skeleton {
            animation: shimmer 1.5s infinite;
            background-size: 200% 100%;
          }

          /* === CARDS DE ACCESO === */
          .quick-access {
            animation: fadeInUp 0.8s ease-out 0.8s backwards;
          }

          .access-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            animation: slideInLeft 0.6s ease-out backwards;
          }

          .access-card:nth-child(1) {
            animation-delay: 0.9s;
          }

          .access-card:nth-child(2) {
            animation-delay: 1s;
          }

          .access-card:nth-child(3) {
            animation-delay: 1.1s;
          }

          .access-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 24px rgba(106, 53, 255, 0.2);
            border-color: #9c7aff;
          }

          .access-card:active {
            transform: translateY(-4px);
          }

          /* === RESPONSIVE === */
          @media (max-width: 768px) {
            .dashboard-laboratorio {
              padding: 1.5rem 1rem !important;
              top: 65px !important;
            }

            .welcome-title {
              font-size: 1.8rem !important;
            }

            .user-name {
              font-size: 1.3rem !important;
            }

            .description {
              font-size: 1rem !important;
            }

            .avatar-container {
              width: 140px !important;
              height: 140px !important;
            }

            .bg-decoration {
              opacity: 0.05 !important;
            }

            .quick-access {
              grid-template-columns: 1fr !important;
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

          /* === FOCUS === */
          .access-card:focus-visible {
            outline: 3px solid #6a35ff;
            outline-offset: 2px;
          }
        `}
      </style>
    </div>
  )
}