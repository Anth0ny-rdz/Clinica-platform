import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import LogoutButton from '@/components/LogoutButton'

export default function HeaderAdmin() {
  const { user } = useAuth()

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: '#1e40af',
        color: 'white'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ margin: 0 }}>Panel de Administración</h2>
        {user?.email && (
          <span
            style={{
              fontSize: '0.85rem',
              opacity: 0.9,
              background: 'rgba(255,255,255,0.15)',
              padding: '0.25rem 0.5rem',
              borderRadius: 6
            }}
            title={user.email}
          >
            {user.rol} · {user.email}
          </span>
        )}
      </div>

      <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/laboratorio" style={{ color: 'white', textDecoration: 'none' }}>
          Inicio
        </Link>
        <Link to="/laboratorio/pendientes" style={{ color: 'white', textDecoration: 'none' }}>
          Examenes Pendientes
        </Link>



        {/* Botón de cerrar sesión */}
        <LogoutButton />
      </nav>
    </header>
  )
}
