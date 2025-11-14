const API_URL = 'http://127.0.0.1:8000'

export async function createEncounter(data: any) {
  const res = await fetch(`${API_URL}/encounters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Error creando historia médica')
  }

  return await res.json()
}

// 🔹 Obtener el doctors_id desde el auth_id
export async function fetchDoctorIdByAuth(auth_id: string) {
  const res = await fetch(`${API_URL}/doctor/id/${auth_id}`)
  if (!res.ok) throw new Error('Error obteniendo ID del médico')
  return await res.json()
}

// Obtener todas las historias del paciente
export async function fetchEncountersByPatient(patient_id: number) {
  const res = await fetch(`http://127.0.0.1:8000/patients/${patient_id}/encounters`)
  if (!res.ok) throw new Error(`Error al obtener historias (${res.status})`)
  return await res.json()
}

// Obtener el detalle de una historia específica
export async function fetchEncounterDetail(encounter_id: number) {
  const res = await fetch(`http://127.0.0.1:8000/encounters/detail/${encounter_id}`)
  if (!res.ok) throw new Error(`Error al obtener detalle (${res.status})`)
  return await res.json()
}


// 🔹 HISTORIAL BREVE PARA RECEPCIÓN
export async function fetchEncountersByPatientBrief(patient_id: number) {
  const res = await fetch(`${API_URL}/encounters/patient/${patient_id}/brief`);

  if (!res.ok) {
    throw new Error("Error obteniendo historial médico");
  }

  return await res.json();
}