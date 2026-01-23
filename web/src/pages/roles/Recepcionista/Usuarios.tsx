import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Button, Alert, Modal, Badge } from 'react-bootstrap'
import { fetchRoles, createPatient, type Role, type NewPatientData, createUserRequest, getPendingStatus } from '@/services/userService'
import { useAuth } from '@/context/AuthContext'

export default function Usuarios() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [roles, setRoles] = useState<Role[]>([])

  const [tieneSeguro, setTieneSeguro] = useState(false)
  const [tipoDocumento, setTipoDocumento] = useState<"cedula" | "pasaporte">("cedula")

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
  const [initialLoading, setInitialLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  const puedeAsignarRol = user?.rol === "Administrador"

  const handleSubmitRef = useRef<(() => Promise<void>) | null>(null)

  const [pendingId, setPendingId] = useState<string | null>(null)
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [modalState, setModalState] = useState<
    "pending" | "accepted" | "rejected" | "expired"
  >("pending")

  const [tipoConsentimiento, setTipoConsentimiento] = useState<
    "digital" | "fisico"
  >("digital")

  /* =============================
     CARGAR ROLES
  ============================= */
  useEffect(() => {
    window.scrollTo(0, 0)

    const loadRoles = async () => {
      try {
        const rolesData = await fetchRoles()
        setRoles(rolesData)
      } catch (err) {
        console.error("Error cargando roles:", err)
        setMessage("❌ Error al cargar los roles del sistema")
        setTimeout(() => setMessage(null), 5000)
      } finally {
        setInitialLoading(false)
      }
    }
    loadRoles()
  }, [])

  /* =============================
     POLLING ESTADO CONSENTIMIENTO
  ============================= */
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
    }, 4000)

    return () => clearInterval(interval)
  }, [pendingId])

  /* =============================
     AUTO-ASIGNAR ROL PACIENTE
  ============================= */
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

  /* =============================
     HANDLERS
  ============================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === "rol_id" ? Number(value) : value,
    }))
  }

  const handleSeguroSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setTieneSeguro(checked)
    if (!checked) {
      setForm(prev => ({ ...prev, seguro_medico: null }))
    }
  }

  /* =============================
     VALIDACIÓN CÉDULA
  ============================= */
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

  /* =============================
     SUBMIT
  ============================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    // Validación según tipo de documento
    if (tipoDocumento === "cedula") {
      if (!validarCedulaEcuatoriana(form.id_number)) {
        setMessage("⚠️ La cédula ingresada no es válida.")
        setLoading(false)
        setTimeout(() => setMessage(null), 5000)
        return
      }
    } else {
      const regexPasaporte = /^[A-Za-z0-9]{6,12}$/
      if (!regexPasaporte.test(form.id_number)) {
        setMessage("⚠️ El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos.")
        setLoading(false)
        setTimeout(() => setMessage(null), 5000)
        return
      }
    }

    if (!/^\d{10}$/.test(form.telephone)) {
      setMessage("⚠️ El teléfono debe tener exactamente 10 dígitos.")
      setLoading(false)
      setTimeout(() => setMessage(null), 5000)
      return
    }

    try {
      const dataToSend = {
        ...form,
        tipo_documento: tipoDocumento,
        seguro_medico: tieneSeguro ? form.seguro_medico : "Ninguno",
        consentimiento_tipo: tipoConsentimiento,
      }

      const result = await createUserRequest(dataToSend)

      if (tipoConsentimiento === "fisico") {
        setModalState("accepted")
        setShowPendingModal(true)
        setMessage("✅ Paciente registrado con consentimiento físico.")
        setTimeout(() => setMessage(null), 5000)
        
        // Reset form
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
        return
      }

      // Guardar ID pendiente y abrir modal
      setPendingId(result.pending_id)
      setModalState("pending")
      setShowPendingModal(true)

      // Reset form
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
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  handleSubmitRef.current = async () => {
    const fake = { preventDefault() {} } as any
    await handleSubmit(fake)
  }

  /* =============================
     RENDER - LOADING STATE
  ============================= */
  if (initialLoading) {
    return (
      <div
        className="usuarios-container"
        style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
          minHeight: '100vh',
          padding: 0,
          margin: 0,
        }}
      >
        <div style={{ padding: '2rem 1rem' }}>
          <div className="mx-auto content-wrapper" style={{ maxWidth: 700 }}>
            <div className="skeleton" style={{ height: '60px', width: '200px', marginBottom: '2rem', borderRadius: '12px' }}></div>
            <div className="skeleton" style={{ height: '700px', borderRadius: '20px' }}></div>
          </div>
        </div>
      </div>
    )
  }

  /* =============================
     RENDER PRINCIPAL
  ============================= */
  return (
    <div
      className="usuarios-container"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        minHeight: '100vh',
        padding: 0,
        margin: 0,
      }}
    >
      <div style={{ padding: '2rem 1rem' }}>
        <div className="mx-auto content-wrapper" style={{ maxWidth: 700 }}>
          
          {/* BOTÓN VOLVER */}
          <Button
            variant="link"
            className="back-button mb-4 px-0"
            onClick={() => navigate(-1)}
            style={{
              textDecoration: "none",
              fontWeight: 600,
              color: '#667eea',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>←</span>
            Volver
          </Button>

          {/* HEADER */}
          <div className="header-section mb-4 pb-3" style={{ borderBottom: '2px solid #e5e7eb' }}>
            <div className="d-flex align-items-center gap-3">
              <div 
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                }}
              >
                👥
              </div>
              <div>
                <h3 className="fw-bold mb-0" style={{ color: "#2c3e50", fontSize: '1.8rem' }}>
                  Registro de Pacientes
                </h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                  Rol actual: <Badge 
                    bg="primary" 
                    style={{ 
                      fontSize: '0.85rem', 
                      padding: '6px 12px',
                      borderRadius: '8px'
                    }}
                  >
                    {user?.rol || "Desconocido"}
                  </Badge>
                </p>
              </div>
            </div>
          </div>

          {/* CARD PRINCIPAL */}
          <Card
            className="main-card"
            style={{
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              animation: 'slideInUp 0.6s ease-out 0.1s backwards',
            }}
          >
            <Card.Body className="p-4">

              {/* MENSAJE */}
              {message && (
                <Alert 
                  variant={message.startsWith("❌") || message.startsWith("⚠️") ? "danger" : "success"}
                  style={{
                    borderRadius: '12px',
                    border: 'none',
                    background: message.startsWith("❌") || message.startsWith("⚠️")
                      ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
                      : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                    color: message.startsWith("❌") || message.startsWith("⚠️") ? '#991b1b' : '#065f46',
                    fontWeight: 500,
                    padding: '1rem 1.25rem',
                    animation: 'slideInUp 0.4s ease-out',
                    marginBottom: '1.5rem',
                  }}
                  dismissible
                  onClose={() => setMessage(null)}
                >
                  {message}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>

                {/* SECCIÓN: DATOS PERSONALES */}
                <div 
                  className="section-title mb-3"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#374151',
                  }}
                >
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    }}
                  >
                    📋
                  </div>
                  Datos Personales
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        📄 Tipo de Documento
                      </Form.Label>
                      <Form.Select
                        value={tipoDocumento}
                        onChange={(e) => {
                          const tipo = e.target.value as "cedula" | "pasaporte"
                          setTipoDocumento(tipo)
                          setForm(prev => ({ ...prev, tipo_documento: tipo }))
                        }}
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                        }}
                      >
                        <option value="cedula">🇪🇨 Cédula ecuatoriana</option>
                        <option value="pasaporte">🌍 Pasaporte</option>
                      </Form.Select>
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        🔢 {tipoDocumento === "cedula" ? "Cédula" : "Pasaporte"}
                      </Form.Label>
                      <Form.Control
                        name="id_number"
                        autoComplete='off'
                        placeholder={tipoDocumento === "cedula" ? "1720012345" : "AB1234567"}
                        value={form.id_number}
                        onChange={handleChange}
                        required
                        maxLength={tipoDocumento === "cedula" ? 10 : 12}
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                        }}
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        👤 Nombre
                      </Form.Label>
                      <Form.Control
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                        }}
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        👤 Apellido
                      </Form.Label>
                      <Form.Control
                        name="lastname"
                        value={form.lastname}
                        onChange={handleChange}
                        required
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                        }}
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        ⚧️ Género
                      </Form.Label>
                      <Form.Select
                        name="genre"
                        value={form.genre}
                        onChange={handleChange}
                        required
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                        }}
                      >
                        <option value="">Seleccione género...</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                        <option value="No especifica">No especifica</option>
                      </Form.Select>
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        🎂 Fecha de Nacimiento
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="birth_date"
                        value={form.birth_date}
                        onChange={handleChange}
                        required
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                        }}
                      />
                    </Form.Group>
                  </div>
                </div>

                {/* SECCIÓN: DATOS DE CONTACTO */}
                <div 
                  className="section-title mb-3 mt-4"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#374151',
                  }}
                >
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    }}
                  >
                    📞
                  </div>
                  Datos de Contacto
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        ✉️ Correo Electrónico
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                        }}
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        📱 Teléfono
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="telephone"
                        placeholder="0999999999"
                        value={form.telephone}
                        onChange={handleChange}
                        required
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                        }}
                      />
                    </Form.Group>
                  </div>

                  <div className="col-12">
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        🏠 Dirección
                      </Form.Label>
                      <Form.Control
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                        }}
                      />
                    </Form.Group>
                  </div>
                </div>

                {/* SECCIÓN: SEGURIDAD Y ACCESO */}
                <div 
                  className="section-title mb-3 mt-4"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#374151',
                  }}
                >
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    }}
                  >
                    🔒
                  </div>
                  Seguridad y Acceso
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        🔑 Contraseña
                      </Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                        }}
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        👔 Rol
                      </Form.Label>
                      {puedeAsignarRol ? (
                        <Form.Select
                          name="rol_id"
                          value={form.rol_id}
                          onChange={handleChange}
                          required
                          style={{
                            borderRadius: '10px',
                            border: '2px solid #e5e7eb',
                            padding: '10px 14px',
                          }}
                        >
                          <option value={0}>Seleccionar rol...</option>
                          {roles.map(r => (
                            <option key={r.roleid} value={r.roleid}>
                              {r.name}
                            </option>
                          ))}
                        </Form.Select>
                      ) : (
                        <Form.Control 
                          value="Paciente" 
                          disabled 
                          style={{
                            borderRadius: '10px',
                            border: '2px solid #e5e7eb',
                            padding: '10px 14px',
                            background: '#f3f4f6',
                          }}
                        />
                      )}
                    </Form.Group>
                  </div>
                </div>

                {/* SECCIÓN: SEGURO MÉDICO */}
                <div 
                  className="section-title mb-3 mt-4"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#374151',
                  }}
                >
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    }}
                  >
                    🏥
                  </div>
                  Seguro Médico
                </div>

                <div className="mb-4">
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="seguroSwitch"
                      checked={tieneSeguro}
                      onChange={handleSeguroSwitch}
                      style={{
                        width: '50px',
                        height: '24px',
                        cursor: 'pointer',
                      }}
                    />
                    <label 
                      className="form-check-label" 
                      htmlFor="seguroSwitch"
                      style={{ fontWeight: 600, color: '#374151', marginLeft: '8px' }}
                    >
                      ¿Tiene seguro médico?
                    </label>
                  </div>

                  {tieneSeguro && (
                    <Form.Group style={{ animation: 'slideInUp 0.3s ease-out' }}>
                      <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        💳 Nombre del Seguro
                      </Form.Label>
                      <Form.Control
                        name="seguro_medico"
                        placeholder="Ej: Salud S.A., Ecuasanitas, etc."
                        value={form.seguro_medico ?? ""}
                        onChange={handleChange}
                        required
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                        }}
                      />
                    </Form.Group>
                  )}
                </div>

                {/* SECCIÓN: CONSENTIMIENTO */}
                <div 
                  className="section-title mb-3 mt-4"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#374151',
                  }}
                >
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    }}
                  >
                    📝
                  </div>
                  Tipo de Consentimiento
                </div>

                <div className="mb-4">
                  <div 
                    className="form-check mb-2"
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: tipoConsentimiento === 'digital' ? '2px solid #667eea' : '2px solid #e5e7eb',
                      background: tipoConsentimiento === 'digital' ? 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)' : 'transparent',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <input
                      className="form-check-input"
                      type="radio"
                      name="consentimiento"
                      id="digital"
                      value="digital"
                      checked={tipoConsentimiento === "digital"}
                      onChange={() => setTipoConsentimiento("digital")}
                    />
                    <label className="form-check-label" htmlFor="digital" style={{ fontWeight: 600, marginLeft: '8px' }}>
                      💬 Digital (WhatsApp)
                    </label>
                  </div>

                  <div 
                    className="form-check"
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: tipoConsentimiento === 'fisico' ? '2px solid #667eea' : '2px solid #e5e7eb',
                      background: tipoConsentimiento === 'fisico' ? 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)' : 'transparent',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <input
                      className="form-check-input"
                      type="radio"
                      name="consentimiento"
                      id="fisico"
                      value="fisico"
                      checked={tipoConsentimiento === "fisico"}
                      onChange={() => setTipoConsentimiento("fisico")}
                    />
                    <label className="form-check-label" htmlFor="fisico" style={{ fontWeight: 600, marginLeft: '8px' }}>
                      📄 Físico (en clínica)
                    </label>
                  </div>
                </div>

                {/* BOTÓN SUBMIT */}
                <div className="d-flex justify-content-end mt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="action-btn"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      padding: '12px 32px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      transition: 'all 0.3s ease',
                      width: '100%',
                    }}
                  >
                    {loading ? "⏳ Registrando paciente..." : "✅ Registrar Paciente"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

        </div>
      </div>

      {/* MODAL CONSENTIMIENTO */}
      <Modal 
        show={showPendingModal} 
        onHide={() => modalState !== "pending" && setShowPendingModal(false)}
        centered
        backdrop={modalState === "pending" ? "static" : true}
        keyboard={modalState !== "pending"}
      >
        <Modal.Header 
          closeButton={modalState !== "pending"}
          style={{
            background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)',
            borderBottom: '2px solid #e5e7eb',
          }}
        >
          <Modal.Title style={{ color: '#2c3e50', fontWeight: 700 }}>
            {modalState === "pending" && "⏳ Esperando Respuesta"}
            {modalState === "accepted" && "✅ Consentimiento Aceptado"}
            {modalState === "rejected" && "❌ Consentimiento Rechazado"}
            {modalState === "expired" && "⏰ Tiempo Expirado"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-center p-4">
          {modalState === "pending" && (
            <>
              <div 
                className="spinner-border mb-3" 
                role="status"
                style={{ 
                  width: '60px', 
                  height: '60px',
                  color: '#667eea',
                }}
              >
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p style={{ color: '#374151', fontSize: '1rem', fontWeight: 500 }}>
                Esperando respuesta del paciente por WhatsApp...
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                El paciente debe aceptar o rechazar el consentimiento enviado a su número de teléfono.
              </p>
            </>
          )}

          {modalState === "accepted" && (
            <div>
              <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✅</div>
              <h5 style={{ color: '#065f46', fontWeight: 600, marginBottom: '0.5rem' }}>
                ¡Consentimiento Aceptado!
              </h5>
              <p style={{ color: '#6b7280' }}>
                El paciente ha sido registrado exitosamente en el sistema.
              </p>
            </div>
          )}

          {modalState === "rejected" && (
            <div>
              <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>❌</div>
              <h5 style={{ color: '#991b1b', fontWeight: 600, marginBottom: '0.5rem' }}>
                Consentimiento Rechazado
              </h5>
              <p style={{ color: '#6b7280' }}>
                El paciente rechazó el consentimiento. No se completó el registro.
              </p>
            </div>
          )}

          {modalState === "expired" && (
            <div>
              <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>⏰</div>
              <h5 style={{ color: '#92400e', fontWeight: 600, marginBottom: '0.5rem' }}>
                Tiempo Expirado
              </h5>
              <p style={{ color: '#6b7280' }}>
                No se recibió respuesta a tiempo. Intente registrar al paciente nuevamente.
              </p>
            </div>
          )}
        </Modal.Body>

        {modalState !== "pending" && (
          <Modal.Footer style={{ borderTop: '2px solid #e5e7eb' }}>
            <Button
              onClick={() => setShowPendingModal(false)}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '10px',
                fontWeight: 600,
              }}
            >
              Cerrar
            </Button>
          </Modal.Footer>
        )}
      </Modal>

      {/* ESTILOS */}
      <style>{`
        /* === ANIMACIONES === */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* === SKELETON === */
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s ease-in-out infinite;
        }

        /* === BOTÓN VOLVER === */
        .back-button:hover {
          color: #764ba2 !important;
          transform: translateX(-5px);
        }

        /* === BOTONES ACCIÓN === */
        .action-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          filter: brightness(1.1);
        }

        .action-btn:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* === FORM CHECK === */
        .form-check-input:checked {
          background-color: #667eea;
          border-color: #667eea;
        }

        /* === RESPONSIVE === */
        @media (max-width: 768px) {
          .header-section h3 {
            font-size: 1.4rem !important;
          }

          .section-title {
            font-size: 1rem !important;
          }

          .content-wrapper {
            max-width: 100% !important;
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
      `}</style>
    </div>
  )
}