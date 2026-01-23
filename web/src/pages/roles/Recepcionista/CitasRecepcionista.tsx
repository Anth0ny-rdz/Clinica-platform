import { useEffect, useState } from 'react'
import { Modal, Button, Card, Form, Table, Alert, Badge } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

import { createAppointment, fetchAppointments, fetchAvailableHours } from '@/services/appointmentService'
import { fetchUserProfileId } from '@/services/userService'
import { fetchAllPatients } from '@/services/patientService'
import { fetchSpecialties } from '@/services/specialtyService'
import { fetchDoctorsBySpecialty } from '@/services/doctorService'
import { fetchEncountersByPatientBrief } from '@/services/encounterService'
import { useAuth } from '@/context/AuthContext'

export default function CitasRecepcionista() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState<any[]>([])
  const [specialties, setSpecialties] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [filteredPatients, setFilteredPatients] = useState<any[]>([])

  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null)
  const [availableHours, setAvailableHours] = useState<string[]>([])
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null)
  const [profileId, setProfileId] = useState<number | null>(null)

  const [searchPatient, setSearchPatient] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)

  const [modalHistorial, setModalHistorial] = useState(false)
  const [historial, setHistorial] = useState<any[]>([])

  const [searchAppointment, setSearchAppointment] = useState("")

  const [form, setForm] = useState({
    doctor_id: '',
    date: '',
    time: '',
    reason: '',
  })

  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  /* =============================
     CARGA INICIAL
  ============================= */
  useEffect(() => {
    window.scrollTo(0, 0)
    
    ;(async () => {
      try {
        if (user?.auth_id) {
          const data = await fetchUserProfileId(user.auth_id)
          setProfileId(data.user_profile_id)
        }

        const [pats, sp, citas] = await Promise.all([
          fetchAllPatients(),
          fetchSpecialties(),
          fetchAppointments()
        ])

        setPatients(pats)
        setSpecialties(sp)
        setAppointments(citas)
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setInitialLoading(false)
      }
    })()
  }, [user?.auth_id])

  /* =============================
     BUSCADOR PACIENTE
  ============================= */
  function handleSearchPatient(text: string) {
    setSearchPatient(text)

    if (text.length < 2) return setFilteredPatients([])

    const filtered = patients.filter(
      (p) =>
        `${p.names} ${p.lastname} ${p.doc_id}`
          .toLowerCase()
          .includes(text.toLowerCase())
    )

    setFilteredPatients(filtered)
  }

  /* =============================
     FILTRO CITAS
  ============================= */
  const filteredAppointments = appointments.filter((a) =>
    `${a.patient_name} ${a.doctor_name} ${a.reason} ${a.status} ${a.date}`
      .toLowerCase()
      .includes(searchAppointment.toLowerCase())
  )

  /* =============================
     DOCTORES POR ESPECIALIDAD
  ============================= */
  useEffect(() => {
    if (selectedSpecialty !== null) {
      fetchDoctorsBySpecialty(selectedSpecialty)
        .then((d) => setDoctors(d))
        .catch(() => setDoctors([]))
    }
  }, [selectedSpecialty])

  /* =============================
     DISPONIBILIDAD MÉDICO
  ============================= */
  useEffect(() => {
    if (form.doctor_id && form.date) {
      fetchAvailableHours(parseInt(form.doctor_id), form.date)
        .then((data) => {
          if (!data.disponible || data.horas.length === 0) {
            setAvailableHours([])
            setAvailabilityMessage(`❌ El médico no atiende el día ${data.dia || ''}.`)
          } else {
            setAvailableHours(data.horas)
            setAvailabilityMessage(null)
          }
        })
        .catch(() => {
          setAvailableHours([])
          setAvailabilityMessage("⚠️ Error obteniendo disponibilidad.")
        })
    }
  }, [form.doctor_id, form.date])

  /* =============================
     HORAS TOMADAS
  ============================= */
  const horasTomadas = appointments
    .filter(
      (c) =>
        form.doctor_id &&
        c.doctor_profile_id === parseInt(form.doctor_id) &&
        c.date === form.date
    )
    .map((c) => c.time.slice(0, 5))

  /* =============================
     GUARDAR CITA
  ============================= */
  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!selectedPatient) return setMessage("⚠️ Selecciona un paciente.")

    try {
      setLoading(true)

      await createAppointment({
        patient_id: selectedPatient.patient_id,
        doctor_profile_id: parseInt(form.doctor_id),
        created_by: profileId!,
        date: form.date,
        time: form.time,
        reason: form.reason,
      })

      setMessage("✅ Cita registrada correctamente.")
      setForm({ doctor_id: "", date: "", time: "", reason: "" })
      setSelectedPatient(null)
      setSearchPatient("")
      setFilteredPatients([])
      setSelectedSpecialty(null)

      const updated = await fetchAppointments()
      setAppointments(updated)

      setTimeout(() => setMessage(null), 5000)
    } catch {
      setMessage("❌ Error al registrar cita.")
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  /* =============================
     HISTORIAL MÉDICO
  ============================= */
  async function abrirHistorial() {
    if (!selectedPatient) return
    const data = await fetchEncountersByPatientBrief(selectedPatient.patient_id)
    setHistorial(data)
    setModalHistorial(true)
  }

  /* =============================
     RENDER - LOADING STATE
  ============================= */
  if (initialLoading) {
    return (
      <div
        className="citas-recepcionista-container"
        style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
          minHeight: '100vh',
          padding: 0,
          margin: 0,
        }}
      >
        <div style={{ padding: '2rem 1rem' }}>
          <div className="mx-auto content-wrapper" style={{ maxWidth: 1100 }}>
            <div className="skeleton" style={{ height: '60px', width: '200px', marginBottom: '2rem', borderRadius: '12px' }}></div>
            <div className="skeleton" style={{ height: '400px', width: '100%', marginBottom: '2rem', borderRadius: '20px' }}></div>
            <div className="skeleton" style={{ height: '300px', width: '100%', borderRadius: '20px' }}></div>
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
      className="citas-recepcionista-container"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        minHeight: '100vh',
        padding: 0,
        margin: 0,
      }}
    >
      <div style={{ padding: '2rem 1rem' }}>
        <div className="mx-auto content-wrapper" style={{ maxWidth: 1100 }}>
          
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
                📅
              </div>
              <div>
                <h3 className="fw-bold mb-0" style={{ color: "#2c3e50", fontSize: '1.8rem' }}>
                  Agendamiento de Citas
                </h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                  Seleccione un paciente, elija médico y registre la cita
                </p>
              </div>
            </div>
          </div>

          {/* CARD PRINCIPAL - FORMULARIO */}
          <Card
            className="main-card mb-4"
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

              {/* MENSAJE */}
              {message && (
                <Alert 
                  variant={message.startsWith("✅") ? "success" : "danger"}
                  style={{
                    borderRadius: '12px',
                    border: 'none',
                    background: message.startsWith("✅") 
                      ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                      : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                    color: message.startsWith("✅") ? '#065f46' : '#991b1b',
                    fontWeight: 500,
                    padding: '1rem 1.25rem',
                    animation: 'slideInUp 0.4s ease-out',
                  }}
                  dismissible
                  onClose={() => setMessage(null)}
                >
                  {message}
                </Alert>
              )}

              {/* SECCIÓN: BUSCAR PACIENTE */}
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
                  🔎
                </div>
                Buscar Paciente
              </div>

              <Form.Group className="mb-4">
                <Form.Control
                  type="text"
                  placeholder="Ingrese nombre o documento del paciente..."
                  value={searchPatient}
                  onChange={(e) => handleSearchPatient(e.target.value)}
                  style={{
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    padding: '12px 16px',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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
                    {filteredPatients.map((p, index) => (
                      <div
                        key={p.patient_id}
                        className="patient-item"
                        onClick={() => {
                          setSelectedPatient(p)
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
                        <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
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
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #e3e6eb',
                    animation: 'slideInUp 0.4s ease-out',
                  }}
                >
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
                    Paciente Seleccionado
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="info-item">
                        <span style={{ 
                          color: '#6b7280', 
                          fontSize: '0.85rem', 
                          fontWeight: 600, 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.5px' 
                        }}>
                          👤 Nombre Completo
                        </span>
                        <div style={{ 
                          color: '#1f2937', 
                          fontSize: '1rem', 
                          fontWeight: 600, 
                          marginTop: '4px' 
                        }}>
                          {selectedPatient.names} {selectedPatient.lastname}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="info-item">
                        <span style={{ 
                          color: '#6b7280', 
                          fontSize: '0.85rem', 
                          fontWeight: 600, 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.5px' 
                        }}>
                          📄 Documento
                        </span>
                        <div style={{ 
                          color: '#1f2937', 
                          fontSize: '1rem', 
                          fontWeight: 600, 
                          marginTop: '4px' 
                        }}>
                          {selectedPatient.doc_id}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="info-item">
                        <span style={{ 
                          color: '#6b7280', 
                          fontSize: '0.85rem', 
                          fontWeight: 600, 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.5px' 
                        }}>
                          📞 Teléfono
                        </span>
                        <div style={{ 
                          color: '#1f2937', 
                          fontSize: '1rem', 
                          fontWeight: 600, 
                          marginTop: '4px' 
                        }}>
                          {selectedPatient.telephone || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="info-item">
                        <span style={{ 
                          color: '#6b7280', 
                          fontSize: '0.85rem', 
                          fontWeight: 600, 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.5px' 
                        }}>
                          ✉️ Email
                        </span>
                        <div style={{ 
                          color: '#1f2937', 
                          fontSize: '1rem', 
                          fontWeight: 600, 
                          marginTop: '4px' 
                        }}>
                          {selectedPatient.email || "—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Button
                      className="action-btn"
                      onClick={abrirHistorial}
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      📋 Ver Historial Médico
                    </Button>
                  </div>
                </div>
              )}

              {/* SECCIÓN: DATOS DE LA CITA */}
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
                  🩺
                </div>
                Datos de la Cita
              </div>

              <Form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        🏥 Especialidad
                      </Form.Label>
                      <Form.Select
                        value={selectedSpecialty ?? ""}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : null
                          setSelectedSpecialty(val)
                          setForm((prev) => ({ ...prev, doctor_id: '' }))
                        }}
                        required
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                        }}
                      >
                        <option value="">Seleccionar especialidad...</option>
                        {specialties.map((s) => (
                          <option key={s.especialidad_id} value={s.especialidad_id}>
                            {s.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        👨‍⚕️ Médico
                      </Form.Label>
                      <Form.Select
                        value={form.doctor_id}
                        onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                        disabled={!doctors.length}
                        required
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                        }}
                      >
                        <option value="">
                          {doctors.length ? "Seleccionar médico..." : "Primero elige una especialidad"}
                        </option>
                        {doctors.map((d) => (
                          <option key={d.doctors_id} value={d.doctors_id}>
                            Dr. {d.nombres} {d.apellidos}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        📅 Fecha
                      </Form.Label>
                      <Form.Control
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
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
                        🕐 Hora
                      </Form.Label>
                      <Form.Select
                        value={form.time}
                        onChange={(e) => setForm({ ...form, time: e.target.value })}
                        required
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                        }}
                      >
                        <option value="">Seleccionar hora...</option>

                        {availableHours
                          .filter((h) => {
                            if (!form.date) return true

                            const todayStr = new Date().toISOString().split("T")[0]
                            const selectedDateStr = form.date

                            if (selectedDateStr > todayStr) return true
                            if (selectedDateStr < todayStr) return false

                            const now = new Date()
                            const currentMinutes = now.getHours() * 60 + now.getMinutes()

                            const [hour, minute] = h.split(":").map(Number)
                            const slotMinutes = hour * 60 + minute

                            return slotMinutes > currentMinutes
                          })
                          .map((h) => {
                            const ocupada = horasTomadas.includes(h)

                            return (
                              <option
                                key={h}
                                value={ocupada ? "" : h}
                                disabled={ocupada}
                                style={{ color: ocupada ? "#dc3545" : "black" }}
                              >
                                {ocupada ? `${h} — ❌ Ocupada` : h}
                              </option>
                            )
                          })}
                      </Form.Select>
                    </Form.Group>
                  </div>

                  {availabilityMessage && (
                    <div className="col-12">
                      <Alert 
                        variant="warning"
                        style={{
                          borderRadius: '12px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                          color: '#92400e',
                          fontWeight: 500,
                          padding: '1rem 1.25rem',
                        }}
                      >
                        {availabilityMessage}
                      </Alert>
                    </div>
                  )}

                  <div className="col-12">
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                        📝 Motivo de la Cita
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Describa brevemente el motivo de la consulta..."
                        value={form.reason}
                        onChange={(e) => setForm({ ...form, reason: e.target.value })}
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '12px 14px',
                          resize: 'vertical',
                        }}
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <Button
                    type="submit"
                    disabled={loading || !availableHours.length || !selectedPatient}
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
                    {loading ? "⏳ Guardando..." : "✅ Registrar Cita"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* CARD TABLA DE CITAS */}
          <Card
            className="main-card"
            style={{
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              animation: 'slideInUp 0.6s ease-out 0.2s backwards',
            }}
          >
            <Card.Body className="p-4">
              
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
                  🗂️
                </div>
                Citas Registradas
              </div>

              <Form.Control
                type="text"
                placeholder="🔍 Buscar por paciente, médico, motivo o estado..."
                value={searchAppointment}
                onChange={(e) => setSearchAppointment(e.target.value)}
                className="mb-4"
                style={{
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  padding: '12px 16px',
                  fontSize: '0.95rem',
                }}
              />

              {filteredAppointments.length === 0 ? (
                <div className="text-center py-5">
                  <div style={{ fontSize: '5rem', marginBottom: '1.5rem', opacity: 0.3 }}>📅</div>
                  <h5 className="mb-3" style={{ color: '#6b7280', fontWeight: 600 }}>
                    No hay citas registradas
                  </h5>
                  <p className="text-muted" style={{ fontSize: '0.95rem' }}>
                    Las citas que registres aparecerán aquí
                  </p>
                </div>
              ) : (
                <div 
                  className="table-wrapper"
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '2px solid #e5e7eb',
                  }}
                >
                  <Table hover responsive className="mb-0 citas-table">
                    <thead style={{ background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)' }}>
                      <tr>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>📅 Fecha</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>🕐 Hora</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>🧍 Paciente</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>👨‍⚕️ Médico</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>📝 Motivo</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>📊 Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((a, index) => (
                        <tr 
                          key={a.appointment_id}
                          className="table-row"
                          style={{
                            animation: `fadeInRow 0.4s ease-out ${index * 0.05}s backwards`,
                          }}
                        >
                          <td style={{ padding: '1rem', color: '#1f2937', fontWeight: 500 }}>
                            {new Date(a.date).toLocaleDateString('es-EC')}
                          </td>
                          <td style={{ padding: '1rem', color: '#1f2937', fontWeight: 500 }}>
                            {a.time.slice(0, 5)}
                          </td>
                          <td style={{ padding: '1rem', color: '#1f2937', fontWeight: 600 }}>
                            {a.patient_name}
                          </td>
                          <td style={{ padding: '1rem', color: '#1f2937', fontWeight: 500 }}>
                            {a.doctor_name}
                          </td>
                          <td style={{ padding: '1rem', color: '#6b7280' }}>
                            {a.reason || "—"}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <Badge 
                              bg={
                                a.status === "Pendiente"
                                  ? "warning"
                                  : a.status === "cancelada"
                                  ? "danger"
                                  : "success"
                              }
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                padding: '6px 12px',
                                borderRadius: '8px',
                              }}
                            >
                              {a.status === "Pendiente" ? "⏳" : a.status === "cancelada" ? "❌" : "✅"} {a.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>

        </div>
      </div>

      {/* MODAL HISTORIAL */}
      <Modal 
        show={modalHistorial} 
        onHide={() => setModalHistorial(false)} 
        size="lg" 
        centered
      >
        <Modal.Header 
          closeButton
          style={{
            background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)',
            borderBottom: '2px solid #e5e7eb',
          }}
        >
          <Modal.Title style={{ color: '#2c3e50', fontWeight: 700 }}>
            📋 Historial Médico
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: '1.5rem' }}>
          {historial.length === 0 ? (
            <div className="text-center py-4">
              <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>📋</div>
              <h5 className="mb-2" style={{ color: '#6b7280', fontWeight: 600 }}>
                Sin historial médico
              </h5>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                Este paciente no tiene historias clínicas registradas
              </p>
            </div>
          ) : (
            <div 
              className="table-wrapper"
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid #e5e7eb',
              }}
            >
              <Table hover responsive className="mb-0 historial-table">
                <thead style={{ background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)' }}>
                  <tr>
                    <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>📅 Fecha</th>
                    <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>👨‍⚕️ Médico</th>
                    <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>🏥 Especialidad</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((h, index) => (
                    <tr 
                      key={h.encounter_id}
                      style={{
                        animation: `fadeInRow 0.3s ease-out ${index * 0.05}s backwards`,
                      }}
                    >
                      <td style={{ padding: '1rem', color: '#1f2937', fontWeight: 500 }}>
                        {new Date(h.date).toLocaleDateString('es-EC')}
                      </td>
                      <td style={{ padding: '1rem', color: '#1f2937', fontWeight: 600 }}>
                        {h.doctor_name}
                      </td>
                      <td style={{ padding: '1rem', color: '#6b7280' }}>
                        {h.specialty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer style={{ borderTop: '2px solid #e5e7eb' }}>
          <Button 
            variant="secondary" 
            onClick={() => setModalHistorial(false)}
            style={{
              borderRadius: '10px',
              padding: '10px 24px',
              fontWeight: 600,
            }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
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

        /* === TABLA HOVER === */
        .citas-table tbody tr,
        .historial-table tbody tr {
          transition: all 0.3s ease;
          border-bottom: 1px solid #f3f4f6;
        }

        .citas-table tbody tr:hover,
        .historial-table tbody tr:hover {
          background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
          transform: scale(1.01);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
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

        /* === DROPDOWN PACIENTES === */
        .patient-item:hover {
          background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
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