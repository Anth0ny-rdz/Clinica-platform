import { Routes, Route } from 'react-router-dom'
import HeaderMedico from '@/components/HeaderMedico'
import ProtectedRoute from '@/components/ProtectedRoute'
import RoleProtectedRoute from '@/components/RoleProtectedRoute'

import Citas from './Citas'
import Pacientes from './pacientes'

export default function MedicoLayout() {
  return (
      <ProtectedRoute>
      <RoleProtectedRoute allowedRoles={['Médico']}>
        <div>
          <HeaderMedico />
          <main style={{ padding: '2rem' }}>
            <Routes>
              <Route path="citas" element={<Citas />} />
              <Route path="pacientes" element={<Pacientes />} />
            </Routes>
          </main>
        </div>
      </RoleProtectedRoute>
    </ProtectedRoute>
  )
}
