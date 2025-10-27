const API_URL = 'http://127.0.0.1:8000'

// 🔹 Obtener todos los pacientes
export async function fetchAllPatients() {
  const res = await fetch(`${API_URL}/patients`)
  if (!res.ok) throw new Error('Error al obtener pacientes')
  return await res.json()
}

// 🔹 Buscar paciente por cédula
export async function fetchPatientByCedula(cedula: string) {
  const res = await fetch(`${API_URL}/patients/${cedula}`)
  if (!res.ok) {
    if (res.status === 404) throw new Error('Paciente no encontrado')
    throw new Error('Error en la búsqueda de paciente')
  }
  return await res.json()
}

// 🔹 Actualizar paciente por cédula
export async function updatePatient(cedula: string, updates: Record<string, any>) {
  const res = await fetch(`http://127.0.0.1:8000/patients/${cedula}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err)
  }
  return await res.json()
}
