import { useEffect, useState } from 'react'
import { fetchRoles, createUser, type Role, type NewUserData } from '@/services/userService'
import { useAuth } from '@/context/AuthContext'

export default function Usuarios() {
  const { user } = useAuth() // 👈 obtenemos usuario y su rol actual
  const [roles, setRoles] = useState<Role[]>([])
  const [form, setForm] = useState<NewUserData>({
    name: '',
    lastname: '',
    email: '',
    password: '',
    telephone: '',
    address: '',
    birth_date: '',
    rol_id: 0,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const puedeAsignarRol = user?.rol === 'Administrador' // 👈 solo admin puede elegir el rol

  // Cargar roles desde la BD
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const data = await fetchRoles()
        setRoles(data)
      } catch (err) {
        console.error('Error cargando roles:', err)
      }
    }
    loadRoles()
  }, [])

  // Si es recepcionista, fijar automáticamente el rol "Paciente"
  useEffect(() => {
    if (!puedeAsignarRol && roles.length > 0) {
      const pacienteRole = roles.find(r =>
        r.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === 'paciente'
      )
      if (pacienteRole) {
        setForm(prev => ({ ...prev, rol_id: pacienteRole.roleid }))
      }
    }
  }, [roles, puedeAsignarRol])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'rol_id' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    // Validaciones manuales
    if (!/^\d{10}$/.test(form.telephone)) {
      setMessage('⚠️ El teléfono debe tener exactamente 10 dígitos.')
      setLoading(false)
      return
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.birth_date)) {
      setMessage('⚠️ La fecha debe tener formato YYYY-MM-DD.')
      setLoading(false)
      return
    }

    try {
      const result = await createUser(form)
      setMessage(`✅ Usuario creado correctamente (Auth ID: ${result.auth_id})`)
      setForm({
        name: '',
        lastname: '',
        email: '',
        password: '',
        telephone: '',
        address: '',
        birth_date: '',
        rol_id: 0,
      })
    } catch (error) {
      console.error(error)
      setMessage('❌ Error al crear usuario.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Registro de Usuarios / Pacientes</h2>
      <p style={{ color: '#555' }}>
        Rol actual: <strong>{user?.rol || 'Desconocido'}</strong>
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          background: '#f9f9f9',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required />
        <input name="lastname" placeholder="Apellido" value={form.lastname} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange} required />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
        />
        <input
          type="tel"
          name="telephone"
          placeholder="Teléfono (10 dígitos)"
          value={form.telephone}
          onChange={handleChange}
          pattern="\d{10}"
          required
        />
        <input name="address" placeholder="Dirección" value={form.address} onChange={handleChange} required minLength={5} />
        <input type="date" name="birth_date" value={form.birth_date} onChange={handleChange} required />

        {puedeAsignarRol ? (
          <select name="rol_id" value={form.rol_id} onChange={handleChange} required>
            <option value={0}>Seleccionar rol...</option>
            {roles.map(r => (
              <option key={r.roleid} value={r.roleid}>
                {r.name}
              </option>
            ))}
          </select>
        ) : (
          <input type="text" value="Paciente" disabled />
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Creando usuario...' : 'Registrar usuario'}
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: '1rem',
            color: message.startsWith('❌') || message.startsWith('⚠️') ? 'red' : 'green',
          }}
        >
          {message}
        </p>
      )}
    </div>
  )
}
