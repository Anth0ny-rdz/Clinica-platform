import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Contexto y rutas protegidas
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import RoleProtectedRoute from './components/RoleProtectedRoute'

// Páginas
import Login from './pages/Login'
import Unauthorized from './pages/Unauthorized'
import Admin from './pages/roles/Admin'
import Medico from './pages/roles/Medico'
import Enfermeria from './pages/roles/Enfermeria'
import Paciente from './pages/roles/Paciente'
import Recepcionista from './pages/roles/Recepcionista'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Página pública */}
          <Route path="/" element={<Login />} />

          {/* Acceso denegado */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* RUTAS PROTEGIDAS POR ROL */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['Administrador']}>
                  <Admin />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/medico"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['Medico']}>
                  <Medico />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/enfermeria"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['Enfermeria']}>
                  <Enfermeria />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recepcion"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['Recepcionista']}>
                  <Recepcionista />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/paciente"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['Paciente']}>
                  <Paciente />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
