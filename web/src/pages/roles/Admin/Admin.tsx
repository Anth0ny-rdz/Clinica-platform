import { Routes, Route } from 'react-router-dom'
import HeaderAdmin from '@/components/HeaderAdmin'
import ProtectedRoute from '@/components/ProtectedRoute'
import RoleProtectedRoute from '@/components/RoleProtectedRoute'
import Dashboard from './Dashboard'

import Usuarios from './Usuarios'


export default function AdminLayout() {
  return (
    <ProtectedRoute>
      <RoleProtectedRoute allowedRoles={['Administrador']}>
        <div>
          <HeaderAdmin />
          <main style={{ padding: '0' }}>
            <Routes>
              <Route index element={<Dashboard/>} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="usuarios" element={<Usuarios />} />
            </Routes>
          </main>
        </div>
      </RoleProtectedRoute>
    </ProtectedRoute>
  )
}
