import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Table, Alert, Badge } from "react-bootstrap"

import Skeleton from '@/components/skeleton'
import {
  fetchPatientByCedula,
  updatePatient,
  fetchHospitalizationsByPatient
} from '@/services/patientService'
import { fetchEncountersByPatient } from '@/services/encounterService'

export default function DetallePaciente() {
  const { doc_id } = useParams()
  const navigate = useNavigate()

  const [patient, setPatient] = useState<any>(null)
  const [encounters, setEncounters] = useState<any[]>([])
  const [hospitalizations, setHospitalizations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)

  /* CARGA DE DATOS */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const loadData = async () => {
      try {
        setLoading(true)

        const data = await fetchPatientByCedula(doc_id!)
        setPatient(data)

        const histories = await fetchEncountersByPatient(data.patient_id)
        setEncounters(histories)

        const admissions = await fetchHospitalizationsByPatient(data.patient_id)
        setHospitalizations(admissions)

      } catch (err: any) {
        console.error('Error cargando datos:', err)
        setMessage(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [doc_id])

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setPatient((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      await updatePatient(doc_id!, patient)
      setEditMode(false)
      setMessage("✅ Paciente actualizado correctamente")
    } catch (err: any) {
      setMessage("❌ Error al guardar cambios: " + err.message)
    }
  }

  /* SKELETON STATE */
  if (loading) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
          minHeight: '100vh',
          padding: 0,
          margin: 0,
        }}
      >
        <div style={{ padding: '2rem 1rem' }}>
          <div className="mx-auto" style={{ maxWidth: 1100 }}>
            {/* HEADER */}
            <div className="d-flex justify-content-between mb-4">
              <Skeleton height={40} width="120px" />
              <Skeleton height={40} width="220px" />
            </div>

            {/* DATOS PACIENTE */}
            <Card style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
              <Card.Body className="p-4">
                <Skeleton height={32} width="40%" className="mb-4" />
                <div className="row">
                  <div className="col-md-6">
                    <Skeleton height={20} className="mb-3" />
                    <Skeleton height={20} className="mb-3" />
                    <Skeleton height={20} className="mb-3" />
                  </div>
                  <div className="col-md-6">
                    <Skeleton height={20} className="mb-3" />
                    <Skeleton height={20} className="mb-3" />
                    <Skeleton height={20} className="mb-3" />
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* HOSPITALIZACIONES */}
            <Card style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
              <Card.Body className="p-4">
                <Skeleton height={32} width="50%" className="mb-3" />
                <Skeleton height={120} />
              </Card.Body>
            </Card>

            {/* HISTORIAS */}
            <Card style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
              <Card.Body className="p-4">
                <Skeleton height={32} width="45%" className="mb-3" />
                <Skeleton height={150} />
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
          minHeight: '100vh',
          padding: 0,
          margin: 0,
        }}
      >
        <div style={{ padding: '2rem 1rem' }}>
          <Alert 
            variant="danger"
            style={{
              maxWidth: 600,
              margin: '4rem auto',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              color: '#991b1b',
              padding: '1.5rem',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
            <div>{message || "Paciente no encontrado"}</div>
          </Alert>
        </div>
      </div>
    )
  }

  /* RENDER REAL */
  return (
    <div
      className="detalle-paciente-container"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        minHeight: '100vh',
        padding: 0,
        margin: 0,
      }}
    >
      <div style={{ padding: '2rem 1rem' }}>
        <div className="mx-auto content-wrapper" style={{ maxWidth: 1100 }}>

          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <Button
              variant="link"
              className="back-button px-0"
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

            <Button
              className="nueva-historia-btn"
              onClick={() => navigate(`/medico/pacientes/${patient.patient_id}/nueva-historia`)}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.3s ease',
              }}
            >
              ➕ Nueva Historia Clínica
            </Button>
          </div>

          {/* DATOS PACIENTE */}
          <Card
            className="patient-card mb-4"
            style={{
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            <Card.Body className="p-4">
              
              {/* HEADER DE LA CARD */}
              <div className="d-flex align-items-center gap-3 mb-4 pb-3" style={{ borderBottom: '2px solid #e5e7eb' }}>
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
                  👤
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: "#2c3e50", fontSize: '1.8rem' }}>
                    Datos del Paciente
                  </h3>
                  <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                    Información personal y antecedentes médicos
                  </p>
                </div>
              </div>

              {/* INFO BÁSICA */}
              <div 
                className="basic-info mb-4"
                style={{
                  background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '2px solid #e3e6eb',
                }}
              >
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="info-item mb-3">
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                        🆔 Cédula
                      </div>
                      <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '1rem' }}>
                        {patient.doc_id}
                      </div>
                    </div>

                    <div className="info-item mb-3">
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                        👤 Nombre completo
                      </div>
                      <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '1rem' }}>
                        {patient.names} {patient.lastname}
                      </div>
                    </div>

                    <div className="info-item">
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                        📞 Teléfono
                      </div>
                      <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '1rem' }}>
                        {patient.telephone || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="info-item mb-3">
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                        📍 Dirección
                      </div>
                      <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '1rem' }}>
                        {patient.address || "—"}
                      </div>
                    </div>

                    <div className="info-item mb-3">
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                        📧 Email
                      </div>
                      <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '1rem' }}>
                        {patient.email || "—"}
                      </div>
                    </div>

                    <div className="info-item">
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                        ⚧️ Género
                      </div>
                      <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '1rem' }}>
                        {patient.genre || "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ANTECEDENTES */}
              <div className="antecedentes-section">
                <h4 className="fw-bold mb-3" style={{ color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🩺</span>
                  Antecedentes Médicos
                </h4>

                {editMode ? (
                  <div className="d-flex flex-column gap-3">
                    {[
                      { name: "personal_history", label: "Antecedentes personales", icon: "📋" },
                      { name: "family_history", label: "Antecedentes familiares", icon: "👨‍👩‍👧‍👦" },
                      { name: "allergy", label: "Alergias", icon: "⚠️" },
                      { name: "common_medicines", label: "Medicamentos comunes", icon: "💊" }
                    ].map(f => (
                      <div key={f.name}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'block' }}>
                          {f.icon} {f.label}
                        </label>
                        <textarea
                          name={f.name}
                          value={patient[f.name] || ""}
                          onChange={handleChange}
                          className="form-control"
                          rows={3}
                          style={{
                            borderRadius: '10px',
                            border: '2px solid #e5e7eb',
                            padding: '10px 14px',
                          }}
                        />
                      </div>
                    ))}

                    <div>
                      <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'block' }}>
                        🩸 Tipo de sangre
                      </label>
                      <select
                        name="blood_type"
                        value={patient.blood_type || ""}
                        onChange={handleChange}
                        className="form-control"
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                        }}
                      >
                        <option value="">Seleccionar tipo de sangre</option>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bt => (
                          <option key={bt} value={bt}>{bt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'block' }}>
                        ⚧️ Género
                      </label>
                      <select
                        name="genre"
                        value={patient.genre || ""}
                        onChange={handleChange}
                        className="form-control"
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                        }}
                      >
                        <option value="">Seleccionar género</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                        <option value="No especifica">No especifica</option>
                      </select>
                    </div>

                    <div className="d-flex gap-2 mt-2">
                      <Button 
                        onClick={handleSave} 
                        className="save-btn"
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          border: 'none',
                          padding: '10px 24px',
                          borderRadius: '10px',
                          fontWeight: 600,
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        💾 Guardar cambios
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => setEditMode(false)}
                        style={{
                          borderRadius: '10px',
                          padding: '10px 24px',
                          fontWeight: 600,
                          borderWidth: '2px',
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="antecedentes-display"
                    style={{
                      background: 'linear-gradient(135deg, #fffdf7 0%, #fffbeb 100%)',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: '2px solid #fbbf24',
                    }}
                  >
                    <div className="mb-3">
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
                        📋 Antecedentes personales
                      </div>
                      <div style={{ color: '#78350f', lineHeight: '1.6' }}>
                        {patient.personal_history || "No especificado"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
                        👨‍👩‍👧‍👦 Antecedentes familiares
                      </div>
                      <div style={{ color: '#78350f', lineHeight: '1.6' }}>
                        {patient.family_history || "No especificado"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
                        ⚠️ Alergias
                      </div>
                      <div style={{ color: '#78350f', lineHeight: '1.6' }}>
                        {patient.allergy || "No especificado"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
                        💊 Medicamentos comunes
                      </div>
                      <div style={{ color: '#78350f', lineHeight: '1.6' }}>
                        {patient.common_medicines || "No especificado"}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
                        🩸 Tipo de sangre
                      </div>
                      <Badge 
                        bg="danger"
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          padding: '6px 12px',
                          borderRadius: '8px',
                        }}
                      >
                        {patient.blood_type || "No especificado"}
                      </Badge>
                    </div>

                    <Button 
                      variant="primary" 
                      className="edit-btn mt-4"
                      onClick={() => setEditMode(true)}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '10px',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      }}
                    >
                      ✏️ Editar información
                    </Button>
                  </div>
                )}

                {message && (
                  <Alert
                    className="mt-3"
                    variant={message.includes("✅") ? "success" : "danger"}
                    style={{
                      borderRadius: '12px',
                      border: 'none',
                      background: message.includes("✅") 
                        ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                        : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                      color: message.includes("✅") ? '#065f46' : '#991b1b',
                      fontWeight: 500,
                      padding: '1rem',
                    }}
                  >
                    {message}
                  </Alert>
                )}
              </div>

            </Card.Body>
          </Card>

          {/* HOSPITALIZACIONES */}
          <Card
            className="hospitalizations-card mb-4"
            style={{
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-2 mb-4">
                <span style={{ fontSize: '1.5rem' }}>🏥</span>
                <h3 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>
                  Hospitalizaciones
                </h3>
              </div>

              {hospitalizations.length === 0 ? (
                <div className="text-center py-4">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>🏥</div>
                  <p style={{ color: '#9ca3af', fontWeight: 500 }}>
                    No existen hospitalizaciones registradas
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
                  <Table hover responsive className="mb-0 hospitalizations-table">
                    <thead style={{ background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)' }}>
                      <tr>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>Ingreso</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>Habitación</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>Razón</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>Estado</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>Alta</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hospitalizations.map((h, index) => (
                        <tr 
                          key={h.admission_id}
                          className="hosp-row"
                          style={{
                            animation: `fadeInRow 0.4s ease-out ${index * 0.1}s backwards`,
                          }}
                        >
                          <td style={{ padding: '1rem', fontWeight: 500, color: '#374151' }}>
                            {h.fecha_ingreso} {h.hora_ingreso}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <Badge 
                              bg="info"
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                padding: '5px 10px',
                                borderRadius: '6px',
                              }}
                            >
                              {h.habitacion_asignada}
                            </Badge>
                          </td>
                          <td style={{ padding: '1rem', color: '#6b7280' }}>
                            {h.razon_ingreso}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <Badge 
                              bg={h.estado_ingreso === "Activo" ? "warning" : "success"}
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                padding: '5px 10px',
                                borderRadius: '6px',
                              }}
                            >
                              {h.estado_ingreso}
                            </Badge>
                          </td>
                          <td style={{ padding: '1rem', color: '#6b7280' }}>
                            {h.fecha_alta ? `${h.fecha_alta} ${h.hora_alta}` : "—"}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <Button
                              size="sm"
                              className="detail-btn"
                              onClick={() => navigate(`/medico/hospitalizaciondetalle/${h.admission_id}`)}
                              style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                              }}
                            >
                              Ver detalle
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* HISTORIAS CLÍNICAS */}
          <Card
            className="histories-card"
            style={{
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-2 mb-4">
                <span style={{ fontSize: '1.5rem' }}>📋</span>
                <h3 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>
                  Historias Clínicas
                </h3>
              </div>

              {encounters.length === 0 ? (
                <div className="text-center py-4">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📋</div>
                  <p style={{ color: '#9ca3af', fontWeight: 500, marginBottom: '1rem' }}>
                    No hay historias clínicas registradas
                  </p>
                  <Button
                    variant="outline-primary"
                    onClick={() => navigate(`/medico/pacientes/${patient.patient_id}/nueva-historia`)}
                    style={{
                      borderRadius: '10px',
                      padding: '10px 24px',
                      fontWeight: 600,
                      borderWidth: '2px',
                    }}
                  >
                    ➕ Crear primera historia
                  </Button>
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
                  <Table hover responsive className="mb-0 histories-table">
                    <thead style={{ background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)' }}>
                      <tr>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>Fecha</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>Motivo</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>Médico</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>Presión</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>Pulso</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>Temp</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {encounters.map((e, index) => (
                        <tr 
                          key={e.encounter_id}
                          className="history-row"
                          style={{
                            animation: `fadeInRow 0.4s ease-out ${index * 0.05}s backwards`,
                          }}
                        >
                          <td style={{ padding: '1rem', fontWeight: 500, color: '#374151' }}>
                            {e.date ? new Date(e.date).toLocaleDateString('es-ES') : "—"}
                          </td>
                          <td style={{ padding: '1rem', color: '#6b7280' }}>
                            {e.reason_for_consultation || "—"}
                          </td>
                          <td style={{ padding: '1rem', fontWeight: 500, color: '#374151' }}>
                            {e.doctor_name || "—"}
                          </td>
                          <td style={{ padding: '1rem', color: '#6b7280' }}>
                            {e.vital_signs?.presion_arterial || "—"}
                          </td>
                          <td style={{ padding: '1rem', color: '#6b7280' }}>
                            {e.vital_signs?.pulso_xmin || "—"}
                          </td>
                          <td style={{ padding: '1rem', color: '#6b7280' }}>
                            {e.vital_signs?.temperatura || "—"}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <Button
                              size="sm"
                              className="detail-btn"
                              onClick={() => navigate(`/medico/pacientes/historia/${e.encounter_id}`)}
                              style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                              }}
                            >
                              Ver detalle
                            </Button>
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

      {/* ESTILOS */}
      <style>
        {`
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

          /* === CONTAINER === */
          .detalle-paciente-container {
            animation: fadeIn 0.6s ease-out;
          }

          .content-wrapper {
            animation: fadeIn 0.7s ease-out 0.1s backwards;
          }

          /* === BOTÓN VOLVER === */
          .back-button:hover {
            color: #764ba2 !important;
            transform: translateX(-5px);
          }

          /* === BOTONES === */
          .nueva-historia-btn:hover,
          .save-btn:hover,
          .edit-btn:hover {
            transform: translateY(-3px);
            filter: brightness(1.1);
          }

          .nueva-historia-btn:active,
          .save-btn:active,
          .edit-btn:active {
            transform: translateY(-1px);
          }

          /* === CARDS === */
          .patient-card {
            animation: slideInUp 0.6s ease-out 0.2s backwards;
          }

          .hospitalizations-card {
            animation: slideInUp 0.6s ease-out 0.3s backwards;
          }

          .histories-card {
            animation: slideInUp 0.6s ease-out 0.4s backwards;
          }

          /* === TABLAS === */
          .hospitalizations-table tbody tr,
          .histories-table tbody tr {
            transition: all 0.3s ease;
            border-bottom: 1px solid #f3f4f6;
          }

          .hospitalizations-table tbody tr:hover {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            transform: scale(1.01);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
          }

          .histories-table tbody tr:hover {
            background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
            transform: scale(1.01);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
          }

          .detail-btn:hover {
            transform: translateY(-3px);
            filter: brightness(1.1);
          }

          .detail-btn:active {
            transform: translateY(-1px);
          }

          /* === RESPONSIVE === */
          @media (max-width: 768px) {
            .nueva-historia-btn {
              padding: 10px 16px !important;
              font-size: 0.9rem !important;
            }

            .histories-table,
            .hospitalizations-table {
              font-size: 0.85rem;
            }

            .histories-table th,
            .histories-table td,
            .hospitalizations-table th,
            .hospitalizations-table td {
              padding: 0.75rem !important;
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
        `}
      </style>
    </div>
  )
}