// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '@/services/supabaseClient'
import { loginUser, logoutUser, type AuthUser } from '@/services/authService'

interface AuthContextType {
  user: AuthUser | null
  signIn: (email: string, password: string) => Promise<AuthUser | null>
  signOut: () => Promise<void>
}


const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user
      if (sessionUser) {
        // rol opcional (si falla no bloquea)
        const { data: profile } = await supabase
          .from('user_profile')
          .select('rol_id, rol:rol_id(name)')
          .eq('auth_id', sessionUser.id)
          .maybeSingle<{ rol: { name: string } | { name: string }[] | null }>()
        const rol = Array.isArray(profile?.rol)
          ? profile?.rol?.[0]?.name ?? 'SinRol'
          : profile?.rol?.name ?? 'SinRol'

        setUser({ auth_id: sessionUser.id, email: sessionUser.email ?? '', rol })
      }
    }
    bootstrap()

    // Suscripción a cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] onAuthStateChange:', event, session?.user?.id)
      if (session?.user) {
        setUser((prev) => ({
          auth_id: session.user!.id,
          email: session.user!.email ?? '',
          rol: prev?.rol ?? 'SinRol',
        }))
      } else {
        setUser(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<AuthUser | null> => {
  const authUser = await loginUser(email, password)
  if (authUser) setUser(authUser)
  return authUser
}

  const signOut = async () => {
    await logoutUser()
    // onAuthStateChange pondrá user=null, pero lo forzamos ya:
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
