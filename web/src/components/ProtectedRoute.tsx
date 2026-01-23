import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { ReactElement } from 'react'

interface ProtectedRouteProps {
  children: ReactElement
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Espera brevemente a que el contexto cargue sesión inicial
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Verificando sesión...</div>
  }

  // 🚫 Si después de cargar no hay usuario → redirigir
  if (!user?.auth_id) {
    return <Navigate to="/unauthorized" replace />
  }

  // ✅ Usuario autenticado
  return children
}
