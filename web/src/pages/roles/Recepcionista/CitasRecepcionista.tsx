import { useEffect, useState } from 'react'
import { createAppointment, fetchAppointments, fetchAvailableHours } from '@/services/appointmentService'
import { fetchUserProfileId } from '@/services/userService'
import { fetchPatientByCedula } from '@/services/patientService'
import { fetchSpecialties } from '@/services/specialtyService'
import { fetchDoctorsBySpecialty } from '@/services/doctorService'
import { useAuth } from '@/context/AuthContext'

export default function CitasRecepcionista() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [specialties, setSpecialties] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null)
  const [availableHours, setAvailableHours] = useState<string[]>([])
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null)
  const [profileId, setProfileId] = useState<number | null>(null)
  const [searchCedula, setSearchCedula] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
  const [form, setForm] = useState({
    doctor_id: '',
    date: '',
    time: '',
    reason: '',
  })
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

  // ✅ Cargar citas y especialidades
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [citas, sp] = await Promise.all([
          fetchAppointments(),
          fetchSpecialties()
        ])
        setAppointments(citas)
        setSpecialties(sp)
      } catch (err) {
        console.error('Error cargando datos iniciales:', err)
      }
    }
    loadAll()
  }, [])

  // 🔄 Cargar doctores al cambiar especialidad
  useEffect(() => {
    const loadDoctors = async () => {
      if (selectedSpecialty !== null) {
        try {
          const docs = await fetchDoctorsBySpecialty(selectedSpecialty)
          setDoctors(docs)
        } catch (err) {
          console.error('Error cargando doctores:', err)
          setDoctors([])
        }
      } else {
        setDoctors([])
      }
    }
    loadDoctors()
  }, [selectedSpecialty])

  // 🔍 Buscar paciente por cédula
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    try {
      const patient = await fetchPatientByCedula(searchCedula)
      setSelectedPatient(patient)
      setMessage(`✅ Paciente encontrado: ${patient.names} ${patient.lastname}`)
    } catch {
      setSelectedPatient(null)
      setMessage('❌ Paciente no encontrado.')
    }
  }

  // 🔹 Manejar cambios en formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // 🔹 Cargar horas disponibles al elegir médico y fecha
  useEffect(() => {
    const loadAvailability = async () => {
      if (form.doctor_id && form.date) {
        try {
          const data = await fetchAvailableHours(parseInt(form.doctor_id), form.date)
          if (!data.disponible || data.horas.length === 0) {
            setAvailableHours([])
            setAvailabilityMessage(`❌ El médico no atiende el día ${data.dia || ''} o no tiene horarios disponibles.`)
          } else {
            setAvailableHours(data.horas)
            setAvailabilityMessage(null)
          }
        } catch (err) {
          console.error('Error al obtener disponibilidad:', err)
          setAvailableHours([])
          setAvailabilityMessage('⚠️ Error al obtener disponibilidad del médico.')
        }
      }
    }
    loadAvailability()
  }, [form.doctor_id, form.date])

  // 🔹 Registrar cita
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
    if (!form.time) {
      setMessage("⚠️ Debes seleccionar una hora disponible.")
      return
    }

    try {
      setLoading(true)
      await createAppointment({
        patient_id: selectedPatient.patient_id,
        doctor_profile_id: parseInt(form.doctor_id),
        created_by: profileId,
        date: form.date,
        time: form.time,
        reason: form.reason,
      })
      setMessage('✅ Cita registrada correctamente')
      setSelectedPatient(null)
      setSearchCedula('')
      setForm({ doctor_id: '', date: '', time: '', reason: '' })
      setAvailableHours([])
      const citas = await fetchAppointments()
      setAppointments(citas)
    } catch (err: any) {
  console.error("Error creando cita:", err)

  let errorMsg = '❌ Error al registrar cita.'
  try {
    // Si el backend devuelve un JSON con { detail: "..." }
    const parsed = typeof err.message === 'string' ? JSON.parse(err.message) : err
    if (parsed?.detail) {
      errorMsg = `❌ ${parsed.detail}`
    } else if (parsed?.message) {
      errorMsg = `❌ ${parsed.message}`
    }
  } catch {
    // Si no es JSON, mostrar el texto plano
    errorMsg = '❌ ' + err.message
  }

  setMessage(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto' }}>
      <h2>📅 Agendamiento de Citas</h2>

      {/* 🔍 Buscar paciente */}
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
        {/* 🩻 Filtro por especialidad */}
        <select
          value={selectedSpecialty !== null ? selectedSpecialty.toString() : ''}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : null
            setSelectedSpecialty(val)
            setForm(prev => ({ ...prev, doctor_id: '' })) // reset doctor al cambiar especialidad
          }}
          required
        >
          <option value="">Seleccionar especialidad...</option>
          {specialties.map(s => (
            <option key={s.especialidad_id} value={s.especialidad_id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* 👨‍⚕️ Médicos filtrados */}
        <select
          name="doctor_id"
          value={form.doctor_id}
          onChange={handleChange}
          required
          disabled={!doctors.length}
        >
          <option value="">
            {doctors.length ? 'Seleccionar médico...' : 'Seleccione una especialidad primero'}
          </option>
          {doctors.map(d => (
            <option key={d.doctors_id} value={d.doctors_id}>
              {d.nombres} {d.apellidos} — {d.subespecialidad || 'Sin subespecialidad'}
            </option>
          ))}
        </select>

        {/* 📅 Fecha */}
        <input type="date" name="date" value={form.date} onChange={handleChange} required />

        {/* ⏰ Horas disponibles */}
        <select
          name="time"
          value={form.time}
          onChange={handleChange}
          required
          disabled={availableHours.length === 0}
        >
          <option value="">Seleccionar hora...</option>
          {availableHours.map(hora => (
            <option key={hora} value={hora}>{hora}</option>
          ))}
        </select>

        {availabilityMessage && (
          <p style={{ color: availabilityMessage.startsWith('❌') ? 'red' : 'orange', marginTop: '0.5rem' }}>
            {availabilityMessage}
          </p>
        )}

        {/* 📝 Motivo */}
        <textarea
          name="reason"
          placeholder="Motivo de la cita"
          value={form.reason}
          onChange={handleChange}
        />

        {/* 💾 Botón bloqueado si no hay horas */}
        <button type="submit" disabled={availableHours.length === 0 || loading}>
          {loading ? 'Guardando...' : 'Registrar Cita'}
        </button>
      </form>

      {message && (
        <p style={{ color: message.startsWith('✅') ? 'green' : 'red', marginTop: '1rem' }}>{message}</p>
      )}

      {/* 📋 Tabla de citas */}
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
