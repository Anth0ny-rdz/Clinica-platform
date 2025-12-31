import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { createEncounter, fetchDoctorIdByAuth } from '@/services/encounterService'
import { Card, Button, Form, Alert, Spinner } from 'react-bootstrap'
import { analyzeDraftWithAI } from '@/services/aiService'

import AIApoyoClinicoCards from '@/components/AIApoyoClinicoCards'

export default function NuevaHistoria() {
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

  } catch (e: any) {
    setAiError(e.message)
  } finally {
    setAiLoading(false)
  }
}

  const { patient_id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [aiLoading, setAiLoading] = useState(false)
  const [aiDraftResult, setAiDraftResult] = useState<any>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiInvalidated, setAiInvalidated] = useState(false)



  const [doctorId, setDoctorId] = useState<number | null>(null)
  const [loadingDoctor, setLoadingDoctor] = useState(true)

  useEffect(() => {
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

  // 🩺 Campos de historia médica (ORIGINAL)
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

  // ❤️ Signos vitales (ORIGINAL)
  const [vitals, setVitals] = useState({
    presion_arterial: '',
    pulso_xmin: '',
    temperatura: '',
  })

  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))

    if (aiDraftResult) {
      setAiDraftResult(null)
      setAiInvalidated(true)
    }
  }

  const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setVitals(prev => ({ ...prev, [name]: value }))
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

      // 🧠 LIMPIAR APOYO IA TRAS GUARDAR
      setAiDraftResult(null)
      setAiInvalidated(false)

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

  return (
    <div className="container mt-4" style={{ maxWidth: 900 }}>

      {/* HEADER */}
      <Button variant="link" onClick={() => navigate(-1)} className="mb-2">
        ← Volver
      </Button>

      <h2 className="mb-1">🩺 Nueva Historia Clínica</h2>
      <p className="text-muted mb-4">
        Complete la información médica del paciente
      </p>

      {loadingDoctor ? (
        <div className="text-center text-muted my-4">
          <Spinner animation="border" size="sm" className="me-2" />
          Cargando perfil del médico...
        </div>
      ) : !doctorId ? (
        <Alert variant="danger">
          ❌ No se encontró el ID del médico.
        </Alert>
      ) : (
        <Form onSubmit={handleSubmit}>

          {/* ================= DATOS CLÍNICOS ================= */}
          <Card className="shadow-sm p-4 mb-4">
            <h5 className="mb-3">📋 Información clínica</h5>

            <Form.Group className="mb-3">
              <Form.Label>Motivo de consulta</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="reason_for_consultation"
                value={form.reason_for_consultation}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Síntomas principales</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="main_symptoms"
                value={form.main_symptoms}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Síntomas secundarios</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="secondary_symptoms"
                value={form.secondary_symptoms}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Revisión de órganos y sistemas</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="revision_organos"
                value={form.revision_organos}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Examen físico</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="examen_fisico"
                value={form.examen_fisico}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Diagnóstico</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="diagnostico"
                value={form.diagnostico}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tratamiento</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="treatment"
                value={form.treatment}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="observations"
                value={form.observations}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>📅 Próxima fecha de control</Form.Label>
              <Form.Control
                type="date"
                name="fecha_para_control"
                value={form.fecha_para_control}
                onChange={handleChange}
              />
            </Form.Group>
          </Card>

          {/* ================= SIGNOS VITALES ================= */}
          <Card className="shadow-sm p-4 mb-4">
            <h5 className="mb-3">❤️ Signos vitales</h5>

            <div className="row">
              <div className="col-md-4 mb-3">
                <Form.Label>Presión arterial (mmHg)</Form.Label>
                <Form.Control
                  name="presion_arterial"
                  value={vitals.presion_arterial}
                  onChange={handleVitalChange}
                />
              </div>

              <div className="col-md-4 mb-3">
                <Form.Label>Pulso (x min)</Form.Label>
                <Form.Control
                  name="pulso_xmin"
                  value={vitals.pulso_xmin}
                  onChange={handleVitalChange}
                />
              </div>

              <div className="col-md-4 mb-3">
                <Form.Label>Temperatura (°C)</Form.Label>
                <Form.Control
                  name="temperatura"
                  value={vitals.temperatura}
                  onChange={handleVitalChange}
                />
              </div>
            </div>
          </Card>

          <Button
            variant="outline-info"
            onClick={handleAnalyzeDraft}
            disabled={aiLoading}
          >
            {aiLoading ? 'Analizando...' : '🧠 Analizar borrador (IA)'}
          </Button>

            {/* ================= RESULTADO IA BORRADOR ================= */}

              {aiError && (
                <Alert variant="danger" className="mt-3">
                  {aiError}
                </Alert>
              )}

              {aiDraftResult && (
                <div className="mt-4">
                  <AIApoyoClinicoCards data={aiDraftResult} />
                </div>
              )}

              {/* ================= MENSAJE IA INVALIDADA ================= */}
              {aiInvalidated && !aiDraftResult && (
                <Alert variant="secondary" className="mt-3">
                  ℹ️ El análisis de apoyo clínico fue invalidado debido a cambios en la información ingresada.
                  <br />
                  Presione nuevamente <strong>“Analizar borrador (IA)”</strong> para obtener nuevas sugerencias.
                </Alert>
              )}



          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-100"
          >
            {loading ? 'Guardando historia...' : '💾 Guardar Historia Clínica'}
          </Button>
        </Form>
      )}

      {message && (
        <Alert
          className="mt-4 text-center"
          variant={message.startsWith('✅') ? 'success' : 'danger'}
        >
          {message}
        </Alert>
      )}
    </div>
  )
}
