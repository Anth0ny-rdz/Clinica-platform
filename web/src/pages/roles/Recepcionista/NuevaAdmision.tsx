import { useEffect, useState } from "react"
import { Form, Card, Button, Row, Col, Alert } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { fetchAllPatients } from "@/services/patientService"
import { fetchAllDoctorsReal } from "@/services/doctorService"
import { fetchAllRooms } from "@/services/roomService"
import { createAdmission } from "@/services/admissionService"
import { useAuth } from "@/context/AuthContext"

export default function NuevaAdmision() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [patients, setPatients] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [searchPatient, setSearchPatient] = useState("")
  const [filteredPatients, setFilteredPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)

  const [searchDoctor, setSearchDoctor] = useState("")
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null)

  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_profile_id: "",
    fecha_ingreso: "",
    hora_ingreso: "",
    razon_ingreso: "",
    tipo_ingreso: "",
    persona_acompana: "",
    parentesco_acompana: "",
    telefono_acompana: "",
    diagnostico_ingreso: "",
    habitacion_asignada: "",
    cama_asignada: "",
    created_by: user?.auth_id ?? null,
  })

  /* =============================
     CARGAR DATOS INICIALES
  ============================= */
  useEffect(() => {
    window.scrollTo(0, 0)

    async function load() {
      try {
        const [pats, docs, rms] = await Promise.all([
          fetchAllPatients(),
          fetchAllDoctorsReal(),
          fetchAllRooms()
        ])

        setPatients(pats)
        setDoctors(docs)
        setRooms(rms.filter((r: any) => r.state === "Disponible"))
      } catch (err) {
        console.error(err)
        setError("❌ Error cargando datos del sistema")
        setTimeout(() => setError(null), 5000)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  /* =============================
     SEARCH PACIENTE
  ============================= */
  function handleSearchPatient(text: string) {
    setSearchPatient(text)

    if (text.length < 2) return setFilteredPatients([])

    const filtered = patients.filter((p) =>
      `${p.names} ${p.lastname} ${p.doc_id}`.toLowerCase().includes(text.toLowerCase())
    )

    setFilteredPatients(filtered)
  }

  /* =============================
     SEARCH DOCTOR
  ============================= */
  function handleSearchDoctor(text: string) {
    setSearchDoctor(text)

    if (text.length < 2) return setFilteredDoctors([])

    const filtered = doctors.filter((d) =>
      `${d.nombres} ${d.apellidos} ${d.subespecialidad} ${d.cedula_profesional}`
        .toLowerCase()
        .includes(text.toLowerCase())
    )

    setFilteredDoctors(filtered)
  }

  /* =============================
     SUBMIT
  ============================= */
  async function handleSubmit(e: any) {
    e.preventDefault()
    
    if (!formData.patient_id) {
      setError("⚠️ Debe seleccionar un paciente")
      setTimeout(() => setError(null), 5000)
      return
    }

    if (!formData.doctor_profile_id) {
      setError("⚠️ Debe seleccionar un médico responsable")
      setTimeout(() => setError(null), 5000)
      return
    }

    try {
      setSubmitting(true)
      await createAdmission(formData)
      setSuccess("✅ Admisión registrada correctamente")
      setError(null)
      
      // Resetear formulario
      setTimeout(() => {
        navigate(-1)
      }, 2000)
    } catch (err: any) {
      setError(`❌ ${err.message || "Error al registrar la admisión"}`)
      setTimeout(() => setError(null), 5000)
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  /* =============================
     RENDER - LOADING STATE
  ============================= */
  if (loading) {
    return (
      <div
        className="nueva-admision-container"
        style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
          minHeight: '100vh',
          padding: 0,
          margin: 0,
        }}
      >
        <div style={{ padding: '2rem 1rem' }}>
          <div className="mx-auto content-wrapper" style={{ maxWidth: 900 }}>
            <div className="skeleton" style={{ height: '60px', width: '200px', marginBottom: '2rem', borderRadius: '12px' }}></div>
            <div className="skeleton" style={{ height: '600px', borderRadius: '20px' }}></div>
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
      className="nueva-admision-container"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        minHeight: '100vh',
        padding: 0,
        margin: 0,
      }}
    >
      <div style={{ padding: '2rem 1rem' }}>
        <div className="mx-auto content-wrapper" style={{ maxWidth: 900 }}>
          
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
                🏥
              </div>
              <div>
                <h3 className="fw-bold mb-0" style={{ color: "#2c3e50", fontSize: '1.8rem' }}>
                  Nueva Admisión Hospitalaria
                </h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                  Registre el ingreso de un paciente al hospital
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

              {/* BOTÓN REGISTRAR PACIENTE */}
              <div className="d-flex justify-content-end mb-4">
                <Button
                  className="action-btn"
                  onClick={() => navigate("/recepcionista/usuarios")}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  ➕ Registrar Nuevo Paciente
                </Button>
              </div>

              {/* MENSAJES */}
              {success && (
                <Alert 
                  variant="success"
                  style={{
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                    color: '#065f46',
                    fontWeight: 500,
                    padding: '1rem 1.25rem',
                    animation: 'slideInUp 0.4s ease-out',
                  }}
                  dismissible
                  onClose={() => setSuccess(null)}
                >
                  {success}
                </Alert>
              )}

              {error && (
                <Alert 
                  variant="danger"
                  style={{
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                    color: '#991b1b',
                    fontWeight: 500,
                    padding: '1rem 1.25rem',
                    animation: 'slideInUp 0.4s ease-out',
                  }}
                  dismissible
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>

                {/* SECCIÓN: INFORMACIÓN DEL PACIENTE */}
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
                    🧍
                  </div>
                  Información del Paciente
                </div>

                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                    🔍 Buscar Paciente
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por nombre o documento..."
                    value={searchPatient}
                    onChange={(e) => handleSearchPatient(e.target.value)}
                    style={{
                      borderRadius: '10px',
                      border: '2px solid #e5e7eb',
                      padding: '12px 16px',
                      fontSize: '0.95rem',
                    }}
                  />

                  {filteredPatients.length > 0 && (
                    <div 
                      className="patient-dropdown"
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        marginTop: '8px',
                        background: 'white',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      }}
                    >
                      {filteredPatients.map((p: any, index) => (
                        <div
                          key={p.patient_id}
                          className="patient-item"
                          onClick={() => {
                            setSelectedPatient(p)
                            setFormData({ ...formData, patient_id: p.patient_id })
                            setSearchPatient(`${p.names} ${p.lastname} — ${p.doc_id}`)
                            setFilteredPatients([])
                          }}
                          style={{
                            padding: '12px 16px',
                            borderBottom: index < filteredPatients.length - 1 ? '1px solid #f3f4f6' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            animation: `fadeInRow 0.3s ease-out ${index * 0.05}s backwards`,
                          }}
                        >
                          <div style={{ fontWeight: 600, color: '#1f2937' }}>
                            {p.names} {p.lastname}
                          </div>
                          <small style={{ color: '#6b7280' }}>
                            📄 {p.doc_id}
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                </Form.Group>

                {/* PACIENTE SELECCIONADO */}
                {selectedPatient && (
                  <div 
                    className="info-card mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '2px solid #e3e6eb',
                      animation: 'slideInUp 0.4s ease-out',
                    }}
                  >
                    <div className="row g-2">
                      <div className="col-md-6">
                        <small style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                          👤 Paciente
                        </small>
                        <div style={{ color: '#1f2937', fontWeight: 600, fontSize: '0.9rem' }}>
                          {selectedPatient.names} {selectedPatient.lastname}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <small style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                          📄 Documento
                        </small>
                        <div style={{ color: '#1f2937', fontWeight: 600, fontSize: '0.9rem' }}>
                          {selectedPatient.doc_id}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECCIÓN: MÉDICO RESPONSABLE */}
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
                    👨‍⚕️
                  </div>
                  Médico Responsable
                </div>

                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                    🔍 Buscar Médico
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por nombre o especialidad..."
                    value={searchDoctor}
                    onChange={(e) => handleSearchDoctor(e.target.value)}
                    style={{
                      borderRadius: '10px',
                      border: '2px solid #e5e7eb',
                      padding: '12px 16px',
                      fontSize: '0.95rem',
                    }}
                  />

                  {filteredDoctors.length > 0 && (
                    <div 
                      className="doctor-dropdown"
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        marginTop: '8px',
                        background: 'white',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      }}
                    >
                      {filteredDoctors.map((d: any, index) => (
                        <div
                          key={d.doctors_id}
                          className="doctor-item"
                          onClick={() => {
                            setSelectedDoctor(d)
                            setFormData({ ...formData, doctor_profile_id: d.doctors_id })
                            setSearchDoctor(`Dr. ${d.nombres} ${d.apellidos} — ${d.subespecialidad ?? "Sin subespecialidad"}`)
                            setFilteredDoctors([])
                          }}
                          style={{
                            padding: '12px 16px',
                            borderBottom: index < filteredDoctors.length - 1 ? '1px solid #f3f4f6' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            animation: `fadeInRow 0.3s ease-out ${index * 0.05}s backwards`,
                          }}
                        >
                          <div style={{ fontWeight: 600, color: '#1f2937' }}>
                            Dr. {d.nombres} {d.apellidos}
                          </div>
                          <small style={{ color: '#6b7280' }}>
                            {d.subespecialidad ? `🏥 ${d.subespecialidad}` : "Sin subespecialidad"}
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                </Form.Group>

                {/* DOCTOR SELECCIONADO */}
                {selectedDoctor && (
                  <div 
                    className="info-card mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '2px solid #e3e6eb',
                      animation: 'slideInUp 0.4s ease-out',
                    }}
                  >
                    <div className="row g-2">
                      <div className="col-md-6">
                        <small style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                          👨‍⚕️ Médico
                        </small>
                        <div style={{ color: '#1f2937', fontWeight: 600, fontSize: '0.9rem' }}>
                          Dr. {selectedDoctor.nombres} {selectedDoctor.apellidos}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <small style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                          🏥 Especialidad
                        </small>
                        <div style={{ color: '#1f2937', fontWeight: 600, fontSize: '0.9rem' }}>
                          {selectedDoctor.subespecialidad || "General"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECCIÓN: DATOS DE INGRESO */}
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
                    📋
                  </div>
                  Datos de Ingreso
                </div>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        📅 Fecha de Ingreso
                      </Form.Label>
                      <Form.Control
                        type="date"
                        required
                        value={formData.fecha_ingreso}
                        onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        🕐 Hora de Ingreso
                      </Form.Label>
                      <Form.Control
                        type="time"
                        required
                        value={formData.hora_ingreso}
                        onChange={(e) => setFormData({ ...formData, hora_ingreso: e.target.value })}
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                    🏥 Tipo de Ingreso
                  </Form.Label>
                  <Form.Select
                    required
                    value={formData.tipo_ingreso}
                    onChange={(e) => setFormData({ ...formData, tipo_ingreso: e.target.value })}
                    style={{
                      borderRadius: '10px',
                      border: '2px solid #e5e7eb',
                      padding: '10px 14px',
                    }}
                  >
                    <option value="">Seleccione el tipo de ingreso...</option>
                    <option value="urgencia">🚨 Urgencia</option>
                    <option value="hospitalizacion">🏥 Hospitalización</option>
                    <option value="observacion">👁️ Observación</option>
                    <option value="programado">📅 Programado</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                    📝 Razón de Ingreso
                  </Form.Label>
                  <Form.Control
                    required
                    as="textarea"
                    rows={3}
                    placeholder="Describa el motivo del ingreso hospitalario..."
                    value={formData.razon_ingreso}
                    onChange={(e) => setFormData({ ...formData, razon_ingreso: e.target.value })}
                    style={{
                      borderRadius: '10px',
                      border: '2px solid #e5e7eb',
                      padding: '12px 14px',
                      resize: 'vertical',
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                    🩺 Diagnóstico de Ingreso
                  </Form.Label>
                  <Form.Control
                    required
                    as="textarea"
                    rows={3}
                    placeholder="Ingrese el diagnóstico preliminar..."
                    value={formData.diagnostico_ingreso}
                    onChange={(e) => setFormData({ ...formData, diagnostico_ingreso: e.target.value })}
                    style={{
                      borderRadius: '10px',
                      border: '2px solid #e5e7eb',
                      padding: '12px 14px',
                      resize: 'vertical',
                    }}
                  />
                </Form.Group>

                {/* SECCIÓN: ACOMPAÑANTE */}
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
                    👥
                  </div>
                  Datos del Acompañante
                </div>

                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        👤 Nombre Completo
                      </Form.Label>
                      <Form.Control
                        placeholder="Nombre del acompañante"
                        value={formData.persona_acompana}
                        onChange={(e) => setFormData({ ...formData, persona_acompana: e.target.value })}
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        👨‍👩‍👧 Parentesco
                      </Form.Label>
                      <Form.Control
                        placeholder="Ej: Familiar, Amigo"
                        value={formData.parentesco_acompana}
                        onChange={(e) => setFormData({ ...formData, parentesco_acompana: e.target.value })}
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        📞 Teléfono
                      </Form.Label>
                      <Form.Control
                        placeholder="Número de contacto"
                        value={formData.telefono_acompana}
                        onChange={(e) => setFormData({ ...formData, telefono_acompana: e.target.value })}
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* SECCIÓN: HABITACIÓN */}
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
                    🛏️
                  </div>
                  Asignación de Habitación
                </div>

                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                    🏨 Habitación
                  </Form.Label>
                  <Form.Select
                    required
                    value={formData.habitacion_asignada}
                    onChange={(e) => setFormData({ ...formData, habitacion_asignada: e.target.value })}
                    style={{
                      borderRadius: '10px',
                      border: '2px solid #e5e7eb',
                      padding: '10px 14px',
                    }}
                  >
                    <option value="">Seleccione una habitación disponible...</option>
                    {rooms.length === 0 ? (
                      <option disabled>No hay habitaciones disponibles</option>
                    ) : (
                      rooms.map((r: any) => (
                        <option key={r.room_id} value={r.room_id}>
                          {r.tipo} — Habitación {r.number}
                        </option>
                      ))
                    )}
                  </Form.Select>
                  {rooms.length === 0 && (
                    <small style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                      ⚠️ No hay habitaciones disponibles en este momento
                    </small>
                  )}
                </Form.Group>

                {/* BOTÓN SUBMIT */}
                <div className="d-flex justify-content-end mt-4">
                  <Button
                    type="submit"
                    disabled={submitting || rooms.length === 0}
                    className="action-btn"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      padding: '12px 32px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {submitting ? "⏳ Registrando..." : "✅ Registrar Admisión"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

        </div>
      </div>

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

        @keyframes fadeInRow {
          from {
            opacity: 0;
            transform: translateY(10px);
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

        /* === INFO CARD HOVER === */
        .info-card {
          transition: all 0.3s ease;
        }

        .info-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.08);
        }

        /* === DROPDOWN ITEMS === */
        .patient-item:hover,
        .doctor-item:hover {
          background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
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