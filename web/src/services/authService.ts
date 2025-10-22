import { supabase } from './supabaseClient'

export interface AuthUser {
  auth_id: string
  email: string
  rol: string
}

interface ProfileWithRole {
  rol_id: number
  rol: { name: string } | null
}

// Iniciar sesión con obtención de rol
export async function loginUser(email: string, password: string): Promise<AuthUser | null> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    const user = data.user
    if (!user) throw new Error('No se pudo obtener el usuario de Supabase Auth.')
    console.log('✅ Usuario autenticado:', user.email, '→', user.id)

    // Buscar el perfil vinculado con su rol
    const { data: profile, error: profileError } = await supabase
      .from('user_profile')
      .select(`
        rol_id,
        rol:rol_id (
          name
        )
      `)
      .eq('auth_id', user.id)
      .maybeSingle<ProfileWithRole>()

    if (profileError) {
      console.error('❌ Error al consultar perfil:', profileError)
      return null
    }

    console.log('📄 Resultado Supabase:', profile)

    const rol = profile?.rol?.name ?? 'SinRol'
    console.log('🎯 Rol detectado:', rol)

    return {
      auth_id: user.id,
      email: user.email ?? '',
      rol,
    }
  } catch (err) {
    console.error('❌ Error en loginUser:', err)
    return null
  }
}

// Cerrar sesión
export async function logoutUser(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    console.log('👋 Sesión cerrada correctamente')
  } catch (err) {
    console.error('❌ Error al cerrar sesión:', err)
  }
}
