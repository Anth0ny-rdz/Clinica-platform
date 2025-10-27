import { useEffect, useState } from 'react'
import { fetchRoles, createUser, type Role, type NewUserData } from '@/services/userService'
import { useAuth } from '@/context/AuthContext'

export default function Usuarios() {
  const { user } = useAuth() // 👈 obtenemos usuario y su rol actual
  const [roles, setRoles] = useState<Role[]>([])
  const [form, setForm] = useState<NewUserData>({
    id_number: '',
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

  // 🔹 Validación de cédula ecuatoriana
  function validarCedulaEcuatoriana(cedula: string): boolean {
    if (!/^\d{10}$/.test(cedula)) return false
    const provincia = parseInt(cedula.slice(0, 2))
    if (provincia < 1 || provincia > 24) return false
    const digitos = cedula.split('').map(Number)
    const verificador = digitos.pop()!
    for (let i = 0; i < 9; i += 2) {
      digitos[i] *= 2
      if (digitos[i] > 9) digitos[i] -= 9
    }
    const total = digitos.reduce((a, b) => a + b, 0)
    const decena = Math.ceil(total / 10) * 10
    const calculado = decena - total
    return calculado === verificador
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    // Validaciones manuales
    if (!validarCedulaEcuatoriana(form.id_number)) {
      setMessage('⚠️ La cédula ingresada no es válida.')
      setLoading(false)
      return
    }
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
        id_number: '',
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
      <h2>Registro de Pacientes</h2>
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
        {/* 🔹 Nuevo campo de cédula */}
        <input
          name="id_number"
          placeholder="Cédula"
          value={form.id_number}
          onChange={handleChange}
          required
          maxLength={10}
        />

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

        {/* Si es recepcionista, el rol se asigna automáticamente */}
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
