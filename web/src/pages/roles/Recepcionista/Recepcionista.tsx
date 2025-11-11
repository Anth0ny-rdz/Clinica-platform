import { Routes, Route } from 'react-router-dom'
import HeaderAdmin from '@/components/HeaderRecepcionista'
import ProtectedRoute from '@/components/ProtectedRoute'
import RoleProtectedRoute from '@/components/RoleProtectedRoute'
import CitasRecepcionista from './CitasRecepcionista'

import Usuarios from './Usuarios'
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
              <Route path="habitaciones" element={<Habitaciones />} />
              <Route path="citas" element={<CitasRecepcionista />} />

            </Routes>
          </main>
        </div>
      </RoleProtectedRoute>
    </ProtectedRoute>
  )
}
