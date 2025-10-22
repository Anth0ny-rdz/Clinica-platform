import { Routes, Route } from 'react-router-dom'
import HeaderAdmin from '@/components/HeaderAdmin'
import ProtectedRoute from '@/components/ProtectedRoute'
import RoleProtectedRoute from '@/components/RoleProtectedRoute'

import Dashboard from './Admin/Dashboard'
import Usuarios from './Admin/Usuarios'
import Citas from './Admin/Citas'
import Historias from './Admin/Historias'
import Habitaciones from './Admin/Habitaciones'

export default function AdminLayout() {
  return (
    <ProtectedRoute>
      <RoleProtectedRoute allowedRoles={['Administrador']}>
        <div>
          <HeaderAdmin />
          <main style={{ padding: '2rem' }}>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="citas" element={<Citas />} />
              <Route path="historias" element={<Historias />} />
              <Route path="habitaciones" element={<Habitaciones />} />
            </Routes>
          </main>
        </div>
      </RoleProtectedRoute>
    </ProtectedRoute>
  )
}
