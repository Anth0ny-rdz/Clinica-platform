const API_URL = "http://127.0.0.1:8000"

// 🔹 Obtener todas las habitaciones
export async function fetchAllRooms() {
  const res = await fetch(`${API_URL}/rooms`)
  if (!res.ok) throw new Error("Error al obtener habitaciones")
  return await res.json()
}

// 🔹 Obtener una habitación
export async function fetchRoomById(id: number) {
  const res = await fetch(`${API_URL}/rooms/${id}`)
  if (!res.ok) throw new Error("Error al obtener la habitación")
  return await res.json()
}

// 🔹 Actualizar estado
export async function updateRoomState(id: number, stateData: { state: string; present_state: string }) {
  const res = await fetch(`${API_URL}/rooms/${id}/state`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stateData),
  })
  if (!res.ok) throw new Error("Error al actualizar el estado de la habitación")
  return await res.json()
}
