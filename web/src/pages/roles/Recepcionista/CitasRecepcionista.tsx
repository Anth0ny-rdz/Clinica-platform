import { useEffect, useState } from 'react'
import { createAppointment, fetchAppointments } from '@/services/appointmentService'
import { fetchDoctors, fetchUserProfileId } from '@/services/userService'
import { fetchPatientByCedula } from '@/services/patientService'
import { useAuth } from '@/context/AuthContext'

export default function CitasRecepcionista() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [profileId, setProfileId] = useState<number | null>(null)
  const [searchCedula, setSearchCedula] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
  const [form, setForm] = useState({
    doctor_profile_id: '',
    date: '',
    time: '',
    reason: '',
  })
  const [message, setMessage] = useState<string | null>(null)

  // ✅ Cargar perfil del usuario logueado
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.auth_id) {
        const data = await fetchUserProfileId(user.auth_id)
        setProfileId(data.user_profile_id)
      }
    }
    loadProfile()
  }, [user])

  // ✅ Cargar citas y médicos
  useEffect(() => {
    const loadAll = async () => {
      const data = await fetchAppointments()
      setAppointments(data)
      const docs = await fetchDoctors()
      setDoctors(docs)
    }
    loadAll()
  }, [])

  // 🔍 Buscar paciente por cédula
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    try {
      const patient = await fetchPatientByCedula(searchCedula)
      setSelectedPatient(patient)
      setMessage(`✅ Paciente encontrado: ${patient.names} ${patient.lastname}`)
    } catch (err: any) {
      setSelectedPatient(null)
      setMessage('❌ Paciente no encontrado.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) {
      setMessage("⚠️ Primero busca y selecciona un paciente.")
      return
    }
    if (!profileId) {
      setMessage("⚠️ No se ha cargado el perfil del usuario.")
      return
    }

    try {
      await createAppointment({
        patient_id: selectedPatient.patient_id,
        doctor_profile_id: parseInt(form.doctor_profile_id),
        created_by: profileId,
        date: form.date,
        time: form.time,
        reason: form.reason,
      })
      setMessage('✅ Cita registrada correctamente')
      setSelectedPatient(null)
      setSearchCedula('')
      setForm({ doctor_profile_id: '', date: '', time: '', reason: '' })
      const data = await fetchAppointments()
      setAppointments(data)
    } catch (err: any) {
      setMessage('❌ Error: ' + err.message)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto' }}>
      <h2>📅 Agendamiento de Citas</h2>

      {/* 🔍 Buscar paciente por cédula */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Ingrese cédula del paciente"
          value={searchCedula}
          onChange={(e) => setSearchCedula(e.target.value)}
          required
        />
        <button type="submit">Buscar</button>
      </form>

      {/* 🧍 Datos del paciente */}
      {selectedPatient && (
        <div style={{ marginBottom: '1rem', background: '#f7f7f7', padding: '1rem', borderRadius: '8px' }}>
          <p><strong>Paciente:</strong> {selectedPatient.names} {selectedPatient.lastname}</p>
          <p><strong>Teléfono:</strong> {selectedPatient.telephone}</p>
          <p><strong>Correo:</strong> {selectedPatient.email}</p>
        </div>
      )}

      {/* 🩺 Formulario de cita */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <select name="doctor_profile_id" value={form.doctor_profile_id} onChange={handleChange} required>
          <option value="">Seleccionar médico...</option>
          {doctors.map(d => (
            <option key={d.user_profile_id} value={d.user_profile_id}>
              {d.name} {d.lastname} — {d.email}
            </option>
          ))}
        </select>
        <input type="date" name="date" value={form.date} onChange={handleChange} required />
        <select name="time" value={form.time} onChange={handleChange} required>
        <option value="">Seleccionar hora...</option>
        {Array.from({ length: 20 }, (_, i) => {
            const hour = 8 + Math.floor(i / 2)
            const minute = i % 2 === 0 ? "00" : "30"
            const time = `${hour.toString().padStart(2, "0")}:${minute}`
            return <option key={time} value={time}>{time}</option>
        })}
        </select>

        <textarea name="reason" placeholder="Motivo de cita" value={form.reason} onChange={handleChange} />

        <button type="submit">Registrar Cita</button>
      </form>

      {message && <p style={{ color: message.startsWith('✅') ? 'green' : 'red', marginTop: '1rem' }}>{message}</p>}

      <h3>🗂️ Citas Registradas</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Fecha</th><th>Hora</th><th>Paciente</th><th>Médico</th><th>Motivo</th><th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(a => (
            <tr key={a.appointment_id}>
              <td>{a.date}</td>
              <td>{a.time}</td>
              <td>{a.patient_name}</td>
              <td>{a.doctor_name}</td>
              <td>{a.reason || '—'}</td>
              <td>{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
