const API_URL = "http://127.0.0.1:8000";

// 🟦 Exámenes pendientes
export async function fetchExamPendientes() {
  const res = await fetch(`${API_URL}/lab/pendientes`);
  if (!res.ok) throw new Error("Error cargando exámenes pendientes");
  return res.json();
}

// 🟧 Detalle de item + posible resultado
export async function fetchExamItemDetail(item_id: number) {
  const res = await fetch(`${API_URL}/lab/item/${item_id}`);
  if (!res.ok) throw new Error("Error cargando detalle del examen");
  return res.json();
}

// 🟩 Subir resultado
export async function uploadExamResult(item_id: number, data: any) {
  const res = await fetch(`${API_URL}/exam-items/${item_id}/results`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Error subiendo resultado");
  }

  return res.json();
}


export async function registerExamResult(item_id: number, file_url: string, uploaded_by: number) {
  const res = await fetch(`${API_URL}/exam-items/${item_id}/results`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      file_url,         // ✅ ANTES: file_path
      uploaded_by,
    }),
  });

  if (!res.ok) throw new Error("Error registrando resultado");
  return await res.json();
}


export async function getSignedResultUrl(item_id: number) {
  const res = await fetch(`${API_URL}/exam-results/signed-url/${item_id}`);
  if (!res.ok) throw new Error("No se pudo obtener URL firmada");
  return await res.json();
}