const API_URL = 'http://127.0.0.1:8000'

export async function analyzeDraftWithAI(data: any) {
  const res = await fetch(`${API_URL}/ai/analyze-draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Error analizando borrador con IA')
  }

  return await res.json()
}
