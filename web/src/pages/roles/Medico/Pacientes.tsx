import { useEffect, useMemo, useState } from 'react'
import { fetchAllPatients } from '@/services/patientService'
import { useNavigate } from 'react-router-dom'
import Skeleton from '@/components/skeleton'
import { Search, Users, Eye, ArrowUpDown } from 'lucide-react'

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

type SortKey = 'doc_id' | 'names' | 'lastname' | 'email'
type SortOrder = 'asc' | 'desc'

export default function Pacientes() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [sortKey, setSortKey] = useState<SortKey>('lastname')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const navigate = useNavigate()

  /* ================= CARGA INICIAL ================= */
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true)
        const data = await fetchAllPatients()
        setPatients(data)
      } catch (err: any) {
        setError(err.message || 'Error al cargar pacientes')
      } finally {
        setLoading(false)
      }
    }
    loadPatients()
  }, [])

  /* ================= FILTRO + ORDEN ================= */
  const filteredAndSorted = useMemo(() => {
    let result = [...patients]

    // 🔍 BÚSQUEDA GLOBAL
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((p) =>
        `${p.doc_id} ${p.names} ${p.lastname}`.toLowerCase().includes(q)
      )
    }

    // ↕️ ORDENAMIENTO
    result.sort((a, b) => {
      const aVal = (a[sortKey] || '').toString().toLowerCase()
      const bVal = (b[sortKey] || '').toString().toLowerCase()

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [patients, search, sortKey, sortOrder])

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const sortIcon = (key: SortKey) => {
    if (key !== sortKey) return <ArrowUpDown size={14} className="ms-1 opacity-50" />
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  const handleViewDetails = (doc_id: string) => {
    navigate(`/medico/pacientes/${doc_id}`)
  }

  return (
    <div className="container-fluid px-4 py-4" style={{ maxWidth: 1400 }}>
      {/* ================= HEADER ================= */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <Users size={28} className="text-primary" />
            Mis Pacientes
          </h2>
          <p className="text-muted mb-0">
            Gestión y consulta de historias clínicas
          </p>
        </div>
        {!loading && (
          <div className="badge bg-light text-dark border px-3 py-2">
            <strong>{filteredAndSorted.length}</strong> {filteredAndSorted.length === 1 ? 'paciente' : 'pacientes'}
          </div>
        )}
      </div>

      {/* ================= BUSCADOR ================= */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-body">
          <div className="position-relative">
            <Search 
              size={20} 
              className="position-absolute text-muted" 
              style={{ left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
            />
            <input
              type="text"
              className="form-control form-control-lg ps-5"
              placeholder="Buscar por cédula, nombre o apellido..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ 
                border: '2px solid #e9ecef',
                borderRadius: '10px',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0d6efd'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
            {search && (
              <button
                className="btn btn-link position-absolute text-muted"
                style={{ right: 8, top: '50%', transform: 'translateY(-50%)' }}
                onClick={() => setSearch('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= ERROR ================= */}
      {error && (
        <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center gap-3">
          <div className="fs-3">⚠️</div>
          <div>
            <strong>Error al cargar pacientes</strong>
            <p className="mb-0 small">{error}</p>
          </div>
        </div>
      )}

      {/* ================= SKELETON ================= */}
      {loading && (
        <div className="card shadow-sm border-0">
          <div className="card-body">
            {[1, 2, 3, 4, 5, 6].map((_, i) => (
              <div key={i} className="d-flex gap-3 mb-3 align-items-center">
                <Skeleton height={20} width="12%" />
                <Skeleton height={20} width="20%" />
                <Skeleton height={20} width="20%" />
                <Skeleton height={20} width="25%" />
                <Skeleton height={36} width="120px" className="ms-auto" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TABLA ================= */}
      {!loading && filteredAndSorted.length > 0 && (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <tr>
                  <th
                    role="button"
                    onClick={() => handleSort('doc_id')}
                    className="py-3 user-select-none"
                    style={{ fontWeight: 600 }}
                  >
                    <div className="d-flex align-items-center">
                      Cédula {sortIcon('doc_id')}
                    </div>
                  </th>
                  <th
                    role="button"
                    onClick={() => handleSort('names')}
                    className="py-3 user-select-none"
                    style={{ fontWeight: 600 }}
                  >
                    <div className="d-flex align-items-center">
                      Nombres {sortIcon('names')}
                    </div>
                  </th>
                  <th
                    role="button"
                    onClick={() => handleSort('lastname')}
                    className="py-3 user-select-none"
                    style={{ fontWeight: 600 }}
                  >
                    <div className="d-flex align-items-center">
                      Apellidos {sortIcon('lastname')}
                    </div>
                  </th>
                  <th
                    role="button"
                    onClick={() => handleSort('email')}
                    className="py-3 user-select-none"
                    style={{ fontWeight: 600 }}
                  >
                    <div className="d-flex align-items-center">
                      Correo {sortIcon('email')}
                    </div>
                  </th>
                  <th className="text-center py-3" style={{ fontWeight: 600 }}>
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredAndSorted.map((p) => (
                  <tr 
                    key={p.patient_id}
                    style={{ 
                      transition: 'background-color 0.2s',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleViewDetails(p.doc_id)}
                  >
                    <td className="py-3">
                      <span className="badge bg-light text-dark border px-2 py-1" style={{ fontWeight: 500 }}>
                        {p.doc_id}
                      </span>
                    </td>
                    <td className="py-3" style={{ fontWeight: 500 }}>{p.names}</td>
                    <td className="py-3" style={{ fontWeight: 500 }}>{p.lastname}</td>
                    <td className="py-3 text-muted">{p.email || '—'}</td>
                    <td className="text-center py-3">
                      <button
                        className="btn btn-sm btn-primary d-inline-flex align-items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewDetails(p.doc_id)
                        }}
                        style={{ 
                          borderRadius: '8px',
                          padding: '6px 16px',
                          fontWeight: 500
                        }}
                      >
                        <Eye size={16} />
                        Ver historia
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER CON CONTADOR */}
          <div className="card-footer bg-light border-0 text-muted small py-3">
            Mostrando <strong>{filteredAndSorted.length}</strong> de <strong>{patients.length}</strong> pacientes
          </div>
        </div>
      )}

      {/* ================= VACÍO ================= */}
      {!loading && filteredAndSorted.length === 0 && !error && (
        <div className="text-center py-5">
          <div className="mb-4">
            <Users size={64} className="text-muted opacity-25" />
          </div>
          <h5 className="text-muted mb-2">
            {search ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
          </h5>
          <p className="text-muted small mb-0">
            {search ? 'Intente con otros criterios de búsqueda' : 'Los pacientes aparecerán aquí cuando sean registrados'}
          </p>
          {search && (
            <button 
              className="btn btn-outline-primary mt-3"
              onClick={() => setSearch('')}
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}
    </div>
  )
}