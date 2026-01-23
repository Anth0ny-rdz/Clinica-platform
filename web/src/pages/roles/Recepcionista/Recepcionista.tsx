import { Routes, Route } from 'react-router-dom'
import HeaderAdmin from '@/components/HeaderRecepcionista'
import ProtectedRoute from '@/components/ProtectedRoute'
import RoleProtectedRoute from '@/components/RoleProtectedRoute'
import CitasRecepcionista from './CitasRecepcionista'
import Usuarios from './Usuarios'
import Habitaciones from './Habitaciones'
import DashboardRecepcionista from './DashboardRecepcionista'
import NuevaAdmision from './NuevaAdmision'

export default function RecepcionistaLayout() {
  return (
    <ProtectedRoute>
      <RoleProtectedRoute allowedRoles={['Recepcionista / Asistente administrativo']}>
        <div>
          <HeaderAdmin />
          <main style={{ padding: '0' }}>
            <Routes>
              {/* 👇 Pantalla principal por defecto */}
              <Route index element={<DashboardRecepcionista />} />
              
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="habitaciones" element={<Habitaciones />} />
              <Route path="citas" element={<CitasRecepcionista />} />
              <Route path="inicio" element={<DashboardRecepcionista />} />
              <Route path="NuevaAdmision" element={<NuevaAdmision />} />

            </Routes>
          </main>
        </div>
      </RoleProtectedRoute>
    </ProtectedRoute>
  )
}
