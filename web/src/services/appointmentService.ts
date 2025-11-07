const API_URL = 'http://127.0.0.1:8000'

export interface Appointment {
  appointment_id?: number
  patient_id: number
  doctor_profile_id: number
  created_by: number
  date: string
  time: string
  reason?: string
  status?: string
}

// 📅 Crear cita
export async function createAppointment(newAppt: Appointment) {
  const res = await fetch(`${API_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newAppt),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// 📋 Obtener todas las citas (recepcionista)
export async function fetchAppointments() {
  const res = await fetch(`${API_URL}/appointments`)
  if (!res.ok) throw new Error('Error al obtener citas')
  return res.json()
}

// 👨‍⚕️ Obtener citas por médico
export async function fetchAppointmentsByDoctor(doctorId: number) {
  const res = await fetch(`${API_URL}/appointments/doctor/${doctorId}`)
  if (!res.ok) throw new Error('Error al obtener citas del médico')
  return res.json()
}

// 🔄 Actualizar estado
export async function updateAppointmentStatus(appointmentId: number, status: string) {
  const res = await fetch(`${API_URL}/appointments/${appointmentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Error al actualizar cita')
  return res.json()
}


export async function fetchAppointmentsCalendar() {
  const response = await fetch('http://127.0.0.1:8000/appointments/calendar')
  if (!response.ok) throw new Error('Error cargando calendario')
  return await response.json()
}
