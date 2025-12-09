import { useEffect, useState, useRef } from 'react'
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

  // ======================================
  // 🔵 NUEVO: MODAL DE CONSENTIMIENTO
  // ======================================

  const [showModal, setShowModal] = useState(false)
  const [modalTarget, setModalTarget] = useState<'usuario' | 'doctor'>('usuario')
  const handleSubmitRef = useRef<(() => Promise<void>) | null>(null)

  // Abrir modal antes del submit
  const handlePreSubmitUser = (e: React.FormEvent) => {
    e.preventDefault()
    setModalTarget('usuario')
    setShowModal(true)
  }

  const handlePreSubmitDoctor = (e: React.FormEvent) => {
    e.preventDefault()
    setModalTarget('doctor')
    setShowModal(true)
  }

  // Si acepta → ejecutar submit real
  const aceptarYEnviar = async () => {
    setShowModal(false)
    await handleSubmitRef.current?.()
  }

  // Si cancela → no enviar y mostrar advertencia profesional
  const cancelarRegistro = () => {
    setShowModal(false)
    setMessage("❌ Registro cancelado: es obligatorio aceptar la Ley de Protección de Datos Personales para continuar.")
  }

  // ======================================
  // SUBMIT USUARIO REAL (NO SE TOCA LÓGICA)
  // ======================================
  const submitUserReal = async () => {
    setMessage(null)
    setLoading(true)

    if (!validarCedulaEcuatoriana(formUser.id_number)) {
      setMessage('⚠️ La cédula ingresada no es válida.')
      setLoading(false)
      return
    }

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
      })
    } catch {
      setMessage('❌ Error al crear usuario.')
    } finally {
      setLoading(false)
    }
  }

  // ======================================
  // SUBMIT DOCTOR REAL (NO SE TOCA LÓGICA)
  // ======================================
  const submitDoctorReal = async () => {
    setMessage(null)
    setLoading(true)

    if (!validarCedulaEcuatoriana(formDoctor.cedula_profesional)) {
      setMessage('⚠️ La cédula ingresada no es válida.')
      setLoading(false)
      return
    }

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
    } catch {
      setMessage('❌ Error al crear doctor.')
    } finally {
      setLoading(false)
    }
  }

  // Seleccionar cuál submit ejecutar luego de aceptar en modal
  handleSubmitRef.current =
    modalTarget === 'usuario' ? submitUserReal : submitDoctorReal

  // ======================================
  // RENDER COMPLETO
  // ======================================

  return (
    <div
      className="container mt-4"
      style={{
        maxWidth: 820,
        background: "white",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 4px 18px rgba(0,0,0,0.08)"
      }}
    >
      <h2 className="text-center mb-4" style={{ fontWeight: 700 }}>
        Gestión de Usuarios y Doctores
      </h2>

      {/* TABS */}
      <div className="d-flex justify-content-center mb-4 gap-2">
        <button
          onClick={() => setActiveTab("usuarios")}
          className={`btn ${activeTab === "usuarios" ? "btn-primary" : "btn-outline-secondary"}`}
          style={{ borderRadius: "8px", minWidth: "160px" }}
        >
          🧍 Usuarios
        </button>

        <button
          onClick={() => setActiveTab("doctor")}
          className={`btn ${activeTab === "doctor" ? "btn-primary" : "btn-outline-secondary"}`}
          style={{ borderRadius: "8px", minWidth: "160px" }}
        >
          👨‍⚕️ Doctor
        </button>
      </div>

      {/* MENSAJES */}
      {message && (
        <div
          className={`alert ${
            message.startsWith("❌") ? "alert-danger" : "alert-success"
          } text-center`}
        >
          {message}
        </div>
      )}

      {/* FORMULARIO USUARIO */}
      {activeTab === "usuarios" && (
        <form onSubmit={handlePreSubmitUser} className="row g-3" style={{ marginTop: "1rem" }}>
          {/* ⬇️ Campos del usuario (NO se modifican) */}
          <div className="col-md-6">
            <label className="form-label">Cédula</label>
            <input
              className="form-control"
              value={formUser.id_number}
              onChange={(e) =>
                setFormUser({ ...formUser, id_number: e.target.value })
              }
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Nombre</label>
            <input
              className="form-control"
              value={formUser.name}
              onChange={(e) =>
                setFormUser({ ...formUser, name: e.target.value })
              }
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Apellido</label>
            <input
              className="form-control"
              value={formUser.lastname}
              onChange={(e) =>
                setFormUser({ ...formUser, lastname: e.target.value })
              }
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Correo</label>
            <input
              type="email"
              className="form-control"
              value={formUser.email}
              onChange={(e) =>
                setFormUser({ ...formUser, email: e.target.value })
              }
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={formUser.password}
              onChange={(e) =>
                setFormUser({ ...formUser, password: e.target.value })
              }
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Teléfono</label>
            <input
              className="form-control"
              value={formUser.telephone}
              onChange={(e) =>
                setFormUser({ ...formUser, telephone: e.target.value })
              }
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label">Dirección</label>
            <input
              className="form-control"
              value={formUser.address}
              onChange={(e) =>
                setFormUser({ ...formUser, address: e.target.value })
              }
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Fecha de nacimiento</label>
            <input
              type="date"
              className="form-control"
              value={formUser.birth_date}
              onChange={(e) =>
                setFormUser({ ...formUser, birth_date: e.target.value })
              }
              required
            />
          </div>

          <div className="col-md-6">
            {puedeAsignarRol ? (
              <>
                <label className="form-label">Rol</label>
                <select
                  className="form-select"
                  value={formUser.rol_id}
                  onChange={(e) =>
                    setFormUser({ ...formUser, rol_id: Number(e.target.value) })
                  }
                  required
                >
                  <option value={0}>Seleccionar...</option>
                  {roles
                  .filter((r) => {
                    const nombre = r.name.toLocaleLowerCase(); // respeta tildes
                    return nombre !== "médico" && nombre !== "paciente";
                  })
                  .map((r) => (
                    <option key={r.roleid} value={r.roleid}>
                      {r.name}
                    </option>
                  ))
                }
                </select>
              </>
            ) : (
              <>
                <label className="form-label">Rol</label>
                <input className="form-control" value="Paciente" disabled />
              </>
            )}
          </div>

          <div className="col-12 mt-2">
            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Creando..." : "Registrar Usuario"}
            </button>
          </div>
        </form>
      )}

      {/* FORMULARIO DOCTOR */}
      {activeTab === "doctor" && (
        <form onSubmit={handlePreSubmitDoctor} className="row g-3" style={{ marginTop: "1rem" }}>
          
          <div className="col-md-6">
            <label className="form-label">Cédula</label>
            <input
              className="form-control"
              value={formDoctor.cedula_profesional}
              onChange={(e) =>
                setFormDoctor({ ...formDoctor, cedula_profesional: e.target.value })
              }
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Nombres</label>
            <input
              className="form-control"
              value={formDoctor.nombres}
              onChange={(e) =>
                setFormDoctor({ ...formDoctor, nombres: e.target.value })
              }
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Apellidos</label>
            <input
              className="form-control"
              value={formDoctor.apellidos}
              onChange={(e) =>
                setFormDoctor({ ...formDoctor, apellidos: e.target.value })
              }
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Dirección</label>
            <input
              className="form-control"
              value={formDoctor.direccion}
              onChange={(e) =>
                setFormDoctor({ ...formDoctor, direccion: e.target.value })
              }
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Especialidad</label>
            <select
              className="form-select"
              value={formDoctor.especialidad_id}
              onChange={(e) =>
                setFormDoctor({ ...formDoctor, especialidad_id: Number(e.target.value) })
              }
              required
            >
              <option value={0}>Seleccionar especialidad...</option>
              {specialties.map((s) => (
                <option key={s.especialidad_id} value={s.especialidad_id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Subespecialidad</label>
            <input
              className="form-control"
              value={formDoctor.subespecialidad}
              onChange={(e) =>
                setFormDoctor({ ...formDoctor, subespecialidad: e.target.value })
              }
            />
          </div>

          {/* <div className="col-md-6">
            <label className="form-label">Título académico</label>
            <input
              className="form-control"
              value={formDoctor.titulo_academico}
              onChange={(e) =>
                setFormDoctor({ ...formDoctor, titulo_academico: e.target.value })
              }
            />
          </div> */}

          <div className="col-md-6">
            <label className="form-label">Años experiencia</label>
            <input
              type="number"
              className="form-control"
              value={formDoctor.experiencia_anios}
              onChange={(e) =>
                setFormDoctor({ ...formDoctor, experiencia_anios: Number(e.target.value) })
              }
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Teléfono</label>
            <input
              className="form-control"
              value={formDoctor.telefono}
              onChange={(e) =>
                setFormDoctor({ ...formDoctor, telefono: e.target.value })
              }
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Correo institucional</label>
            <input
              type="email"
              className="form-control"
              value={formDoctor.correo_institucional}
              onChange={(e) =>
                setFormDoctor({ ...formDoctor, correo_institucional: e.target.value })
              }
              required
            />
          </div>

          <div className="col-12">
            <HorarioAtencionSelector
              onHorarioChange={(horario) =>
                setFormDoctor({ ...formDoctor, horario_atencion: horario })
              }
            />
          </div>

          {/* <div className="col-md-6">
            <label className="form-label">Consultorio</label>
            <input
              className="form-control"
              value={formDoctor.consultorio}
              onChange={(e) =>
                setFormDoctor({ ...formDoctor, consultorio: e.target.value })
              }
            />
          </div> */}

          {/* <div className="col-md-6">
            <label className="form-label">Firma digital</label>
            <input
              className="form-control"
              value={formDoctor.firma_digital}
              onChange={(e) =>
                setFormDoctor({ ...formDoctor, firma_digital: e.target.value })
              }
            />
          </div> */}

          <div className="col-md-12">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={formDoctor.password}
              onChange={(e) =>
                setFormDoctor({ ...formDoctor, password: e.target.value })
              }
              required
            />
          </div>

          <div className="col-12 mt-2">
            <button className="btn btn-success w-100" disabled={loading}>
              {loading ? "Creando..." : "Registrar Doctor"}
            </button>
          </div>
        </form>
      )}

      {/* ==========================
          MODAL DE CONSENTIMIENTO
      ========================== */}
      {showModal && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            background: "rgba(0,0,0,0.5)"
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">Ley de Protección de Datos</h5>
                <button type="button" className="btn-close" onClick={cancelarRegistro} />
              </div>

              <div className="modal-body" style={{ maxHeight: "350px", overflowY: "auto" }}>
                <p>
                  De conformidad con la <strong>Ley Orgánica de Protección de Datos Personales del Ecuador</strong>,
                  Clínica Latacunga informa que los datos personales proporcionados serán tratados bajo estrictos
                  principios de confidencialidad, seguridad y finalidad legítima.
                </p>

                <p>
                  La información será utilizada exclusivamente para:
                </p>
                <ul>
                  <li>Registro institucional dentro del sistema clínico.</li>
                  <li>Gestión operativa del personal y procesos médicos.</li>
                  <li>Identificación y validación profesional o administrativa.</li>
                </ul>

                <p>
                  Usted tiene derecho a acceder, actualizar o solicitar eliminación de sus datos,
                  conforme a la normativa vigente.
                </p>

                <p>
                  <strong>Para completar el registro es obligatorio aceptar el tratamiento de datos personales.</strong>
                </p>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={cancelarRegistro}>
                  Cancelar
                </button>

                <button className="btn btn-primary" onClick={aceptarYEnviar}>
                  Acepto
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}
