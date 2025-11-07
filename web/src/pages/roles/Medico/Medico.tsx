import { Routes, Route } from 'react-router-dom'
import HeaderMedico from '@/components/HeaderMedico'
import ProtectedRoute from '@/components/ProtectedRoute'
import RoleProtectedRoute from '@/components/RoleProtectedRoute'
import CitasMedico from './CitasMedico'
import CalendarioCitas from './CalendarioCitas'


import Pacientes from './Pacientes'
import DetallePaciente from './DetallePaciente'
import NuevaHistoria from './NuevaHistoria'
import DetalleHistoria from './DetalleHistoria'

export default function MedicoLayout() {
  return (
      <ProtectedRoute>
      <RoleProtectedRoute allowedRoles={['Médico']}>
        <div>
          <HeaderMedico />
          <main style={{ padding: '2rem' }}>
            <Routes>
              <Route path="pacientes" element={<Pacientes />} />
              <Route path="pacientes/:doc_id" element={<DetallePaciente />} />
              <Route path="pacientes/:patient_id/nueva-historia" element={<NuevaHistoria />} />
              <Route path="pacientes/historia/:encounter_id" element={<DetalleHistoria />} />
              <Route path="citas" element={<CitasMedico />} />
              <Route path="calendario" element={<CalendarioCitas />} />  {/* 👈 nuevo */}
              
            </Routes>
          </main>
        </div>
      </RoleProtectedRoute>
    </ProtectedRoute>
  )
}
