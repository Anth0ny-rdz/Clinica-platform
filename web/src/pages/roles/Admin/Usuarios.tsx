import { useEffect, useState } from 'react'
import { fetchRoles, createUser, type Role, type NewUserData } from '@/services/userService'
import { createDoctorFull } from '@/services/doctorService'
import { fetchSpecialties, type Specialty } from '@/services/specialtyService'
import { useAuth } from '@/context/AuthContext'
import HorarioAtencionSelector from '@/components/HorarioAtencionSelector'

export default function Usuarios() {
  const { user } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [activeTab, setActiveTab] = useState<'usuarios' | 'doctor'>('usuarios')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // FORMULARIOS
  const [formUser, setFormUser] = useState<NewUserData>({
    id_number: '',
    name: '',
    lastname: '',
    email: '',
    password: '',
    telephone: '',
    address: '',
    birth_date: '',
    rol_id: 0,
    tipo_documento: "cedula"
  })

  const [formDoctor, setFormDoctor] = useState({
    cedula_profesional: '',
    nombres: '',
    apellidos: '',
    direccion: '',
    especialidad_id: 0,
    subespecialidad: '',
    titulo_academico: '',
    experiencia_anios: 0,
    telefono: '',
    correo_institucional: '',
    consultorio: '',
    firma_digital: '',
    password: '',
    horario_atencion: {},
  })

  const puedeAsignarRol = user?.rol === 'Administrador'

  // ================================
  // CARGA INICIAL ROLES + ESPECIALIDADES
  // ================================
  useEffect(() => {
    const loadData = async () => {
      try {
        const [rolesData, specialtiesData] = await Promise.all([fetchRoles(), fetchSpecialties()])
        setRoles(rolesData)
        setSpecialties(specialtiesData)
      } catch (err) {
        console.error('Error cargando datos:', err)
      }
    }
    loadData()
  }, [])

  // ================================
  // VALIDACIÓN DE CÉDULA
  // ================================
  function validarCedulaEcuatoriana(cedula: string): boolean {
    if (!/^\d{10}$/.test(cedula)) return false
    const provincia = parseInt(cedula.slice(0, 2))
    if (provincia < 1 || provincia > 24) return false
    const digitos = cedula.split('').map(Number)
    const verificador = digitos.pop()!
    for (let i = 0; i < 9; i += 2) {
      digitos[i] *= 2
      if (digitos[i] > 9) digitos[i] -= 9
    }
    const total = digitos.reduce((a, b) => a + b, 0)
    const decena = Math.ceil(total / 10) * 10
    const calculado = decena - total
    return calculado === verificador
  }

  const validarUsuario = (): boolean => {
    if (!validarCedulaEcuatoriana(formUser.id_number)) {
      setMessage("⚠️ La cédula ingresada no es válida.")
      return false
    }

    if (!formUser.name.trim() || !formUser.lastname.trim()) {
      setMessage("⚠️ Nombre y apellido son obligatorios.")
      return false
    }

    if (!formUser.email.includes("@")) {
      setMessage("⚠️ El correo electrónico no es válido.")
      return false
    }

    if (formUser.password.length < 6) {
      setMessage("⚠️ La contraseña debe tener al menos 6 caracteres.")
      return false
    }

    if (puedeAsignarRol && formUser.rol_id === 0) {
      setMessage("⚠️ Debe seleccionar un rol.")
      return false
    }

    return true
  }

  const validarDoctor = (): boolean => {
    if (!validarCedulaEcuatoriana(formDoctor.cedula_profesional)) {
      setMessage("⚠️ La cédula del médico no es válida.")
      return false
    }

    if (!formDoctor.nombres.trim() || !formDoctor.apellidos.trim()) {
      setMessage("⚠️ Nombres y apellidos son obligatorios.")
      return false
    }

    if (formDoctor.especialidad_id === 0) {
      setMessage("⚠️ Debe seleccionar una especialidad.")
      return false
    }

    if (!formDoctor.correo_institucional.includes("@")) {
      setMessage("⚠️ El correo institucional no es válido.")
      return false
    }

    if (formDoctor.password.length < 6) {
      setMessage("⚠️ La contraseña debe tener al menos 6 caracteres.")
      return false
    }

    return true
  }

  const handleSubmitUser = async (e: React.FormEvent) => {
  e.preventDefault()
  setMessage(null)

  if (!validarUsuario()) return

  setLoading(true)

  try {
    const result = await createUser(formUser)
    setMessage(`✅ Usuario creado correctamente (Auth ID: ${result.auth_id})`)
    setFormUser({
      id_number: '',
      name: '',
      lastname: '',
      email: '',
      password: '',
      telephone: '',
      address: '',
      birth_date: '',
      rol_id: 0,
      tipo_documento: "cedula"
    })
  } catch (error: any) {
    console.log("=== ERROR USUARIO ===")
    console.log("error.message:", error?.message)
    console.log("=== FIN ERROR ===")
    
    const backendMessage = error?.message || "❌ Error al crear usuario."
    setMessage(backendMessage)
  } finally {
    setLoading(false)
  }
}
  // ======================================
  // SUBMIT DOCTOR
  // ======================================
const handleSubmitDoctor = async (e: React.FormEvent) => {
  e.preventDefault()
  setMessage(null)

  if (!validarDoctor()) return

  setLoading(true)

  try {
    const result = await createDoctorFull(formDoctor)
    setMessage(`✅ Doctor creado correctamente (ID: ${result.doctor_id})`)
    setFormDoctor({
      cedula_profesional: '',
      nombres: '',
      apellidos: '',
      direccion: '',
      especialidad_id: 0,
      subespecialidad: '',
      titulo_academico: '',
      experiencia_anios: 0,
      telefono: '',
      correo_institucional: '',
      consultorio: '',
      firma_digital: '',
      password: '',
      horario_atencion: {},
    })
  } catch (error: any) {
    console.log("=== INICIO DEBUG ERROR ===")
    console.log("Error completo:", error)
    console.log("error.message:", error?.message)
    console.log("=== FIN DEBUG ERROR ===")
    
    // Como usamos fetch, el error viene en error.message
    const backendMessage = error?.message || "❌ Error al crear doctor."

    console.log("Mensaje final a mostrar:", backendMessage)
    setMessage(backendMessage)
  } finally {
    setLoading(false)
  }
}
  // ======================================
  // RENDER COMPLETO
  // ======================================

  return (
    <div
      className="container-fluid py-4"
      style={{
        background: "#f2f4f7",
        minHeight: "100vh",
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: 900,
          background: "#ffffff",
          borderRadius: "14px",
          padding: "2rem",
          boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
          border: "1px solid #e6e9ee",
        }}
      >
        {/* HEADER */}
        <div className="mb-4 text-center">
          <h2 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>
            Gestión de Usuarios Clínicos
          </h2>
          <small className="text-muted">
            Administración de usuarios y profesionales de la salud
          </small>
        </div>

        {/* TABS */}
        <div
          className="d-flex justify-content-center mb-4"
          style={{
            background: "#f8f9fb",
            padding: "6px",
            borderRadius: "10px",
            gap: "6px",
          }}
        >
          <button
            onClick={() => setActiveTab("usuarios")}
            className={`btn ${
              activeTab === "usuarios"
                ? "btn-primary"
                : "btn-light border"
            }`}
            style={{ minWidth: 160, borderRadius: "8px", fontWeight: 500 }}
          >
            🧍 Usuarios
          </button>

          <button
            onClick={() => setActiveTab("doctor")}
            className={`btn ${
              activeTab === "doctor"
                ? "btn-primary"
                : "btn-light border"
            }`}
            style={{ minWidth: 160, borderRadius: "8px", fontWeight: 500 }}
          >
            👨‍⚕️ Doctores
          </button>
        </div>

        {/* MENSAJES */}
        {message && (
          <div
            className={`alert ${
              message.startsWith("❌")
                ? "alert-danger"
                : message.startsWith("⚠️")
                ? "alert-warning"
                : "alert-success"
            }`}
          >
            {message}
          </div>
        )}

        {/* ===================== */}
        {/* FORMULARIO USUARIO */}
        {/* ===================== */}
        {activeTab === "usuarios" && (
          <>
            <h6 className="fw-semibold text-secondary mb-3">
              Información del usuario
            </h6>

            <form onSubmit={handleSubmitUser} className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Cédula</label>
                <input className="form-control" value={formUser.id_number}
                  onChange={(e) => setFormUser({ ...formUser, id_number: e.target.value })} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">Nombre</label>
                <input className="form-control" value={formUser.name}
                  onChange={(e) => setFormUser({ ...formUser, name: e.target.value })} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">Apellido</label>
                <input className="form-control" value={formUser.lastname}
                  onChange={(e) => setFormUser({ ...formUser, lastname: e.target.value })} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">Correo</label>
                <input type="email" className="form-control" value={formUser.email}
                  onChange={(e) => setFormUser({ ...formUser, email: e.target.value })} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">Contraseña</label>
                <input type="password" className="form-control" autoComplete="new-password"
                  value={formUser.password}
                  onChange={(e) => setFormUser({ ...formUser, password: e.target.value })} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">Teléfono</label>
                <input className="form-control" value={formUser.telephone}
                  onChange={(e) => setFormUser({ ...formUser, telephone: e.target.value })} required />
              </div>

              <div className="col-12">
                <label className="form-label">Dirección</label>
                <input className="form-control" value={formUser.address}
                  onChange={(e) => setFormUser({ ...formUser, address: e.target.value })} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">Fecha de nacimiento</label>
                <input type="date" className="form-control" value={formUser.birth_date}
                  onChange={(e) => setFormUser({ ...formUser, birth_date: e.target.value })} required />
              </div>

              <div className="col-md-6">
                {puedeAsignarRol ? (
                  <>
                    <label className="form-label">Rol</label>
                    <select className="form-select" value={formUser.rol_id}
                      onChange={(e) => setFormUser({ ...formUser, rol_id: Number(e.target.value) })} required>
                      <option value={0}>Seleccionar...</option>
                      {roles
                        .filter(r => !["médico", "paciente"].includes(r.name.toLowerCase()))
                        .map(r => (
                          <option key={r.roleid} value={r.roleid}>{r.name}</option>
                        ))}
                    </select>
                  </>
                ) : (
                  <>
                    <label className="form-label">Rol</label>
                    <input className="form-control" value="Paciente" disabled />
                  </>
                )}
              </div>

              <div className="col-12 mt-3">
                <button className="btn btn-primary w-100" disabled={loading}
                  style={{ padding: "10px", fontWeight: 600, borderRadius: "10px" }}>
                  {loading ? "Creando usuario..." : "Registrar Usuario"}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ===================== */}
        {/* FORMULARIO DOCTOR */}
        {/* ===================== */}
        {activeTab === "doctor" && (
          <>
            <h6 className="fw-semibold text-secondary mb-3">
              Información profesional del médico
            </h6>

            <form onSubmit={handleSubmitDoctor} className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Cédula</label>
                <input className="form-control" value={formDoctor.cedula_profesional}
                  onChange={(e) => setFormDoctor({ ...formDoctor, cedula_profesional: e.target.value })} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">Nombres</label>
                <input className="form-control" value={formDoctor.nombres}
                  onChange={(e) => setFormDoctor({ ...formDoctor, nombres: e.target.value })} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">Apellidos</label>
                <input className="form-control" value={formDoctor.apellidos}
                  onChange={(e) => setFormDoctor({ ...formDoctor, apellidos: e.target.value })} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">Dirección</label>
                <input className="form-control" value={formDoctor.direccion}
                  onChange={(e) => setFormDoctor({ ...formDoctor, direccion: e.target.value })} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">Especialidad</label>
                <select className="form-select" value={formDoctor.especialidad_id}
                  onChange={(e) => setFormDoctor({ ...formDoctor, especialidad_id: Number(e.target.value) })} required>
                  <option value={0}>Seleccionar especialidad...</option>
                  {specialties.map(s => (
                    <option key={s.especialidad_id} value={s.especialidad_id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Subespecialidad</label>
                <input className="form-control" value={formDoctor.subespecialidad}
                  onChange={(e) => setFormDoctor({ ...formDoctor, subespecialidad: e.target.value })} />
              </div>

              <div className="col-md-6">
                <label className="form-label">Años de experiencia</label>
                <input type="number" className="form-control" value={formDoctor.experiencia_anios}
                  onChange={(e) => setFormDoctor({ ...formDoctor, experiencia_anios: Number(e.target.value) })} />
              </div>

              <div className="col-md-6">
                <label className="form-label">Teléfono</label>
                <input className="form-control" value={formDoctor.telefono}
                  onChange={(e) => setFormDoctor({ ...formDoctor, telefono: e.target.value })} />
              </div>

              <div className="col-md-6">
                <label className="form-label">Correo institucional</label>
                <input type="email" className="form-control" value={formDoctor.correo_institucional}
                  onChange={(e) => setFormDoctor({ ...formDoctor, correo_institucional: e.target.value })} required />
              </div>

              <div className="col-12">
                <div
                  style={{
                    background: "#f8f9fb",
                    padding: "1rem",
                    borderRadius: "10px",
                    border: "1px solid #e3e6eb",
                  }}
                >
                  <h6 className="fw-semibold mb-2">⏱ Horario de Atención</h6>
                  <HorarioAtencionSelector
                    onHorarioChange={(horario) =>
                      setFormDoctor({ ...formDoctor, horario_atencion: horario })
                    }
                  />
                </div>
              </div>

              <div className="col-12">
                <label className="form-label">Contraseña</label>
                <input type="password" className="form-control" autoComplete="new-password"
                  value={formDoctor.password}
                  onChange={(e) => setFormDoctor({ ...formDoctor, password: e.target.value })} required />
              </div>

              <div className="col-12 mt-3">
                <button className="btn btn-success w-100" disabled={loading}
                  style={{ padding: "10px", fontWeight: 600, borderRadius: "10px" }}>
                  {loading ? "Creando doctor..." : "Registrar Doctor"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}