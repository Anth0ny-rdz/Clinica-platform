import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { createEncounter, fetchDoctorIdByAuth } from '@/services/encounterService'

export default function NuevaHistoria() {
  const { patient_id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

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

  // 🩺 Campos de historia médica
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

  // ❤️ Signos vitales
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
    <div style={{ maxWidth: 800, margin: '2rem auto' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: '1rem',
          background: 'transparent',
          border: 'none',
          color: '#007bff',
          cursor: 'pointer',
          fontSize: '1rem',
        }}
      >
        ← Volver
      </button>

      <h2>🩺 Nueva Historia Médica</h2>

      {loadingDoctor ? (
        <p>Cargando perfil del médico...</p>
      ) : !doctorId ? (
        <p style={{ color: 'red' }}>❌ No se encontró el ID del médico.</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            backgroundColor: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: 10,
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          }}
        >
          <label>Motivo de consulta</label>
          <textarea name="reason_for_consultation" value={form.reason_for_consultation} onChange={handleChange} required />

          <label>Síntomas principales</label>
          <textarea name="main_symptoms" value={form.main_symptoms} onChange={handleChange} required />

          <label>Síntomas secundarios</label>
          <textarea name="secondary_symptoms" value={form.secondary_symptoms} onChange={handleChange} />

          <label>Revisión de órganos y sistemas</label>
          <textarea name="revision_organos" value={form.revision_organos} onChange={handleChange} />

          <label>Examen físico</label>
          <textarea name="examen_fisico" value={form.examen_fisico} onChange={handleChange} />

          <label>Diagnóstico</label>
          <textarea name="diagnostico" value={form.diagnostico} onChange={handleChange} />

          <label>Tratamiento</label>
          <textarea name="treatment" value={form.treatment} onChange={handleChange} />

          <label>Observaciones</label>
          <textarea name="observations" value={form.observations} onChange={handleChange} />

          <label>📅 Próxima fecha de control</label>
          <input type="date" name="fecha_para_control" value={form.fecha_para_control} onChange={handleChange} />

          <h3>❤️ Signos Vitales</h3>

          <label>Presión arterial (mmHg)</label>
          <input name="presion_arterial" value={vitals.presion_arterial} onChange={handleVitalChange} />

          <label>Pulso (x min)</label>
          <input name="pulso_xmin" value={vitals.pulso_xmin} onChange={handleVitalChange} />

          <label>Temperatura (°C)</label>
          <input name="temperatura" value={vitals.temperatura} onChange={handleVitalChange} />

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '0.8rem',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {loading ? 'Guardando...' : 'Guardar Historia'}
          </button>
        </form>
      )}

      {message && (
        <p
          style={{
            color: message.startsWith('✅') ? 'green' : 'red',
            marginTop: '1rem',
            textAlign: 'center',
          }}
        >
          {message}
        </p>
      )}
    </div>
  )
}
