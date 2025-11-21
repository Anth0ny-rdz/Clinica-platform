import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { fetchUserProfileId } from '@/services/userService'

export default function DashboardLaboratorio() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.auth_id) return

      try {
        const data = await fetchUserProfileId(user.auth_id)
        setProfile(data)
      } catch (err) {
        console.error('Error cargando perfil de laboratorio:', err)
      }
    }

    loadProfile()
  }, [user])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '75vh',
        textAlign: 'center',
        padding: '2rem',
      }}
    >

      {/* 🧪 Avatar simulado (laboratorio) */}
      <div
        style={{
          width: 140,
          height: 140,
          backgroundColor: '#e8e0ff',
          borderRadius: '50%',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          position: 'relative',
        }}
      >

        {/* Cabeza */}
        <div
          style={{
            width: 55,
            height: 55,
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            border: '2px solid #9c7aff',
          }}
        ></div>

        {/* Bata de laboratorio */}
        <div
          style={{
            position: 'absolute',
            marginTop: 80,
            width: 100,
            height: 85,
            backgroundColor: '#9c7aff',
            borderRadius: '12px',
            zIndex: -1,
          }}
        ></div>
      </div>

      {/* Texto de bienvenida */}
      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
        🧪 Bienvenido(a) Laboratorio
      </h1>

      <h2 style={{ color: '#6a35ff', marginBottom: '1.5rem' }}>
        {profile
          ? `${profile.name} ${profile.lastname}`
          : 'Cargando información…'}
      </h2>

      <p style={{ fontSize: '1.1rem', color: '#555', maxWidth: 500 }}>
        Esta es su pantalla principal. Desde aquí podrá procesar exámenes,
        revisar órdenes pendientes y registrar resultados.
      </p>
    </div>
  )
}
