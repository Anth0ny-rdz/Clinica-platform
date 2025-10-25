import { Routes, Route } from 'react-router-dom'
import HeaderAdmin from '@/components/HeaderRecepcionista'
import ProtectedRoute from '@/components/ProtectedRoute'
import RoleProtectedRoute from '@/components/RoleProtectedRoute'

import Usuarios from './Usuarios'
import Citas from './Citas'
import Historias from './Historias'
import Habitaciones from './Habitaciones'

export default function RecepcionistaLayout() {
  return (
    <ProtectedRoute>
      <RoleProtectedRoute allowedRoles={['Recepcionista / Asistente administrativo']}>
        <div>
          <HeaderAdmin />
          <main style={{ padding: '2rem' }}>
            <Routes>
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
