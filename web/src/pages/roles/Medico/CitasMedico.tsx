import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { fetchDoctorProfileId } from '@/services/userService'
import { fetchAppointmentsByDoctor } from '@/services/appointmentService'

export default function CitasMedico() {
  const { user } = useAuth()
  const [doctorProfileId, setDoctorProfileId] = useState<number | null>(null)
  const [appointments, setAppointments] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      if (user?.auth_id) {
        const data = await fetchDoctorProfileId(user.auth_id)
        setDoctorProfileId(data.user_profile_id)
        const citas = await fetchAppointmentsByDoctor(data.user_profile_id)
        setAppointments(citas)
      }
    }
    load()
  }, [user])

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto' }}>
      <h2>🩺 Mis Citas</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>Fecha</th><th>Hora</th><th>Paciente</th><th>Motivo</th><th>Estado</th></tr>
        </thead>
        <tbody>
          {appointments.map(a => (
            <tr key={a.appointment_id}>
              <td>{a.date}</td>
              <td>{a.time}</td>
              <td>{a.patient_id}</td>
              <td>{a.reason}</td>
              <td>{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
