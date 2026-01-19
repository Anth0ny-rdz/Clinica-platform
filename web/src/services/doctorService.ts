const API_URL = 'http://127.0.0.1:8000'

export async function createDoctorFull(data: any) {
  const res = await fetch(`${API_URL}/create_doctor_full`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  if (!res.ok) {
    // Intentar extraer el mensaje de error del backend
    let errorMessage = 'Error al crear doctor'
    
    try {
      const errorData = await res.json()
      console.log("Error data del backend:", errorData) // Para debug
      // FastAPI envía el error en el campo "detail"
      errorMessage = errorData.detail || errorData.message || errorMessage
    } catch (parseError) {
      // Si no se puede parsear, intentar leer como texto
      console.log("No se pudo parsear JSON, intentando texto...")
      try {
        const errorText = await res.text()
        console.log("Error como texto:", errorText)
        if (errorText) errorMessage = errorText
      } catch (textError) {
        console.log("Tampoco se pudo leer como texto")
      }
    }
    
    throw new Error(errorMessage)
  }
  
  return await res.json()
}

export async function fetchDoctorsBySpecialty(especialidad_id: number) {
  const res = await fetch(`${API_URL}/doctors/by_specialty/${especialidad_id}`)
  if (!res.ok) throw new Error('Error al obtener doctores por especialidad')
  return await res.json()
}


export async function fetchAllDoctorsReal() {
  const res = await fetch(`${API_URL}/doctors/all`)
  if (!res.ok) throw new Error("Error al obtener doctores")
  return await res.json()
}

export async function fetchDoctorByAuth(auth_id: string) {
  const res = await fetch(`${API_URL}/doctor/by_auth/${auth_id}`);
  if (!res.ok) throw new Error("Error obteniendo el perfil del médico");
  return await res.json();
}
