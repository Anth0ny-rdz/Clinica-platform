const API_URL = "http://127.0.0.1:8000";

// ===========================================
// 🔹 Obtener todos los tipos de examen
// ===========================================
export async function fetchAllExamTypes() {
  const res = await fetch(`${API_URL}/exam-types`);

  if (!res.ok) {
    throw new Error("Error obteniendo tipos de examen");
  }

  return await res.json();
}

// ===========================================
// 🔹 Crear la orden de examen
// ===========================================
export async function createExamOrder(data: {
  encounter_id: number;
  patient_id: number;
  doctor_id: number;
  priority: string;
  observations?: string;
}) {
  const res = await fetch(`${API_URL}/exam-orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Error creando orden de examen");
  }

  return await res.json();
}

// ===========================================
// 🔹 Insertar items (varios tipos de examen)
// ===========================================
export async function addExamItems(order_id: number, examtype_ids: number[]) {
  const res = await fetch(`${API_URL}/exam-orders/${order_id}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ examtype_ids }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Error agregando items a la orden");
  }

  return await res.json();
}

// ===========================================
// 🔹 Obtener órdenes por encuentro
// ===========================================
export async function fetchExamOrdersByEncounter(encounter_id: number) {
  const res = await fetch(`${API_URL}/exam-orders/encounter/${encounter_id}`);

  if (!res.ok) {
    throw new Error("Error obteniendo exámenes del encuentro");
  }

  return await res.json();
}

// examService.ts
export async function fetchExamContext(encounter_id: number) {
  const res = await fetch(`${API_URL}/encounters/${encounter_id}/exam-context`)
  if (!res.ok) throw new Error("Error obteniendo datos para crear orden")
  return res.json()
}


export async function fetchExamOrderDetail(order_id: number) {
  const res = await fetch(`${API_URL}/exam-orders/detail/${order_id}`);
  if (!res.ok) throw new Error("Error cargando orden de examen");
  return await res.json();
}

export async function fetchExamResultsByItem(item_id: number) {
  const res = await fetch(`${API_URL}/exam-items/${item_id}/results`);

  if (!res.ok) {
    throw new Error("Error obteniendo resultados del examen");
  }

  return await res.json();
}
