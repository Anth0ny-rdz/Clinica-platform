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
import HospitalizacionesMedico from './HospitalizacionesMedico'
import HospitalizacionDetalle from './HospitalizacionDetalle'

import DetalleExamen from './DetalleExamen'
import SolicitarExamen from './SolicitarExamen'
import DetalleOrdenExamen from './DetalleOrdenExamen'
import ResultadoExamen from './ResultadoExamen'
import DashboardMedico from './DashboardMedico'
export default function MedicoLayout() {
  return (
      <ProtectedRoute>
      <RoleProtectedRoute allowedRoles={['Médico']}>
        <div>
          <HeaderMedico />
          <main style={{ padding: '0' }}>
            <Routes>
              <Route index element={<DashboardMedico />} />
              <Route path="pacientes" element={<Pacientes />} />
              <Route path="pacientes/:doc_id" element={<DetallePaciente />} />
              <Route path="pacientes/:patient_id/nueva-historia" element={<NuevaHistoria />} />
              <Route path="pacientes/historia/:encounter_id" element={<DetalleHistoria />} />
              <Route path="citas" element={<CitasMedico />} />
              <Route path="calendario" element={<CalendarioCitas />} />  {/* 👈 nuevo */}
              <Route path="hospitalizacionesmedico" element={<HospitalizacionesMedico />} />
              <Route path="hospitalizaciondetalle/:admission_id" element={<HospitalizacionDetalle />} />
              <Route path="examenes/detalle/:encounter_id" element={<DetalleExamen />} />
              <Route path="examenes/nuevo/:encounter_id" element={<SolicitarExamen/>}  />
              <Route path="examenes/orden/:order_id" element={<DetalleOrdenExamen />} />
              <Route path="examenes/resultado/:item_id" element={<ResultadoExamen />} />

            </Routes>
          </main>
        </div>
      </RoleProtectedRoute>
    </ProtectedRoute>
  )
}
