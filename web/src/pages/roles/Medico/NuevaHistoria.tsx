import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { createEncounter, createVitalSigns } from '@/services/encounterService'
import { fetchDoctorProfileId } from '@/services/userService'

export default function NuevaHistoria() {
  const { patient_id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()  // 👈 obtiene el médico logueado
  const [doctorProfileId, setDoctorProfileId] = useState<number | null>(null)

  useEffect(() => {
    const loadDoctor = async () => {
      if (user?.auth_id) {
        const data = await fetchDoctorProfileId(user.auth_id)
        setDoctorProfileId(data.user_profile_id)
      }
    }
    loadDoctor()
  }, [user])

  const [form, setForm] = useState({
    reason_for_consultation: '',
    main_symptoms: '',
    secondary_symptoms: '',
    treatment: '',
    observations: '',
  })

  const [vitals, setVitals] = useState({
    presion_arterial: '',
    pulso_xmin: '',
    temperatura: '',
  })

  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setVitals((prev) => ({ ...prev, [name]: value }))
  }

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
        setLoading(true)
        setMessage(null)

        if (!patient_id || !doctorProfileId) {
        throw new Error('No se encontró el ID del paciente o del médico.')
        }

        const dataToSend = {
        patient_id: parseInt(patient_id),
        doctor_profile_id: doctorProfileId,
        ...form,
        vitals, // 👈 Enviar signos vitales dentro del mismo objeto
        }

        await createEncounter(dataToSend)

        setMessage('✅ Historia médica y signos vitales registrados correctamente.')
        setForm({
        reason_for_consultation: '',
        main_symptoms: '',
        secondary_symptoms: '',
        treatment: '',
        observations: '',
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
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>← Volver</button>
      <h2>🩺 Nueva Historia Médica</h2>

      {!doctorProfileId ? (
        <p>Cargando perfil del médico...</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <textarea name="reason_for_consultation" placeholder="Motivo de consulta" value={form.reason_for_consultation} onChange={handleChange} required />
          <textarea name="main_symptoms" placeholder="Síntomas principales" value={form.main_symptoms} onChange={handleChange} required />
          <textarea name="secondary_symptoms" placeholder="Síntomas secundarios" value={form.secondary_symptoms} onChange={handleChange} />
          <textarea name="treatment" placeholder="Tratamiento" value={form.treatment} onChange={handleChange} />
          <textarea name="observations" placeholder="Observaciones" value={form.observations} onChange={handleChange} />

          <h3>❤️ Signos Vitales</h3>
          <input name="presion_arterial" placeholder="Presión arterial (mmHg)" value={vitals.presion_arterial} onChange={handleVitalChange} />
          <input name="pulso_xmin" placeholder="Pulso (x min)" value={vitals.pulso_xmin} onChange={handleVitalChange} />
          <input name="temperatura" placeholder="Temperatura (°C)" value={vitals.temperatura} onChange={handleVitalChange} />

          <button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Historia'}
          </button>
        </form>
      )}

      {message && (
        <p style={{ color: message.startsWith('✅') ? 'green' : 'red', marginTop: '1rem' }}>
          {message}
        </p>
      )}
    </div>
  )
}
