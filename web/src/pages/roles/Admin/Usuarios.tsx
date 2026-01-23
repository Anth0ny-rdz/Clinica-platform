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
      setMessage(`✅ Usuario creado correctamente `)
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

  const handleSubmitDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!validarDoctor()) return

    setLoading(true)

    try {
      const result = await createDoctorFull(formDoctor)
      setMessage(`✅ Doctor creado correctamente `)
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
      
      const backendMessage = error?.message || "❌ Error al crear doctor."
      setMessage(backendMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="container-fluid py-4 page-wrapper"
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)",
        minHeight: "100vh",
      }}
    >
      <div
        className="mx-auto form-container"
        style={{
          maxWidth: 900,
          background: "#ffffff",
          borderRadius: "20px",
          padding: "2.5rem",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          border: "1px solid rgba(230, 233, 238, 0.8)",
        }}
      >
        {/* HEADER */}
        <div className="mb-4 text-center header-section">
          <div className="icon-badge mb-3">
            <span style={{ fontSize: '2.5rem' }}>👥</span>
          </div>
          <h2 className="fw-bold mb-2 title-animate" style={{ color: "#2c3e50", fontSize: '1.75rem' }}>
            Gestión de Usuarios Clínicos
          </h2>
          <p className="text-muted subtitle-animate" style={{ fontSize: '0.95rem' }}>
            Administración de usuarios y profesionales de la salud
          </p>
        </div>

        {/* TABS MEJORADOS */}
        <div
          className="d-flex justify-content-center mb-4 tabs-container"
          style={{
            background: "linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)",
            padding: "8px",
            borderRadius: "14px",
            gap: "8px",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
          }}
        >
          <button
            onClick={() => setActiveTab("usuarios")}
            className={`tab-button ${activeTab === "usuarios" ? "active" : ""}`}
            style={{
              minWidth: 160,
              borderRadius: "10px",
              fontWeight: 600,
              padding: "10px 20px",
              border: "none",
              background: activeTab === "usuarios" 
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "transparent",
              color: activeTab === "usuarios" ? "#fff" : "#6c757d",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: activeTab === "usuarios" 
                ? "0 4px 12px rgba(102, 126, 234, 0.4)"
                : "none",
            }}
          >
            <span style={{ fontSize: '1.1rem', marginRight: '6px' }}>🧍</span>
            Usuarios
          </button>

          <button
            onClick={() => setActiveTab("doctor")}
            className={`tab-button ${activeTab === "doctor" ? "active" : ""}`}
            style={{
              minWidth: 160,
              borderRadius: "10px",
              fontWeight: 600,
              padding: "10px 20px",
              border: "none",
              background: activeTab === "doctor"
                ? "linear-gradient(135deg, #0d4e57 0%, #2ae9f7 100%)"
                : "transparent",
              color: activeTab === "doctor" ? "#fff" : "#6c757d",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: activeTab === "doctor"
                ? "0 4px 12px rgba(102, 126, 234, 0.4)"
                : "none",
            }}
          >
            <span style={{ fontSize: '1.1rem', marginRight: '6px' }}>👨‍⚕️</span>
            Doctores
          </button>
        </div>

        {/* MENSAJES MEJORADOS */}
        {message && (
          <div
            className={`alert message-alert ${
              message.startsWith("❌")
                ? "alert-danger"
                : message.startsWith("⚠️")
                ? "alert-warning"
                : "alert-success"
            }`}
            style={{
              borderRadius: "12px",
              border: "none",
              padding: "14px 18px",
              fontWeight: 500,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            {message}
          </div>
        )}

        {/* ===================== */}
        {/* FORMULARIO USUARIO */}
        {/* ===================== */}
        {activeTab === "usuarios" && (
          <div className="form-content">
            <div className="section-header mb-4" style={{
              padding: "12px 16px",
              background: "linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)",
              borderRadius: "10px",
              borderLeft: "4px solid #667eea",
            }}>
              <h6 className="fw-semibold mb-0" style={{ color: "#495057" }}>
                📋 Información del usuario
              </h6>
            </div>

            <form onSubmit={handleSubmitUser} className="row g-3">
              <div className="col-md-6">
                <label className="form-label label-enhanced">Cédula</label>
                <input 
                  className="form-control input-enhanced" 
                  value={formUser.id_number}
                  onChange={(e) => setFormUser({ ...formUser, id_number: e.target.value })} 
                  required 
                  placeholder="Ingrese la cédula"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label label-enhanced">Nombre</label>
                <input 
                  className="form-control input-enhanced" 
                  value={formUser.name}
                  onChange={(e) => setFormUser({ ...formUser, name: e.target.value })} 
                  required 
                  placeholder="Ingrese el nombre"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label label-enhanced">Apellido</label>
                <input 
                  className="form-control input-enhanced" 
                  value={formUser.lastname}
                  onChange={(e) => setFormUser({ ...formUser, lastname: e.target.value })} 
                  required 
                  placeholder="Ingrese el apellido"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label label-enhanced">Correo</label>
                <input 
                  type="email" 
                  className="form-control input-enhanced" 
                  value={formUser.email}
                  onChange={(e) => setFormUser({ ...formUser, email: e.target.value })} 
                  required 
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label label-enhanced">Contraseña</label>
                <input 
                  type="password" 
                  className="form-control input-enhanced" 
                  autoComplete="new-password"
                  value={formUser.password}
                  onChange={(e) => setFormUser({ ...formUser, password: e.target.value })} 
                  required 
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label label-enhanced">Teléfono</label>
                <input 
                  className="form-control input-enhanced" 
                  value={formUser.telephone}
                  onChange={(e) => setFormUser({ ...formUser, telephone: e.target.value })} 
                  required 
                  placeholder="0999999999"
                />
              </div>

              <div className="col-12">
                <label className="form-label label-enhanced">Dirección</label>
                <input 
                  className="form-control input-enhanced" 
                  value={formUser.address}
                  onChange={(e) => setFormUser({ ...formUser, address: e.target.value })} 
                  required 
                  placeholder="Ingrese la dirección completa"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label label-enhanced">Fecha de nacimiento</label>
                <input 
                  type="date" 
                  className="form-control input-enhanced" 
                  value={formUser.birth_date}
                  onChange={(e) => setFormUser({ ...formUser, birth_date: e.target.value })} 
                  required 
                />
              </div>

              <div className="col-md-6">
                {puedeAsignarRol ? (
                  <>
                    <label className="form-label label-enhanced">Rol</label>
                    <select 
                      className="form-select input-enhanced" 
                      value={formUser.rol_id}
                      onChange={(e) => setFormUser({ ...formUser, rol_id: Number(e.target.value) })} 
                      required
                    >
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
                    <label className="form-label label-enhanced">Rol</label>
                    <input className="form-control input-enhanced" value="Paciente" disabled />
                  </>
                )}
              </div>

              <div className="col-12 mt-4">
                <button 
                  className="btn btn-submit w-100" 
                  disabled={loading}
                  style={{
                    padding: "14px",
                    fontWeight: 600,
                    borderRadius: "12px",
                    background: loading 
                      ? "#6c757d" 
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    color: "#fff",
                    fontSize: "1rem",
                    boxShadow: loading ? "none" : "0 6px 20px rgba(102, 126, 234, 0.4)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creando usuario...
                    </>
                  ) : (
                    <> Registrar Usuario</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===================== */}
        {/* FORMULARIO DOCTOR */}
        {/* ===================== */}
        {activeTab === "doctor" && (
          <div className="form-content">
            <div className="section-header mb-4" style={{
              padding: "12px 16px",
              background: "linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)",
              borderRadius: "10px",
              borderLeft: "4px solid #28a745",
            }}>
              <h6 className="fw-semibold mb-0" style={{ color: "#495057" }}>
                ⚕️ Información profesional del médico
              </h6>
            </div>

            <form onSubmit={handleSubmitDoctor} className="row g-3">
              <div className="col-md-6">
                <label className="form-label label-enhanced">Cédula</label>
                <input 
                  className="form-control input-enhanced" 
                  value={formDoctor.cedula_profesional}
                  onChange={(e) => setFormDoctor({ ...formDoctor, cedula_profesional: e.target.value })} 
                  required 
                  placeholder="Ingrese la cédula"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label label-enhanced">Nombres</label>
                <input 
                  className="form-control input-enhanced" 
                  value={formDoctor.nombres}
                  onChange={(e) => setFormDoctor({ ...formDoctor, nombres: e.target.value })} 
                  required 
                  placeholder="Nombres completos"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label label-enhanced">Apellidos</label>
                <input 
                  className="form-control input-enhanced" 
                  value={formDoctor.apellidos}
                  onChange={(e) => setFormDoctor({ ...formDoctor, apellidos: e.target.value })} 
                  required 
                  placeholder="Apellidos completos"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label label-enhanced">Dirección</label>
                <input 
                  className="form-control input-enhanced" 
                  value={formDoctor.direccion}
                  onChange={(e) => setFormDoctor({ ...formDoctor, direccion: e.target.value })} 
                  required 
                  placeholder="Dirección completa"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label label-enhanced">Especialidad</label>
                <select 
                  className="form-select input-enhanced" 
                  value={formDoctor.especialidad_id}
                  onChange={(e) => setFormDoctor({ ...formDoctor, especialidad_id: Number(e.target.value) })} 
                  required
                >
                  <option value={0}>Seleccionar especialidad...</option>
                  {specialties.map(s => (
                    <option key={s.especialidad_id} value={s.especialidad_id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label label-enhanced">Subespecialidad</label>
                <input 
                  className="form-control input-enhanced" 
                  value={formDoctor.subespecialidad}
                  onChange={(e) => setFormDoctor({ ...formDoctor, subespecialidad: e.target.value })} 
                  placeholder="Opcional"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label label-enhanced">Años de experiencia</label>
                <input 
                  type="number" 
                  className="form-control input-enhanced" 
                  value={formDoctor.experiencia_anios}
                  onChange={(e) => setFormDoctor({ ...formDoctor, experiencia_anios: Number(e.target.value) })} 
                  placeholder="0"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label label-enhanced">Teléfono</label>
                <input 
                  className="form-control input-enhanced" 
                  value={formDoctor.telefono}
                  onChange={(e) => setFormDoctor({ ...formDoctor, telefono: e.target.value })} 
                  placeholder="0999999999"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label label-enhanced">Correo institucional</label>
                <input 
                  type="email" 
                  className="form-control input-enhanced" 
                  value={formDoctor.correo_institucional}
                  onChange={(e) => setFormDoctor({ ...formDoctor, correo_institucional: e.target.value })} 
                  required 
                  placeholder="doctor@clinica.com"
                />
              </div>

              <div className="col-12">
                <div
                  className="horario-section"
                  style={{
                    background: "linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)",
                    padding: "1.5rem",
                    borderRadius: "14px",
                    border: "1px solid #e3e6eb",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  <h6 className="fw-semibold mb-3" style={{ color: "#495057" }}>
                    ⏱ Horario de Atención
                  </h6>
                  <HorarioAtencionSelector
                    onHorarioChange={(horario) =>
                      setFormDoctor({ ...formDoctor, horario_atencion: horario })
                    }
                  />
                </div>
              </div>

              <div className="col-12">
                <label className="form-label label-enhanced">Contraseña</label>
                <input 
                  type="password" 
                  className="form-control input-enhanced" 
                  autoComplete="new-password"
                  value={formDoctor.password}
                  onChange={(e) => setFormDoctor({ ...formDoctor, password: e.target.value })} 
                  required 
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="col-12 mt-4">
                <button 
                  className="btn btn-submit w-100" 
                  disabled={loading}
                  style={{
                    padding: "14px",
                    fontWeight: 600,
                    borderRadius: "12px",
                    background: loading 
                      ? "#6c757d" 
                      : "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                    border: "none",
                    color: "#fff",
                    fontSize: "1rem",
                    boxShadow: loading ? "none" : "0 6px 20px rgba(40, 167, 69, 0.4)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creando doctor...
                    </>
                  ) : (
                    <> Registrar Doctor</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ESTILOS MEJORADOS */}
      <style>
        {`
          /* === ANIMACIONES === */
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-15px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -1000px 0;
            }
            100% {
              background-position: 1000px 0;
            }
          }

          /* === PÁGINA === */
          .page-wrapper {
            animation: fadeInUp 0.5s ease-out;
          }

          .form-container {
            animation: fadeInUp 0.6s ease-out 0.1s backwards;
          }

          /* === HEADER === */
          .icon-badge {
            display: inline-block;
            animation: pulse 2s ease-in-out infinite;
          }

          .title-animate {
            animation: slideDown 0.6s ease-out;
          }

          .subtitle-animate {
            animation: slideDown 0.6s ease-out 0.1s backwards;
          }

          /* === TABS === */
          .tab-button {
            position: relative;
            overflow: hidden;
          }

          .tab-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.3),
              transparent
            );
            transition: left 0.5s ease;
          }

          .tab-button:hover::before {
            left: 100%;
          }

          .tab-button:hover:not(.active) {
            background: rgba(102, 126, 234, 0.1) !important;
            transform: translateY(-2px);
          }

          .tab-button:active {
            transform: translateY(0);
          }

          /* === MENSAJES === */
          .message-alert {
            animation: slideDown 0.4s ease-out;
          }

          /* === FORMULARIOS === */
          .form-content {
            animation: fadeInUp 0.4s ease-out;
          }

          .section-header {
            animation: slideDown 0.5s ease-out;
          }

          .label-enhanced {
            font-weight: 600;
            color: #495057;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
            transition: color 0.3s ease;
          }

          .input-enhanced,
          .form-select.input-enhanced {
            border: 2px solid #e9ecef;
            border-radius: 10px;
            padding: 10px 14px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: #ffffff;
            font-size: 0.95rem;
          }

          .input-enhanced:focus,
          .form-select.input-enhanced:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
            transform: translateY(-1px);
          }

          .input-enhanced:hover:not(:focus):not(:disabled) {
            border-color: #ced4da;
          }

          .input-enhanced::placeholder {
            color: #adb5bd;
            font-size: 0.9rem;
          }

          /* === HORARIO SECTION === */
          .horario-section {
            animation: fadeInUp 0.5s ease-out 0.2s backwards;
          }

          /* === BOTÓN SUBMIT === */
          .btn-submit {
            position: relative;
            overflow: hidden;
          }

          .btn-submit::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
          }

          .btn-submit:hover:not(:disabled)::before {
            width: 300px;
            height: 300px;
          }

          .btn-submit:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
          }

          .btn-submit:active:not(:disabled) {
            transform: translateY(0);
          }

          .btn-submit:disabled {
            cursor: not-allowed;
            opacity: 0.7;
          }

          /* === SPINNER === */
          .spinner-border-sm {
            width: 1rem;
            height: 1rem;
            border-width: 0.15em;
          }

          /* === RESPONSIVE === */
          @media (max-width: 768px) {
            .form-container {
              padding: 1.5rem !important;
              border-radius: 16px !important;
            }

            .tabs-container {
              flex-direction: column;
            }

            .tab-button {
              width: 100%;
            }

            .title-animate {
              font-size: 1.5rem !important;
            }
          }

          /* === ACCESIBILIDAD === */
          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }

          /* === FOCUS VISIBLE === */
          .input-enhanced:focus-visible,
          .form-select.input-enhanced:focus-visible,
          .tab-button:focus-visible,
          .btn-submit:focus-visible {
            outline: 3px solid #667eea;
            outline-offset: 2px;
          }
        `}
      </style>
    </div>
  )
}