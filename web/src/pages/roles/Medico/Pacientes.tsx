import { useEffect, useState } from 'react'
import { fetchAllPatients, fetchPatientByCedula } from '@/services/patientService'
import { useNavigate } from 'react-router-dom'

interface Patient {
  patient_id: number
  doc_id: string
  names: string
  lastname: string
  birth_date: string
  telephone: string
  address: string
  email: string
  provincia?: string
  ciudad?: string
  parroquia?: string
}

export default function Pacientes() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchCedula, setSearchCedula] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // 🔹 Cargar todos los pacientes al montar
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true)
        const data = await fetchAllPatients()
        setPatients(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadPatients()
  }, [])

  // Buscar paciente por cédula
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchCedula.trim()) return
    try {
      setLoading(true)
      setError(null)
      const patient = await fetchPatientByCedula(searchCedula)
      setPatients([patient]) // mostrar solo el resultado
    } catch (err: any) {
      setError(err.message)
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  // 🔄 Reiniciar búsqueda
  const resetSearch = async () => {
    setSearchCedula('')
    setError(null)
    const data = await fetchAllPatients()
    setPatients(data)
  }

  const handleViewDetails = (doc_id: string) => {
    navigate(`/medico/pacientes/${doc_id}`)
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h2> Lista de Pacientes</h2>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Buscar por cédula..."
          value={searchCedula}
          onChange={(e) => setSearchCedula(e.target.value)}
          style={{
            flex: 1,
            padding: '0.6rem 1rem',
            border: '1px solid #ccc',
            borderRadius: '0.5rem',
          }}
        />
        <button type="submit" disabled={loading} style={{ padding: '0.6rem 1rem' }}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
        {searchCedula && (
          <button type="button" onClick={resetSearch} style={{ padding: '0.6rem 1rem', background: '#ddd' }}>
            Reiniciar
          </button>
        )}
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading && <p>Cargando pacientes...</p>}

      {!loading && patients.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>Cédula</th>
              <th style={{ padding: '0.5rem' }}>Nombres</th>
              <th style={{ padding: '0.5rem' }}>Apellidos</th>
              <th style={{ padding: '0.5rem' }}>Teléfono</th>
              <th style={{ padding: '0.5rem' }}>Dirección</th>
              <th style={{ padding: '0.5rem' }}>Correo</th>
              <th style={{ padding: '0.5rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.patient_id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{p.doc_id}</td>
                <td style={{ padding: '0.5rem' }}>{p.names}</td>
                <td style={{ padding: '0.5rem' }}>{p.lastname}</td>
                <td style={{ padding: '0.5rem' }}>{p.telephone}</td>
                <td style={{ padding: '0.5rem' }}>{p.address}</td>
                <td style={{ padding: '0.5rem' }}>{p.email}</td>
                <td style={{ padding: '0.5rem' }}>
                  <button onClick={() => handleViewDetails(p.doc_id)}>Ver detalles</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && patients.length === 0 && !error && (
        <p style={{ color: '#555' }}>No hay pacientes registrados.</p>
      )}
    </div>
  )
}
