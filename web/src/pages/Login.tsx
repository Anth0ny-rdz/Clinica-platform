import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
        setError('Credenciales inválidas o usuario sin rol asignado.')
        setLoading(false)
        return
      }

      // ✅ Redirección modular según rol
      switch (authUser.rol) {
        case 'Administrador':
          navigate('/admin')
          break
        case 'Médico':
          navigate('/medico')
          break
        case 'Enfermeria':
          navigate('/enfermeria')
          break
        case 'Recepcionista / Asistente administrativo':
          navigate('/recepcionista')
          break
        case 'Paciente':
          navigate('/paciente')
          break
        default:
          setError(`Rol desconocido: ${authUser.rol}`)
      }

      setLoading(false)
    } catch (err: any) {
      console.error('❌ Error al iniciar sesión:', err)
      setError('Credenciales inválidas o usuario sin rol asignado.')
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '3rem auto', textAlign: 'center' }}>
      <h1>Iniciar sesión</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  )
}
