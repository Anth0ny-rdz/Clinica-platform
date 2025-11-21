import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { fetchUserProfileId } from '@/services/userService'

export default function HomeMedico() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.auth_id) return

      try {
        const data = await fetchUserProfileId(user.auth_id)
        setProfile(data)
      } catch (err) {
        console.error('Error cargando perfil de médico:', err)
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

      {/* 🟦 Avatar simulado */}
      <div
        style={{
          width: 140,
          height: 140,
          backgroundColor: '#cce4f7',
          borderRadius: '50%',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
        }}
      >
        {/* Cabeza del avatar */}
        <div
          style={{
            width: 60,
            height: 60,
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            marginBottom: 5,
            border: '2px solid #7db7e8',
          }}
        ></div>

        {/* Cuerpo (camisa) */}
        <div
          style={{
            position: 'absolute',
            marginTop: 80,
            width: 90,
            height: 80,
            backgroundColor: '#7db7e8',
            borderRadius: '15px',
            zIndex: -1,
          }}
        ></div>
      </div>

      {/* Texto de bienvenida */}
      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
        👨‍⚕️ Bienvenido Médico
      </h1>

      <h2 style={{ color: '#0077cc', marginBottom: '1.5rem' }}>
        {profile
          ? `${profile.name} ${profile.lastname}`
          : 'Cargando información…'}
      </h2>

      <p style={{ fontSize: '1.1rem', color: '#555', maxWidth: 500 }}>
        Esta es su pantalla principal. Desde aquí podrá gestionar sus citas,
        pacientes y acceder a las historias clínicas.
      </p>
    </div>
  )
}
