const API_URL = 'http://127.0.0.1:8000'

export async function createDoctorFull(data: any) {
  const res = await fetch(`${API_URL}/create_doctor_full`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Error al crear doctor')
  return await res.json()
}

export async function fetchDoctorsBySpecialty(especialidad_id: number) {
  const res = await fetch(`${API_URL}/doctors/by_specialty/${especialidad_id}`)
  if (!res.ok) throw new Error('Error al obtener doctores por especialidad')
  return await res.json()
}