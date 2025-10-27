import { Routes, Route } from 'react-router-dom'
import HeaderMedico from '@/components/HeaderMedico'
import ProtectedRoute from '@/components/ProtectedRoute'
import RoleProtectedRoute from '@/components/RoleProtectedRoute'

import Citas from './Citas'
import Pacientes from './pacientes'
import DetallePaciente from './DetallePaciente'

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
              <Route path="pacientes/:doc_id" element={<DetallePaciente />} />

            </Routes>
          </main>
        </div>
      </RoleProtectedRoute>
    </ProtectedRoute>
  )
}
