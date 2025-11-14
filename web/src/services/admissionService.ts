const API_URL = "http://127.0.0.1:8000"

// Crear admisión
export async function createAdmission(data: any) {
  const res = await fetch(`${API_URL}/admissions`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error("Error al crear admisión")
  return await res.json()
}

// Listar activas
export async function fetchActiveAdmissions() {
  const res = await fetch(`${API_URL}/admissions/active`)
  if (!res.ok) throw new Error("Error al obtener admisiones activas")
  return await res.json()
}

// Registrar diagnóstico
export async function updateAdmissionDiagnostico(id: number, diagnostico: string) {
  const res = await fetch(`${API_URL}/admissions/${id}/diagnostico`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ diagnostico_ingreso: diagnostico })
  })
  return await res.json()
}

// Dar alta médica
export async function registrarAlta(admission_id: number, data: any) {
  const res = await fetch(`${API_URL}/admissions/${admission_id}/alta`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error registrando alta médica");

  return res.json();
}


export async function fetchHospitalizacionesMedico(doctor_profile_id: number) {
  const res = await fetch(`${API_URL}/admissions/medico/${doctor_profile_id}`);

  if (!res.ok) {
    throw new Error("Error al obtener hospitalizaciones del médico");
  }

  return await res.json();
}

export async function fetchAdmissionById(id: number) {
  const res = await fetch(`${API_URL}/admissions/${id}`);
  if (!res.ok) throw new Error("Error obteniendo admisión");
  return res.json();
}

export async function altaMedica(admission_id: number, data: any) {
  const res = await fetch(`${API_URL}/admissions/${admission_id}/alta`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error("Error registrando el alta");
  return res.json();
}