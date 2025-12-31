import { supabase } from '@/services/supabaseClient'
const API_URL = 'http://127.0.0.1:8000'

export interface Role {
  roleid: number
  name: string
}

export interface NewUserData {
  id_number: string
  name: string
  lastname: string
  email: string
  password: string
  telephone: string
  address: string
  birth_date: string
  rol_id: number
  tipo_documento: "cedula" | "pasaporte"
}

export interface NewPatientData extends NewUserData {
  id_number: string
  name: string
  lastname: string
  telephone: string
  address: string
  birth_date: string
  seguro_medico: string | null
  genre: string
}

export async function fetchRoles(): Promise<Role[]> {
  const { data, error } = await supabase.from('roles').select('roleid, name').order('name')
  if (error) throw error
  return data || []
}

export async function createUser(newUser: NewUserData) {
  const response = await fetch('http://127.0.0.1:8000/create_user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newUser),
  })
  if (!response.ok) {
    const errText = await response.text()
    console.error('❌ Error al crear usuario:', errText)
    throw new Error(errText)
  }
  return await response.json()
}

export async function createPatient(newPatient: NewPatientData) {
  const response = await fetch('http://127.0.0.1:8000/create_user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newPatient),
  })

  if (!response.ok) {
    const errText = await response.text()
    console.error('❌ Error al crear paciente:', errText)
    throw new Error(errText)
  }

  return await response.json()
}


export async function fetchDoctorProfileId(auth_id: string) {
  const response = await fetch(`${API_URL}/doctor/${auth_id}`)
  if (!response.ok) throw new Error('No se encontró el perfil del médico')
  return await response.json()
}


export async function fetchDoctors() {
  const res = await fetch(`${API_URL}/doctors`)
  if (!res.ok) throw new Error('Error al obtener médicos')
  return res.json()
}

export async function fetchUserProfileId(auth_id: string) {
  const response = await fetch(`http://127.0.0.1:8000/user_profile/${auth_id}`)
  if (!response.ok) {
    throw new Error(`Error obteniendo perfil: ${response.statusText}`)
  }
  return await response.json()
}


export async function createUserRequest(data: NewPatientData) {
  const res = await fetch(`${API_URL}/create_user_request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Error enviando solicitud")
  }

  return res.json()
}
