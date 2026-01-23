import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { ReactElement } from 'react'

interface RoleProtectedRouteProps {
  children: ReactElement
  allowedRoles: string[]
}

export default function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
