import { useEffect, useState } from 'react'
import { fetchAllPatients } from '@/services/patientService'
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
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [searchCedula, setSearchCedula] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // 🔹 Cargar todos los pacientes al montar (ORIGINAL)
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true)
        const data = await fetchAllPatients()
        setPatients(data)
        setFilteredPatients(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadPatients()
  }, [])

  // 🔍 BÚSQUEDA DINÁMICA POR CÉDULA (ORIGINAL)
  useEffect(() => {
    if (!searchCedula.trim()) {
      setFilteredPatients(patients)
      return
    }

    const result = patients.filter((p) =>
      p.doc_id.toLowerCase().includes(searchCedula.toLowerCase())
    )

    setFilteredPatients(result)
  }, [searchCedula, patients])

  const handleViewDetails = (doc_id: string) => {
    navigate(`/medico/pacientes/${doc_id}`)
  }

  const resetSearch = () => {
    setSearchCedula('')
    setFilteredPatients(patients)
  }

  return (
    <div className="container mt-4" style={{ maxWidth: "1100px" }}>

      {/* ================= HEADER ================= */}
      <div className="text-center mb-4">
        <h2 className="fw-bold mb-1">🧍 Lista de Pacientes</h2>
        <p className="text-muted">
          Seleccione un paciente para ver su información clínica
        </p>
      </div>

      {/* ================= BUSCADOR ================= */}
      <div className="card shadow-sm p-3 mb-3">
        <label className="form-label fw-semibold">
          🔎 Buscar por número de cédula
        </label>

        <div className="row g-2">
          <div className="col-md-9">
            <input
              type="text"
              className="form-control"
              placeholder="Ej: 1723... (parcial o completo)"
              value={searchCedula}
              onChange={(e) => setSearchCedula(e.target.value)}
            />
          </div>

          {searchCedula && (
            <div className="col-md-3 d-grid">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={resetSearch}
              >
                ↺ Limpiar búsqueda
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= ERROR ================= */}
      {error && (
        <div className="alert alert-danger">
          ❌ {error}
        </div>
      )}

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="text-center text-muted my-4">
          <div className="spinner-border spinner-border-sm me-2" />
          Cargando pacientes...
        </div>
      )}

      {/* ================= TABLA ================= */}
      {!loading && filteredPatients.length > 0 && (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-primary">
              <tr>
                <th>Cédula</th>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Correo</th>
                <th className="text-center">Acción</th>
              </tr>
            </thead>

            <tbody>
              {filteredPatients.map((p) => (
                <tr key={p.patient_id}>
                  <td className="fw-semibold">{p.doc_id}</td>
                  <td>{p.names}</td>
                  <td>{p.lastname}</td>
                  <td>{p.telephone || "—"}</td>
                  <td>{p.address || "—"}</td>
                  <td>{p.email || "—"}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleViewDetails(p.doc_id)}
                    >
                      👁️ Ver historia
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= SIN RESULTADOS ================= */}
      {!loading && filteredPatients.length === 0 && !error && (
        <div className="text-center text-muted mt-4">
          No se encontraron pacientes con esa cédula.
        </div>
      )}
    </div>
  )
}
