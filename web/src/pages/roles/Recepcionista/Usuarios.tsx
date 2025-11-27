import { useEffect, useState } from 'react'
import { fetchRoles, createUser, createPatient, type Role, type NewPatientData } from '@/services/userService'
import { useAuth } from '@/context/AuthContext'

export default function Usuarios() {
  const { user } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])

  // 🔵 Nuevo: switch para seguro médico
  const [tieneSeguro, setTieneSeguro] = useState(false)

  // 🔵 Formulario específico para PACIENTES
  const [form, setForm] = useState<NewPatientData>({
    id_number: '',
    name: '',
    lastname: '',
    email: '',
    password: '',
    telephone: '',
    address: '',
    birth_date: '',
    rol_id: 0,
    seguro_medico: null,
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const puedeAsignarRol = user?.rol === 'Administrador'

  // Cargar roles
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const data = await fetchRoles()
        setRoles(data)
      } catch (err) {
        console.error('Error cargando roles:', err)
      }
    }
    loadRoles()
  }, [])

  // Si no es admin, asignar Paciente automáticamente
  useEffect(() => {
    if (!puedeAsignarRol && roles.length > 0) {
      const pacienteRole = roles.find(r =>
        r.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === 'paciente'
      )
      if (pacienteRole) {
        setForm(prev => ({ ...prev, rol_id: pacienteRole.roleid }))
      }
    }
  }, [roles, puedeAsignarRol])

  // Cambios del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'rol_id' ? Number(value) : value,
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

  // Validación de cédula ecuatoriana
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

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    // Validaciones
    if (!validarCedulaEcuatoriana(form.id_number)) {
      setMessage('⚠️ La cédula ingresada no es válida.')
      setLoading(false)
      return
    }
    if (!/^\d{10}$/.test(form.telephone)) {
      setMessage('⚠️ El teléfono debe tener exactamente 10 dígitos.')
      setLoading(false)
      return
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.birth_date)) {
      setMessage('⚠️ La fecha debe tener formato YYYY-MM-DD.')
      setLoading(false)
      return
    }

    try {
      const dataToSend = {
        ...form,
        seguro_medico: tieneSeguro ? form.seguro_medico : 'Ninguno',
      }

      const result = await createPatient(dataToSend)

      setMessage(`✅ Usuario creado correctamente (Auth ID: ${result.auth_id})`)

      setForm({
        id_number: '',
        name: '',
        lastname: '',
        email: '',
        password: '',
        telephone: '',
        address: '',
        birth_date: '',
        rol_id: 0,
        seguro_medico: null,
      })
      setTieneSeguro(false)
    } catch (error) {
      console.error(error)
      setMessage('❌ Error al crear usuario.')
    } finally {
      setLoading(false)
    }
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

    {/* ALERTA DE MENSAJE */}
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

      {/* CÉDULA */}
      <div className="col-md-6">
        <label className="form-label">Cédula</label>
        <input
          className="form-control"
          name="id_number"
          placeholder="Cédula"
          value={form.id_number}
          onChange={handleChange}
          required
          maxLength={10}
        />
      </div>

      {/* NOMBRE */}
      <div className="col-md-6">
        <label className="form-label">Nombre</label>
        <input
          className="form-control"
          name="name"
          placeholder="Nombre"
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
          placeholder="Apellido"
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
          placeholder="Correo"
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
          placeholder="Contraseña"
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
          placeholder="Teléfono (10 dígitos)"
          value={form.telephone}
          onChange={handleChange}
          required
        />
      </div>

      {/* DIRECCION */}
      <div className="col-12">
        <label className="form-label">Dirección</label>
        <input
          className="form-control"
          name="address"
          placeholder="Dirección"
          value={form.address}
          onChange={handleChange}
          required
        />
      </div>

      {/* FECHA DE NACIMIENTO */}
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

      {/* SWITCH SEGURO MÉDICO */}
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

      {/* CAMPO SEGURO MÉDICO */}
      {tieneSeguro && (
        <div className="col-12">
          <label className="form-label">Nombre del seguro médico</label>
          <input
            className="form-control"
            name="seguro_medico"
            placeholder="Ej: IESS, Cruz Azul..."
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
            {roles.map((r) => (
              <option key={r.roleid} value={r.roleid}>
                {r.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            className="form-control"
            value="Paciente"
            disabled
          />
        )}
      </div>

      {/* BOTÓN */}
      <div className="col-12 mt-2">
        <button className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Creando paciente..." : "Registrar paciente"}
        </button>
      </div>
    </form>

    {/* SEPARADOR MENSAJE FINAL */}
    {message && (
      <p
        className="text-center mt-3"
        style={{
          color:
            message.startsWith("❌") || message.startsWith("⚠️")
              ? "red"
              : "green",
        }}
      >
        {message}
      </p>
    )}
  </div>
)

}
