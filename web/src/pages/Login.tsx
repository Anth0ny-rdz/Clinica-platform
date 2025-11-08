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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          🩺 Iniciar sesión
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold transition-colors ${
              loading
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>

        {error && (
          <p className="text-red-600 text-sm mt-4 text-center">{error}</p>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          Clínica Latacunga © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
