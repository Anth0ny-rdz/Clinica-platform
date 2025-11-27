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
  <div className="container mt-4" style={{ maxWidth: "1000px" }}>
    
    <h2 className="fw-bold text-center mb-4">Lista de Pacientes</h2>

    {/* FORMULARIO DE BÚSQUEDA */}
    <form onSubmit={handleSearch} className="row g-2 mb-3">
      <div className="col-md-6">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por cédula..."
          value={searchCedula}
          onChange={(e) => setSearchCedula(e.target.value)}
        />
      </div>

      <div className="col-md-3 d-grid">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {searchCedula && (
        <div className="col-md-3 d-grid">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={resetSearch}
          >
            Reiniciar
          </button>
        </div>
      )}
    </form>

    {/* ALERTA DE ERROR */}
    {error && <div className="alert alert-danger">{error}</div>}

    {/* LOADING */}
    {loading && <p className="text-center">Cargando pacientes...</p>}

    {/* TABLA DE PACIENTES */}
    {!loading && patients.length > 0 && (
      <div className="table-responsive shadow-sm">
        <table className="table table-hover align-middle">
          <thead className="table-primary">
            <tr>
              <th>Cédula</th>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Correo</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {patients.map((p) => (
              <tr key={p.patient_id}>
                <td>{p.doc_id}</td>
                <td>{p.names}</td>
                <td>{p.lastname}</td>
                <td>{p.telephone}</td>
                <td>{p.address}</td>
                <td>{p.email}</td>
                <td className="text-center">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleViewDetails(p.doc_id)}
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {/* SIN RESULTADOS */}
    {!loading && patients.length === 0 && !error && (
      <p className="text-center text-muted mt-3">
        No hay pacientes registrados.
      </p>
    )}
  </div>
)
}
