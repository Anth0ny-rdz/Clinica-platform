import { useEffect, useState } from 'react'
import { fetchRoles, createUser, type Role, type NewUserData } from '@/services/userService'
import { createDoctorFull } from '@/services/doctorService'
import { fetchSpecialties, type Specialty } from '@/services/specialtyService'
import { useAuth } from '@/context/AuthContext'
import HorarioAtencionSelector from '@/components/HorarioAtencionSelector'

export default function Usuarios() {
  const { user } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [activeTab, setActiveTab] = useState<'usuarios' | 'doctor'>('usuarios')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [formUser, setFormUser] = useState<NewUserData>({
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

  const [formDoctor, setFormDoctor] = useState({
    cedula_profesional: '',
    nombres: '',
    apellidos: '',
    direccion: '',
    especialidad_id: 0,
    subespecialidad: '',
    titulo_academico: '',
    experiencia_anios: 0,
    telefono: '',
    correo_institucional: '',
    consultorio: '',
    firma_digital: '',
    password: '',
    horario_atencion: {},
  })

  const puedeAsignarRol = user?.rol === 'Administrador'

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rolesData, specialtiesData] = await Promise.all([fetchRoles(), fetchSpecialties()])
        setRoles(rolesData)
        setSpecialties(specialtiesData)
      } catch (err) {
        console.error('Error cargando datos:', err)
      }
    }
    loadData()
  }, [])

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

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    if (!validarCedulaEcuatoriana(formUser.id_number)) {
      setMessage('⚠️ La cédula ingresada no es válida.')
      setLoading(false)
      return
    }
    try {
      const result = await createUser(formUser)
      setMessage(`✅ Usuario creado correctamente (Auth ID: ${result.auth_id})`)
      setFormUser({ id_number: '', name: '', lastname: '', email: '', password: '', telephone: '', address: '', birth_date: '', rol_id: 0 })
    } catch {
      setMessage('❌ Error al crear usuario.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    if (!validarCedulaEcuatoriana(formDoctor.cedula_profesional)) {
      setMessage('⚠️ La cédula ingresada no es válida.')
      setLoading(false)
      return
    }
    try {
      const result = await createDoctorFull(formDoctor)
      setMessage(`✅ Doctor creado correctamente (ID: ${result.doctor_id})`)
      setFormDoctor({
        cedula_profesional: '',
        nombres: '',
        apellidos: '',
        direccion: '',
        especialidad_id: 0,
        subespecialidad: '',
        titulo_academico: '',
        experiencia_anios: 0,
        telefono: '',
        correo_institucional: '',
        consultorio: '',
        firma_digital: '',
        password: '',
        horario_atencion: {},
      })
    } catch {
      setMessage('❌ Error al crear doctor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 780, margin: '2rem auto', padding: '2rem', backgroundColor: '#f8f9fa', borderRadius: 10 }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Gestión de Usuarios y Doctores</h2>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <button onClick={() => setActiveTab('usuarios')} style={{ backgroundColor: activeTab === 'usuarios' ? '#007bff' : '#ccc', color: 'white', padding: '0.7rem 1.5rem', border: 'none', borderRadius: '8px 0 0 8px' }}>🧍 Usuarios</button>
        <button onClick={() => setActiveTab('doctor')} style={{ backgroundColor: activeTab === 'doctor' ? '#007bff' : '#ccc', color: 'white', padding: '0.7rem 1.5rem', border: 'none', borderRadius: '0 8px 8px 0' }}>👨‍⚕️ Doctor</button>
      </div>

      {/* Usuario */}
      {activeTab === 'usuarios' && (
        <form onSubmit={handleSubmitUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input name="id_number" placeholder="Cédula" value={formUser.id_number} onChange={e => setFormUser({ ...formUser, id_number: e.target.value })} required />
          <input name="name" placeholder="Nombre" value={formUser.name} onChange={e => setFormUser({ ...formUser, name: e.target.value })} required />
          <input name="lastname" placeholder="Apellido" value={formUser.lastname} onChange={e => setFormUser({ ...formUser, lastname: e.target.value })} required />
          <input type="email" name="email" placeholder="Correo" value={formUser.email} onChange={e => setFormUser({ ...formUser, email: e.target.value })} required />
          <input type="password" name="password" placeholder="Contraseña" value={formUser.password} onChange={e => setFormUser({ ...formUser, password: e.target.value })} required />
          <input type="tel" name="telephone" placeholder="Teléfono" value={formUser.telephone} onChange={e => setFormUser({ ...formUser, telephone: e.target.value })} required />
          <input name="address" placeholder="Dirección" value={formUser.address} onChange={e => setFormUser({ ...formUser, address: e.target.value })} required />
          <input type="date" name="birth_date" value={formUser.birth_date} onChange={e => setFormUser({ ...formUser, birth_date: e.target.value })} required />

          {puedeAsignarRol ? (
            <select name="rol_id" value={formUser.rol_id} onChange={e => setFormUser({ ...formUser, rol_id: Number(e.target.value) })}>
              <option value={0}>Seleccionar rol...</option>
              {roles.map(r => <option key={r.roleid} value={r.roleid}>{r.name}</option>)}
            </select>
          ) : <input type="text" value="Paciente" disabled />}

          <button type="submit" disabled={loading}>{loading ? 'Creando...' : 'Registrar Usuario'}</button>
        </form>
      )}

      {/* Doctor */}
      {activeTab === 'doctor' && (
        <form onSubmit={handleSubmitDoctor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input name="cedula_profesional" placeholder="Cédula profesional" value={formDoctor.cedula_profesional} onChange={e => setFormDoctor({ ...formDoctor, cedula_profesional: e.target.value })} required />
          <input name="nombres" placeholder="Nombres" value={formDoctor.nombres} onChange={e => setFormDoctor({ ...formDoctor, nombres: e.target.value })} required />
          <input name="apellidos" placeholder="Apellidos" value={formDoctor.apellidos} onChange={e => setFormDoctor({ ...formDoctor, apellidos: e.target.value })} required />
          <input name="direccion" placeholder="Dirección" value={formDoctor.direccion} onChange={e => setFormDoctor({ ...formDoctor, direccion: e.target.value })} required />

          <select name="especialidad_id" value={formDoctor.especialidad_id} onChange={e => setFormDoctor({ ...formDoctor, especialidad_id: Number(e.target.value) })} required>
            <option value={0}>Seleccionar especialidad...</option>
            {specialties.map(s => <option key={s.especialidad_id} value={s.especialidad_id}>{s.name}</option>)}
          </select>

          <input name="subespecialidad" placeholder="Subespecialidad" value={formDoctor.subespecialidad} onChange={e => setFormDoctor({ ...formDoctor, subespecialidad: e.target.value })} />
          <input name="titulo_academico" placeholder="Título académico" value={formDoctor.titulo_academico} onChange={e => setFormDoctor({ ...formDoctor, titulo_academico: e.target.value })} />
          <input type="number" name="experiencia_anios" placeholder="Años de experiencia" value={formDoctor.experiencia_anios} onChange={e => setFormDoctor({ ...formDoctor, experiencia_anios: Number(e.target.value) })} />
          <input name="telefono" placeholder="Teléfono" value={formDoctor.telefono} onChange={e => setFormDoctor({ ...formDoctor, telefono: e.target.value })} />
          <input type="email" name="correo_institucional" placeholder="Correo institucional" value={formDoctor.correo_institucional} onChange={e => setFormDoctor({ ...formDoctor, correo_institucional: e.target.value })} required />

          <HorarioAtencionSelector onHorarioChange={(horario) => setFormDoctor({ ...formDoctor, horario_atencion: horario })} />

          <input name="consultorio" placeholder="Consultorio" value={formDoctor.consultorio} onChange={e => setFormDoctor({ ...formDoctor, consultorio: e.target.value })} />
          <input name="firma_digital" placeholder="Firma digital (URL o hash)" value={formDoctor.firma_digital} onChange={e => setFormDoctor({ ...formDoctor, firma_digital: e.target.value })} />
          <input type="password" name="password" placeholder="Contraseña" value={formDoctor.password} onChange={e => setFormDoctor({ ...formDoctor, password: e.target.value })} required />

          <button type="submit" disabled={loading}>{loading ? 'Creando...' : 'Registrar Doctor'}</button>
        </form>
      )}

      {message && <p style={{ textAlign: 'center', marginTop: '1rem', color: message.startsWith('❌') ? 'red' : 'green' }}>{message}</p>}
    </div>
  )
}
