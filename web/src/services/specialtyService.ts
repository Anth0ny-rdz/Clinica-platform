const API_URL = 'http://127.0.0.1:8000'

export interface Specialty {
  especialidad_id: number
  name: string
  description?: string
}

// 🔹 Obtener todas las especialidades
export async function fetchSpecialties(): Promise<Specialty[]> {
  const res = await fetch(`${API_URL}/specialties`)
  if (!res.ok) throw new Error('Error al obtener especialidades')
  return await res.json()
}
