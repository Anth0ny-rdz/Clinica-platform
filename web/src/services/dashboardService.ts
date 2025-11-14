// src/services/dashboardService.ts
const API_URL = 'http://127.0.0.1:8000'

/**
 * Obtiene la cantidad de pacientes registrados hoy.
 */
export async function fetchPatientsCountToday() {
  const res = await fetch(`${API_URL}/dashboard/patients/count?today=true`)
  if (!res.ok) throw new Error('Error al obtener el conteo de pacientes')
  return await res.json() // { count: number }
}

/**
 * Obtiene la cantidad de citas agendadas para hoy.
 */
export async function fetchAppointmentsCountToday() {
  const res = await fetch(`${API_URL}/dashboard/appointments/today`)
  if (!res.ok) throw new Error('Error al obtener el conteo de citas')
  return await res.json() // { count: number }
}
