import { supabase } from '@/services/supabaseClient'

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
