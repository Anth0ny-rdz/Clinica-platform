import { useEffect, useState, useRef } from 'react'
import { fetchRoles, createPatient, type Role, type NewPatientData, createUserRequest, getPendingStatus } from '@/services/userService'
import { useAuth } from '@/context/AuthContext'

export default function Usuarios() {
  const { user } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])

  // 🔵 Nuevo: switch para seguro médico
  const [tieneSeguro, setTieneSeguro] = useState(false)

  // 🔵 Tipo de documento
  const [tipoDocumento, setTipoDocumento] = useState<"cedula" | "pasaporte">("cedula")

  // 🔵 Formulario de PACIENTE
  const [form, setForm] = useState<NewPatientData>({
    tipo_documento: "cedula",
    id_number: "",
    name: "",
    lastname: "",
    email: "",
    password: "",
    telephone: "",
    address: "",
    birth_date: "",
    rol_id: 0,
    seguro_medico: null,
    genre: "",
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const puedeAsignarRol = user?.rol === "Administrador"

  // Modal
  const handleSubmitRef = useRef<(() => Promise<void>) | null>(null)

  const [pendingId, setPendingId] = useState<string | null>(null)
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [modalState, setModalState] = useState<
    "pending" | "accepted" | "rejected" | "expired"
  >("pending")

  // Cargar roles
  useEffect(() => {
    const loadRoles = async () => {
      try {
        setRoles(await fetchRoles())
      } catch (err) {
        console.error("Error cargando roles:", err)
      }
    }
    loadRoles()
  }, [])

    useEffect(() => {
    if (!pendingId) return

    const interval = setInterval(async () => {
      try {
        const data = await getPendingStatus(pendingId)

        if (data.status === "accepted") {
          setModalState("accepted")
          clearInterval(interval)
          setPendingId(null)
        }

        if (data.status === "rejected") {
          setModalState("rejected")
          clearInterval(interval)
          setPendingId(null)
        }

        if (data.status === "expired") {
          setModalState("expired")
          clearInterval(interval)
          setPendingId(null)
        }
      } catch (e) {
        console.error("Error consultando estado", e)
      }
    }, 4000) // cada 4 segundos

    return () => clearInterval(interval)
  }, [pendingId])

  // Si no es admin, asignar rol Paciente automáticamente
  useEffect(() => {
    if (!puedeAsignarRol && roles.length > 0) {
      const pacienteRole = roles.find(r =>
        r.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === "paciente"
      )
      if (pacienteRole) {
        setForm(prev => ({ ...prev, rol_id: pacienteRole.roleid }))
      }
    }
  }, [roles, puedeAsignarRol])

  useEffect(() => {
  if (!puedeAsignarRol && roles.length > 0 && form.rol_id === 0) {
    const pacienteRole = roles.find(r =>
      r.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === "paciente"
    )
    if (pacienteRole) {
      setForm(prev => ({ ...prev, rol_id: pacienteRole.roleid }))
    }
  }
}, [form.rol_id, roles])


  // Cambios del formulario
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === "rol_id" ? Number(value) : value,
    }))
  }

  // Switch seguro médico
  const handleSeguroSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setTieneSeguro(checked)
    if (!checked) {
      setForm(prev => ({ ...prev, seguro_medico: null }))
    }
  }

  // Validación cédula ecuatoriana
  function validarCedulaEcuatoriana(cedula: string): boolean {
    if (!/^\d{10}$/.test(cedula)) return false
    const provincia = parseInt(cedula.slice(0, 2))
    if (provincia < 1 || provincia > 24) return false
    const digitos = cedula.split("").map(Number)
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

  // SUBMIT REAL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    // Validación según tipo de documento
    if (tipoDocumento === "cedula") {
      if (!validarCedulaEcuatoriana(form.id_number)) {
        setMessage("⚠️ La cédula ingresada no es válida.")
        setLoading(false)
        return
      }
    } else {
      // Pasaporte → validación básica
      const regexPasaporte = /^[A-Za-z0-9]{6,12}$/
      if (!regexPasaporte.test(form.id_number)) {
        setMessage("⚠️ El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos.")
        setLoading(false)
        return
      }
    }

    if (!/^\d{10}$/.test(form.telephone)) {
      setMessage("⚠️ El teléfono debe tener exactamente 10 dígitos.")
      setLoading(false)
      return
    }

    try {
      const dataToSend = {
        ...form,
        tipo_documento: tipoDocumento,
        seguro_medico: tieneSeguro ? form.seguro_medico : "Ninguno",
      }

      const result = await createUserRequest(dataToSend)

        // guardar ID pendiente
        setPendingId(result.pending_id)

        // abrir popup
        setModalState("pending")
        setShowPendingModal(true)

      // Reset
      setForm({
        tipo_documento: "cedula",
        id_number: "",
        name: "",
        lastname: "",
        email: "",
        password: "",
        telephone: "",
        address: "",
        birth_date: "",
        rol_id: 0,
        seguro_medico: null,
        genre: "",
      })
      setTieneSeguro(false)
      setTipoDocumento("cedula")
    } catch (error: any) {
      console.error(error)

      const backendMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "❌ Error al crear usuario."

      setMessage(backendMessage)
    } finally {
      setLoading(false)
    }
  }

  // Guardar función submit real
  handleSubmitRef.current = async () => {
    const fake = { preventDefault() {} } as any
    await handleSubmit(fake)
  }


  return (
    <div
      className="container mt-4"
      style={{
        maxWidth: 650,
        background: "white",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      }}
    >
      <h2 className="text-center fw-bold mb-2">Registro de Pacientes</h2>

      <p className="text-center text-muted mb-4">
        Rol actual: <strong>{user?.rol || "Desconocido"}</strong>
      </p>

      {message && (
        <div
          className={`alert ${
            message.startsWith("❌") || message.startsWith("⚠️")
              ? "alert-danger"
              : "alert-success"
          } text-center`}
        >
          {message}
        </div>
      )}

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} className="row g-3">

        {/* TIPO DE DOCUMENTO */}
        <div className="col-md-6">
          <label className="form-label">Tipo de Documento</label>
          <select
            className="form-select"
            value={tipoDocumento}
            onChange={(e) => {
              const tipo = e.target.value as "cedula" | "pasaporte"
              setTipoDocumento(tipo)
              setForm(prev => ({ ...prev, tipo_documento: tipo }))
            }}
          >
            <option value="cedula">Cédula ecuatoriana</option>
            <option value="pasaporte">Pasaporte</option>
          </select>
        </div>

        {/* DOCUMENTO */}
        <div className="col-md-6">
          <label className="form-label">
            {tipoDocumento === "cedula" ? "Cédula" : "Pasaporte"}
          </label>
          <input
            className="form-control"
            name="id_number"
            placeholder={
              tipoDocumento === "cedula"
                ? "1720012345"
                : "AB1234567"
            }
            value={form.id_number}
            onChange={handleChange}
            required
            maxLength={tipoDocumento === "cedula" ? 10 : 12}
          />
        </div>

        {/* NOMBRE */}
        <div className="col-md-6">
          <label className="form-label">Nombre</label>
          <input
            className="form-control"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* APELLIDO */}
        <div className="col-md-6">
          <label className="form-label">Apellido</label>
          <input
            className="form-control"
            name="lastname"
            value={form.lastname}
            onChange={handleChange}
            required
          />
        </div>

        {/* CORREO */}
        <div className="col-md-6">
          <label className="form-label">Correo electrónico</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* CONTRASEÑA */}
        <div className="col-md-6">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        {/* TELEFONO */}
        <div className="col-md-6">
          <label className="form-label">Teléfono</label>
          <input
            type="tel"
            className="form-control"
            name="telephone"
            value={form.telephone}
            onChange={handleChange}
            required
          />
        </div>

        {/* DIRECCIÓN */}
        <div className="col-12">
          <label className="form-label">Dirección</label>
          <input
            className="form-control"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
          />
        </div>

        {/* FECHA */}
        <div className="col-md-6">
          <label className="form-label">Fecha de nacimiento</label>
          <input
            type="date"
            className="form-control"
            name="birth_date"
            value={form.birth_date}
            onChange={handleChange}
            required
          />
        </div>

        {/* GENERO */}
        <div className="col-md-6">
          <label className="form-label">Género</label>
          <select
            className="form-select"
            name="genre"
            value={form.genre}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
            <option value="No especifica">No especifica</option>
          </select>
        </div>

        {/* SEGURO */}
        <div className="col-md-6 d-flex align-items-end">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={tieneSeguro}
              onChange={handleSeguroSwitch}
            />
            <label className="form-check-label">¿Tiene seguro médico?</label>
          </div>
        </div>

        {tieneSeguro && (
          <div className="col-12">
            <label className="form-label">Nombre del seguro</label>
            <input
              className="form-control"
              name="seguro_medico"
              value={form.seguro_medico ?? ""}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* ROL */}
        <div className="col-12">
          <label className="form-label">Rol</label>
          {puedeAsignarRol ? (
            <select
              className="form-select"
              name="rol_id"
              value={form.rol_id}
              onChange={handleChange}
              required
            >
              <option value={0}>Seleccionar...</option>
              {roles.map(r => (
                <option key={r.roleid} value={r.roleid}>
                  {r.name}
                </option>
              ))}
            </select>
          ) : (
            <input className="form-control" value="Paciente" disabled />
          )}
        </div>

        {/* BOTÓN */}
        <div className="col-12 mt-2">
          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Creando paciente..." : "Registrar paciente"}
          </button>
        </div>
      </form>

      {/* MODAL ESPERANDO / RESULTADO CONSENTIMIENTO */}
      {showPendingModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-body text-center">

                {modalState === "pending" && (
                  <>
                    <div className="spinner-border text-primary" role="status" />
                    <p className="mt-3">
                      ⏳ Esperando respuesta del paciente por WhatsApp…
                    </p>
                  </>
                )}

                {modalState === "accepted" && (
                  <div className="alert alert-success">
                    ✅ El paciente aceptó el consentimiento.
                  </div>
                )}

                {modalState === "rejected" && (
                  <div className="alert alert-danger">
                    ❌ El paciente rechazó el consentimiento.
                  </div>
                )}

                {modalState === "expired" && (
                  <div className="alert alert-warning">
                    ⏰ El tiempo de espera expiró. No se recibió consentimiento.
                  </div>
                )}

              </div>

              {modalState !== "pending" && (
                <div className="modal-footer">
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowPendingModal(false)}
                  >
                    Cerrar
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
      </div>
  )
}
