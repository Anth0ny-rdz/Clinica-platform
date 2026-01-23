import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { createEncounter, fetchDoctorIdByAuth } from '@/services/encounterService'
import { Card, Button, Form, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap'
import { analyzeDraftWithAI } from '@/services/aiService'

import AIApoyoClinicoCards from '@/components/AIApoyoClinicoCards'

export default function NuevaHistoria() {
  const { patient_id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [aiLoading, setAiLoading] = useState(false)
  const [aiDraftResult, setAiDraftResult] = useState<any>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiInvalidated, setAiInvalidated] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)

  const [doctorId, setDoctorId] = useState<number | null>(null)
  const [loadingDoctor, setLoadingDoctor] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    const loadDoctor = async () => {
      try {
        if (user?.auth_id) {
          const data = await fetchDoctorIdByAuth(user.auth_id)
          setDoctorId(data.doctor_id)
        }
      } catch (err) {
        console.error('Error obteniendo doctor:', err)
      } finally {
        setLoadingDoctor(false)
      }
    }
    loadDoctor()
  }, [user])

  // Campos de historia médica
  const [form, setForm] = useState({
    reason_for_consultation: '',
    main_symptoms: '',
    secondary_symptoms: '',
    revision_organos: '',
    examen_fisico: '',
    diagnostico: '',
    treatment: '',
    observations: '',
    fecha_para_control: '',
  })

  // Signos vitales
  const [vitals, setVitals] = useState({
    presion_arterial: '',
    pulso_xmin: '',
    temperatura: '',
  })

  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Auto-resize textarea
  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))

    if (e.target.tagName === 'TEXTAREA') {
      autoResize(e as React.ChangeEvent<HTMLTextAreaElement>)
    }

    if (aiDraftResult) {
      setAiDraftResult(null)
      setAiInvalidated(true)
    }
  }

  const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setVitals(prev => ({ ...prev, [name]: value }))
  }

  const handleAnalyzeDraft = async () => {
    try {
      setAiLoading(true)
      setAiError(null)

      const payload = {
        reason_for_consultation: form.reason_for_consultation,
        main_symptoms: form.main_symptoms,
        secondary_symptoms: form.secondary_symptoms,
        revision_organos: form.revision_organos,
        examen_fisico: form.examen_fisico,
        diagnostico: form.diagnostico,
      }

      const result = await analyzeDraftWithAI(payload)
      setAiDraftResult(result.draft_analysis)
      setShowAIPanel(true)

    } catch (e: any) {
      setAiError(e.message)
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setMessage(null)

      if (!patient_id || !doctorId) {
        throw new Error('No se encontró el ID del paciente o del médico.')
      }

      const dataToSend = {
        patient_id: parseInt(patient_id),
        doctor_id: doctorId,
        ...form,
        vitals,
      }

      await createEncounter(dataToSend)
      setMessage('✅ Historia médica y signos vitales registrados correctamente.')

      setAiDraftResult(null)
      setAiInvalidated(false)
      setShowAIPanel(false)

      setForm({
        reason_for_consultation: '',
        main_symptoms: '',
        secondary_symptoms: '',
        revision_organos: '',
        examen_fisico: '',
        diagnostico: '',
        treatment: '',
        observations: '',
        fecha_para_control: '',
      })
      setVitals({ presion_arterial: '', pulso_xmin: '', temperatura: '' })
      
    } catch (err: any) {
      setMessage('❌ Error al guardar historia: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Loading doctor
  if (loadingDoctor) {
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
          <div className="mx-auto" style={{ maxWidth: 1400 }}>
            <div className="text-center py-5">
              <Spinner 
                animation="border" 
                style={{ 
                  width: '4rem', 
                  height: '4rem',
                  color: '#667eea',
                  borderWidth: '4px',
                }}
              />
              <p className="mt-3" style={{ fontWeight: 600, fontSize: '1.1rem', color: '#6b7280' }}>
                Cargando perfil del médico...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!doctorId) {
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
            <div>No se encontró el ID del médico.</div>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div
      className="nueva-historia-container"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        minHeight: '100vh',
        padding: 0,
        margin: 0,
      }}
    >
      <div style={{ padding: '2rem 1rem' }}>
        <div className="mx-auto content-wrapper" style={{ maxWidth: 1400 }}>

          {/* HEADER */}
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

          <div className="header-section mb-4">
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
                🩺
              </div>
              <div>
                <h2 className="fw-bold mb-0" style={{ color: '#2c3e50', fontSize: '1.8rem' }}>
                  Nueva Historia Clínica
                </h2>
                <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                  Complete la información médica del paciente
                </p>
              </div>
            </div>
          </div>

          <Row>
            {/* COLUMNA IZQUIERDA - FORMULARIO */}
            <Col lg={showAIPanel ? 7 : 12} className="mb-4">
              <Form onSubmit={handleSubmit}>

                {/* DATOS CLÍNICOS */}
                <Card
                  className="clinical-card mb-4"
                  style={{
                    borderRadius: '20px',
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                  }}
                >
                  <Card.Body className="p-4">
                    <h5 className="fw-bold mb-4" style={{ color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📋</span>
                      Información clínica
                    </h5>

                    {[
                      { name: 'reason_for_consultation', label: '🩺 Motivo de consulta', required: true },
                      { name: 'main_symptoms', label: '📝 Síntomas principales', required: true },
                      { name: 'secondary_symptoms', label: '📋 Síntomas secundarios', required: false },
                      { name: 'revision_organos', label: '🔬 Revisión de órganos y sistemas', required: false },
                      { name: 'examen_fisico', label: '👁️ Examen físico', required: false },
                      { name: 'diagnostico', label: '🏥 Diagnóstico', required: false },
                      { name: 'treatment', label: '💊 Tratamiento', required: false },
                      { name: 'observations', label: '📌 Observaciones', required: false },
                    ].map((field) => (
                      <Form.Group key={field.name} className="mb-3">
                        <Form.Label style={{ fontWeight: 600, color: '#374151' }}>
                          {field.label}
                          {field.required && <span style={{ color: '#ef4444' }}> *</span>}
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          name={field.name}
                          value={form[field.name as keyof typeof form]}
                          onChange={handleChange}
                          required={field.required}
                          style={{
                            minHeight: '60px',
                            overflow: 'hidden',
                            resize: 'none',
                            borderRadius: '10px',
                            border: '2px solid #e5e7eb',
                            padding: '12px 16px',
                          }}
                        />
                      </Form.Group>
                    ))}

                    <Form.Group>
                      <Form.Label style={{ fontWeight: 600, color: '#374151' }}>
                        📅 Próxima fecha de control
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="fecha_para_control"
                        value={form.fecha_para_control}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '12px 16px',
                        }}
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>

                {/* SIGNOS VITALES */}
                <Card
                  className="vitals-card mb-4"
                  style={{
                    borderRadius: '20px',
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                  }}
                >
                  <Card.Body className="p-4">
                    <h5 className="fw-bold mb-4" style={{ color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>❤️</span>
                      Signos vitales
                    </h5>

                    <Row className="g-3">
                      <Col md={4}>
                        <Form.Label style={{ fontWeight: 600, color: '#374151' }}>
                          🩸 Presión arterial (mmHg)
                        </Form.Label>
                        <Form.Control
                          name="presion_arterial"
                          value={vitals.presion_arterial}
                          onChange={handleVitalChange}
                          placeholder="120/80"
                          style={{
                            borderRadius: '10px',
                            border: '2px solid #e5e7eb',
                            padding: '12px 16px',
                          }}
                        />
                      </Col>

                      <Col md={4}>
                        <Form.Label style={{ fontWeight: 600, color: '#374151' }}>
                          💓 Pulso (x min)
                        </Form.Label>
                        <Form.Control
                          name="pulso_xmin"
                          value={vitals.pulso_xmin}
                          onChange={handleVitalChange}
                          placeholder="70"
                          style={{
                            borderRadius: '10px',
                            border: '2px solid #e5e7eb',
                            padding: '12px 16px',
                          }}
                        />
                      </Col>

                      <Col md={4}>
                        <Form.Label style={{ fontWeight: 600, color: '#374151' }}>
                          🌡️ Temperatura (°C)
                        </Form.Label>
                        <Form.Control
                          name="temperatura"
                          value={vitals.temperatura}
                          onChange={handleVitalChange}
                          placeholder="36.5"
                          style={{
                            borderRadius: '10px',
                            border: '2px solid #e5e7eb',
                            padding: '12px 16px',
                          }}
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* BOTONES DE ACCIÓN */}
                <div className="d-flex gap-2 mb-3">
                  <Button
                    variant="outline-info"
                    onClick={handleAnalyzeDraft}
                    disabled={aiLoading}
                    className="flex-fill ai-analyze-btn"
                    style={{
                      borderRadius: '10px',
                      padding: '12px 20px',
                      fontWeight: 600,
                      borderWidth: '2px',
                    }}
                  >
                    {aiLoading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Analizando...
                      </>
                    ) : (
                      '🧠 Analizar borrador (IA)'
                    )}
                  </Button>

                  {showAIPanel && (
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowAIPanel(false)}
                      className="flex-fill"
                      style={{
                        borderRadius: '10px',
                        padding: '12px 20px',
                        fontWeight: 600,
                        borderWidth: '2px',
                      }}
                    >
                      ✕ Ocultar apoyo IA
                    </Button>
                  )}
                </div>

                {/* MENSAJE IA INVALIDADA */}
                {aiInvalidated && !aiDraftResult && (
                  <Alert 
                    variant="warning"
                    style={{
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                      color: '#92400e',
                      padding: '1rem 1.25rem',
                      marginBottom: '1rem',
                      fontWeight: 500,
                    }}
                  >
                    <div className="d-flex align-items-start gap-2">
                      <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
                      <div>
                        El análisis de apoyo clínico fue invalidado debido a cambios en la información ingresada.
                        <br />
                        Presione nuevamente <strong>"Analizar borrador (IA)"</strong> para obtener nuevas sugerencias.
                      </div>
                    </div>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="submit-btn"
                  style={{
                    width: '100%',
                    background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    padding: '16px 32px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    boxShadow: loading ? 'none' : '0 6px 20px rgba(16, 185, 129, 0.4)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Guardando historia...
                    </>
                  ) : (
                    '💾 Guardar Historia Clínica'
                  )}
                </Button>
              </Form>

              {message && (
                <Alert
                  className="mt-4 text-center"
                  variant={message.startsWith('✅') ? 'success' : 'danger'}
                  style={{
                    borderRadius: '12px',
                    border: 'none',
                    background: message.startsWith('✅') 
                      ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                      : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                    color: message.startsWith('✅') ? '#065f46' : '#991b1b',
                    fontWeight: 500,
                    padding: '1.25rem',
                  }}
                >
                  {message}
                </Alert>
              )}
            </Col>

            {/* COLUMNA DERECHA - APOYO IA */}
            {showAIPanel && (
              <Col lg={5}>
                <div style={{ position: 'sticky', top: '20px' }}>
                  <Card
                    className="ai-panel-card"
                    style={{
                      borderRadius: '20px',
                      border: 'none',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                      overflow: 'hidden',
                    }}
                  >
                    <Card.Body className="p-4">
                      <h5 className="fw-bold mb-4" style={{ color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🧠</span>
                        Apoyo Clínico IA
                      </h5>

                      {aiError && (
                        <Alert 
                          variant="danger"
                          style={{
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                            color: '#991b1b',
                            fontWeight: 500,
                            padding: '1rem',
                          }}
                        >
                          {aiError}
                        </Alert>
                      )}

                      {aiLoading && (
                        <div className="text-center py-5">
                          <Spinner 
                            animation="border"
                            style={{ 
                              width: '3rem', 
                              height: '3rem',
                              color: '#667eea',
                              borderWidth: '3px',
                            }}
                          />
                          <p className="mt-3" style={{ fontWeight: 500, color: '#6b7280' }}>
                            Analizando información clínica...
                          </p>
                        </div>
                      )}

                      {aiDraftResult && !aiLoading && (
                        <AIApoyoClinicoCards data={aiDraftResult} />
                      )}
                    </Card.Body>
                  </Card>
                </div>
              </Col>
            )}
          </Row>
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

          /* === CONTAINER === */
          .nueva-historia-container {
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

          /* === HEADER === */
          .header-section {
            animation: slideInUp 0.6s ease-out 0.2s backwards;
          }

          /* === CARDS === */
          .clinical-card {
            animation: slideInUp 0.6s ease-out 0.3s backwards;
          }

          .vitals-card {
            animation: slideInUp 0.6s ease-out 0.4s backwards;
          }

          .ai-panel-card {
            animation: slideInUp 0.6s ease-out 0.5s backwards;
          }

          /* === TEXTAREAS === */
          .form-control:focus {
            border-color: #667eea !important;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
          }

          /* === BOTONES === */
          .submit-btn:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5) !important;
          }

          .submit-btn:active:not(:disabled) {
            transform: translateY(-1px);
          }

          .submit-btn:disabled {
            cursor: not-allowed;
            opacity: 0.7;
          }

          /* === RESPONSIVE === */
          @media (max-width: 992px) {
            .ai-panel-card {
              position: relative !important;
              top: 0 !important;
            }
          }

          @media (max-width: 768px) {
            .header-section h2 {
              font-size: 1.4rem !important;
            }

            .d-flex.gap-2 {
              flex-direction: column !important;
            }

            .d-flex.gap-2 button {
              width: 100% !important;
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