const API_URL = 'http://127.0.0.1:8000'

// 🔹 Crear historia médica
export async function createEncounter(data: Record<string, any>) {
  const res = await fetch(`${API_URL}/encounters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return await res.json()
}

// 🔹 Crear signos vitales
export async function createVitalSigns(data: Record<string, any>) {
  const res = await fetch(`${API_URL}/vital_signs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return await res.json()
}


export async function fetchEncountersByPatient(patient_id: number) {
  const res = await fetch(`http://127.0.0.1:8000/encounters/${patient_id}`)
  if (!res.ok) throw new Error('Error al obtener historias médicas')
  return await res.json()
}

export async function fetchEncounterDetail(encounter_id: number) {
  const res = await fetch(`http://127.0.0.1:8000/encounters/detail/${encounter_id}`)
  if (!res.ok) throw new Error('Error al obtener detalle de la historia médica')
  return await res.json()
}
