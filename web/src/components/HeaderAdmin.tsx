import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import LogoutButton from '@/components/LogoutButton'
import { Menu, X, Home, Users, User } from 'lucide-react'
import logoClinica from "@/assets/logo_clinica.png"

export default function HeaderAdmin() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* HEADER */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          backgroundColor: '#1e40af',
          color: 'white'
        }}
      >
        {/* IZQUIERDA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img
            src={logoClinica}
            alt="Logo Clínica Latacunga"
            style={{
              maxHeight: '40px',
              width: 'auto'
            }}
          />
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>
            Panel de Administración
          </h2>
        </div>

        {/* BOTÓN MENÚ */}
        <button
          onClick={() => setOpen(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
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
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(4px)',
            zIndex: 40
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
          width: 'min(80vw, 320px)',
          backgroundColor: '#fff',
          boxShadow: '-6px 0 20px rgba(0,0,0,0.25)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s ease-in-out',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          padding: '1.25rem'
        }}
      >
        {/* LOGO EN DRAWER */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingBottom: '1rem',
            marginBottom: '1rem',
            borderBottom: '1px solid #e5e7eb'
          }}
        >
          <img
            src={logoClinica}
            alt="Logo Clínica Latacunga"
            style={{
              maxWidth: '120px',
              width: 'auto',
              height: 'auto'
            }}
          />
        </div>

        {/* PERFIL USUARIO */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            paddingBottom: '1rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid #e5e7eb'
          }}
        >
          <div
            style={{
              background: '#1e40af',
              color: 'white',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <User size={20} />
          </div>

          <div>
            <div style={{ fontWeight: 600 }}>
              {user?.rol ?? 'Usuario'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              {user?.email}
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <X />
          </button>
        </div>

        {/* LINKS */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link
            to="/admin/dashboard"
            onClick={() => setOpen(false)}
            style={linkStyle}
          >
            <Home size={18} />
            Inicio
          </Link>

          <Link
            to="/admin/usuarios"
            onClick={() => setOpen(false)}
            style={linkStyle}
          >
            <Users size={18} />
            Usuarios
          </Link>
        </nav>

        {/* LOGOUT ABAJO */}
        <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
          <LogoutButton />
        </div>
      </aside>
    </>
  )
}

const linkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  textDecoration: 'none',
  color: '#1f2937',
  padding: '0.6rem 0.75rem',
  borderRadius: 8,
  transition: 'background 0.2s ease'
}