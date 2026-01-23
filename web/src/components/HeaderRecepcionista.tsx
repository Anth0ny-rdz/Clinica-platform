import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import LogoutButton from '@/components/LogoutButton'
import {
  Menu,
  X,
  Home,
  Users,
  Calendar,
  BedDouble,
  Hospital,
  User
} from 'lucide-react'
import logoClinica from "@/assets/logo_clinica.png"

export default function HeaderRecepcionista() {
  const { user } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      {/* HEADER */}
      <header
        className="header-recepcionista"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        {/* IZQUIERDA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img
            src={logoClinica}
            alt="Logo Clínica Latacunga"
            style={{
              maxHeight: '45px',
              width: 'auto',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}
          />
          <h2 
            style={{ 
              margin: 0, 
              fontSize: '1.2rem',
              fontWeight: 700,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            Panel de Recepcionista
          </h2>
        </div>

        {/* BOTÓN MENÚ */}
        <button
          onClick={() => setOpen(true)}
          className="menu-button"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            borderRadius: '10px',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <Menu size={26} />
        </button>
      </header>

      {/* OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
            animation: 'fadeIn 0.3s ease-out',
          }}
        />
      )}

      {/* DRAWER */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: 'min(80vw, 340px)',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fb 100%)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0.0, 0.2, 1)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem',
        }}
      >
        {/* HEADER DRAWER CON CLOSE */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <img
            src={logoClinica}
            alt="Logo Clínica Latacunga"
            style={{
              maxWidth: '130px',
              width: 'auto',
              height: 'auto',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}
          />
          
          <button
            onClick={() => setOpen(false)}
            className="close-button"
            style={{
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '10px',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              color: '#991b1b',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            height: '2px',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '2px',
            marginBottom: '1.5rem',
          }}
        />

        {/* PERFIL */}
        <div
          className="profile-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)',
            border: '2px solid #e3e6eb',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '12px',
              width: 50,
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            }}
          >
            <User size={24} />
          </div>

          <div style={{ flex: 1 }}>
            <div 
              style={{ 
                fontWeight: 700, 
                color: '#2c3e50',
                fontSize: '0.95rem',
                marginBottom: '2px',
              }}
            >
              {user?.rol ?? 'Recepcionista'}
            </div>
            <div 
              style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280',
                fontWeight: 500,
              }}
            >
              {user?.email}
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link
            to="/recepcionista"
            onClick={() => setOpen(false)}
            className="nav-link"
            style={{
              ...linkStyle,
              ...(isActive('/recepcionista') ? activeLinkStyle : {}),
            }}
          >
            <Home size={20} />
            <span style={{ flex: 1 }}>Inicio</span>
            {isActive('/recepcionista') && <div style={indicatorStyle} />}
          </Link>

          <Link
            to="/recepcionista/usuarios"
            onClick={() => setOpen(false)}
            className="nav-link"
            style={{
              ...linkStyle,
              ...(isActive('/recepcionista/usuarios') ? activeLinkStyle : {}),
            }}
          >
            <Users size={20} />
            <span style={{ flex: 1 }}>Pacientes</span>
            {isActive('/recepcionista/usuarios') && <div style={indicatorStyle} />}
          </Link>

          <Link
            to="/recepcionista/citas"
            onClick={() => setOpen(false)}
            className="nav-link"
            style={{
              ...linkStyle,
              ...(isActive('/recepcionista/citas') ? activeLinkStyle : {}),
            }}
          >
            <Calendar size={20} />
            <span style={{ flex: 1 }}>Citas</span>
            {isActive('/recepcionista/citas') && <div style={indicatorStyle} />}
          </Link>

          <Link
            to="/recepcionista/habitaciones"
            onClick={() => setOpen(false)}
            className="nav-link"
            style={{
              ...linkStyle,
              ...(isActive('/recepcionista/habitaciones') ? activeLinkStyle : {}),
            }}
          >
            <BedDouble size={20} />
            <span style={{ flex: 1 }}>Habitaciones</span>
            {isActive('/recepcionista/habitaciones') && <div style={indicatorStyle} />}
          </Link>

          <Link
            to="/recepcionista/NuevaAdmision"
            onClick={() => setOpen(false)}
            className="nav-link"
            style={{
              ...linkStyle,
              ...(isActive('/recepcionista/NuevaAdmision') ? activeLinkStyle : {}),
            }}
          >
            <Hospital size={20} />
            <span style={{ flex: 1 }}>Hospitalizar</span>
            {isActive('/recepcionista/NuevaAdmision') && <div style={indicatorStyle} />}
          </Link>
        </nav>

        {/* LOGOUT */}
        <div 
          style={{ 
            paddingTop: '1.5rem',
            borderTop: '2px solid #e5e7eb',
          }}
        >
          <LogoutButton />
        </div>
      </aside>

      {/* ESTILOS */}
      <style>{`
        /* === ANIMACIONES === */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        /* === NAV LINKS HOVER === */
        .nav-link {
          position: relative;
        }

        .nav-link:hover {
          background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%) !important;
          color: #667eea !important;
          transform: translateX(4px);
        }

        .nav-link:active {
          transform: translateX(2px);
        }

        /* === RESPONSIVE === */
        @media (max-width: 768px) {
          .header-recepcionista h2 {
            font-size: 0.95rem !important;
          }

          .profile-card {
            flex-direction: row;
            gap: 0.75rem !important;
          }
        }

        @media (max-width: 480px) {
          .header-recepcionista h2 {
            display: none;
          }
        }

        /* === ACCESIBILIDAD === */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  )
}

const linkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  textDecoration: 'none',
  color: '#374151',
  padding: '0.75rem 1rem',
  borderRadius: '10px',
  transition: 'all 0.3s ease',
  fontWeight: 600,
  fontSize: '0.95rem',
  position: 'relative',
}

const activeLinkStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
}

const indicatorStyle: React.CSSProperties = {
  width: '4px',
  height: '24px',
  borderRadius: '4px',
  background: 'white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
}