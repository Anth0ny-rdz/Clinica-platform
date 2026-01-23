import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function LogoutButton() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/', { replace: true })
      // Fallback por si el router no refresca:
      setTimeout(() => {
        if (location.pathname !== '/') window.location.assign('/')
      }, 50)
    } catch (e) {
      console.error('[Logout] Error:', e)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      style={{
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Cerrar sesión
    </button>
  )
}
