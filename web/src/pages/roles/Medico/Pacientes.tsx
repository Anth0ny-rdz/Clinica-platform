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
  const [loading, setLoading] = useState(true)
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
    <div
      className="pacientes-container"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        minHeight: '100vh',
        padding: 0,
        margin: 0,
      }}
    >
      <div style={{ padding: '2rem 1rem' }}>
        <div className="mx-auto" style={{ maxWidth: 1400 }}>
          
          {/* ================= HEADER MEJORADO ================= */}
          <div className="header-section mb-4">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div 
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    }}
                  >
                    <Users size={28} color="white" />
                  </div>
                  <div>
                    <h2 className="fw-bold mb-0" style={{ color: '#2c3e50', fontSize: '1.8rem' }}>
                      Mis Pacientes
                    </h2>
                    <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                      Gestión y consulta de historias clínicas
                    </p>
                  </div>
                </div>
              </div>
              
              {!loading && (
                <div 
                  className="counter-badge"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  }}
                >
                  {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'paciente' : 'pacientes'}
                </div>
              )}
            </div>
          </div>

          {/* ================= BUSCADOR MEJORADO ================= */}
          <div 
            className="search-card mb-4"
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              border: 'none',
            }}
          >
            <div className="position-relative">
              <Search 
                size={20} 
                className="position-absolute text-muted" 
                style={{ left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
              />
              <input
                type="text"
                className="form-control form-control-lg ps-5 search-input"
                placeholder="Buscar por cédula, nombre o apellido..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ 
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '14px 16px 14px 50px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                }}
              />
              {search && (
                <button
                  className="btn btn-link position-absolute text-muted clear-btn"
                  style={{ 
                    right: 12, 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                  onClick={() => setSearch('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* ================= ERROR MEJORADO ================= */}
          {error && (
            <div 
              className="alert alert-danger border-0 shadow-sm mb-4"
              style={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                color: '#991b1b',
                padding: '1.25rem',
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div style={{ fontSize: '2rem' }}>⚠️</div>
                <div>
                  <strong style={{ fontSize: '1rem' }}>Error al cargar pacientes</strong>
                  <p className="mb-0 small mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* ================= SKELETON MEJORADO ================= */}
          {loading && (
            <div 
              className="card shadow-sm border-0"
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              <div className="card-body p-4">
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

          {/* ================= TABLA MEJORADA ================= */}
          {!loading && filteredAndSorted.length > 0 && (
            <div 
              className="table-card"
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                border: 'none',
              }}
            >
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 patients-table">
                  <thead style={{ 
                    background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)',
                    borderBottom: '2px solid #e5e7eb' 
                  }}>
                    <tr>
                      <th
                        role="button"
                        onClick={() => handleSort('doc_id')}
                        className="py-3 user-select-none"
                        style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}
                      >
                        <div className="d-flex align-items-center">
                          🆔 Cédula {sortIcon('doc_id')}
                        </div>
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort('names')}
                        className="py-3 user-select-none"
                        style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}
                      >
                        <div className="d-flex align-items-center">
                          👤 Nombres {sortIcon('names')}
                        </div>
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort('lastname')}
                        className="py-3 user-select-none"
                        style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}
                      >
                        <div className="d-flex align-items-center">
                          👥 Apellidos {sortIcon('lastname')}
                        </div>
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort('email')}
                        className="py-3 user-select-none"
                        style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}
                      >
                        <div className="d-flex align-items-center">
                          📧 Correo {sortIcon('email')}
                        </div>
                      </th>
                      <th className="text-center py-3" style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>
                        ⚡ Acción
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAndSorted.map((p, index) => (
                      <tr 
                        key={p.patient_id}
                        className="patient-row"
                        style={{ 
                          animation: `fadeInRow 0.4s ease-out ${index * 0.05}s backwards`,
                          cursor: 'pointer',
                        }}
                        onClick={() => handleViewDetails(p.doc_id)}
                      >
                        <td className="py-3" style={{ padding: '1rem' }}>
                          <span 
                            className="badge"
                            style={{
                              background: 'linear-gradient(135deg, #f0f2f5 0%, #e5e7eb 100%)',
                              color: '#374151',
                              padding: '6px 12px',
                              fontWeight: 600,
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                            }}
                          >
                            {p.doc_id}
                          </span>
                        </td>
                        <td className="py-3" style={{ fontWeight: 600, color: '#1f2937', padding: '1rem' }}>
                          {p.names}
                        </td>
                        <td className="py-3" style={{ fontWeight: 600, color: '#1f2937', padding: '1rem' }}>
                          {p.lastname}
                        </td>
                        <td className="py-3 text-muted" style={{ padding: '1rem' }}>
                          {p.email || '—'}
                        </td>
                        <td className="text-center py-3" style={{ padding: '1rem' }}>
                          <button
                            className="btn btn-sm view-btn d-inline-flex align-items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewDetails(p.doc_id)
                            }}
                            style={{ 
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              border: 'none',
                              color: 'white',
                              borderRadius: '10px',
                              padding: '8px 16px',
                              fontWeight: 600,
                              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                              transition: 'all 0.3s ease',
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

              {/* FOOTER MEJORADO */}
              <div 
                className="card-footer border-0 py-3"
                style={{
                  background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)',
                  color: '#6b7280',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  padding: '1rem 1.5rem',
                }}
              >
                Mostrando <strong style={{ color: '#374151' }}>{filteredAndSorted.length}</strong> de{' '}
                <strong style={{ color: '#374151' }}>{patients.length}</strong> pacientes
              </div>
            </div>
          )}

          {/* ================= VACÍO MEJORADO ================= */}
          {!loading && filteredAndSorted.length === 0 && !error && (
            <div className="text-center py-5 empty-state">
              <div className="mb-4" style={{ fontSize: '5rem', opacity: 0.3 }}>
                {search ? '🔍' : '👥'}
              </div>
              <h5 className="mb-3" style={{ color: '#6b7280', fontWeight: 600 }}>
                {search ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
              </h5>
              <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>
                {search ? 'Intente con otros criterios de búsqueda' : 'Los pacientes aparecerán aquí cuando sean registrados'}
              </p>
              {search && (
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => setSearch('')}
                  style={{
                    borderRadius: '10px',
                    padding: '10px 24px',
                    fontWeight: 600,
                    borderWidth: '2px',
                  }}
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ESTILOS */}
      <style>
        {`
          /* === ANIMACIONES === */
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes fadeInRow {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* === CONTAINER === */
          .pacientes-container {
            animation: fadeIn 0.6s ease-out;
          }

          /* === HEADER === */
          .header-section {
            animation: slideInUp 0.6s ease-out 0.2s backwards;
          }

          .counter-badge {
            animation: fadeIn 0.6s ease-out 0.3s backwards;
          }

          /* === SEARCH === */
          .search-card {
            animation: slideInUp 0.6s ease-out 0.4s backwards;
          }

          .search-input:focus {
            border-color: #667eea !important;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1) !important;
            transform: translateY(-1px);
          }

          .clear-btn:hover {
            color: #ef4444 !important;
          }

          /* === TABLE === */
          .table-card {
            animation: slideInUp 0.6s ease-out 0.5s backwards;
          }

          .patients-table th {
            transition: all 0.2s ease;
          }

          .patients-table th:hover {
            background: rgba(102, 126, 234, 0.05);
            color: #667eea !important;
          }

          .patient-row {
            transition: all 0.3s ease;
            border-bottom: 1px solid #f3f4f6;
          }

          .patient-row:hover {
            background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
            transform: scale(1.01);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
          }

          .view-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
          }

          .view-btn:active {
            transform: translateY(-1px);
          }

          /* === EMPTY STATE === */
          .empty-state {
            animation: fadeIn 0.6s ease-out 0.5s backwards;
          }

          /* === RESPONSIVE === */
          @media (max-width: 768px) {
            .header-section h2 {
              font-size: 1.4rem !important;
            }

            .counter-badge {
              padding: 8px 16px !important;
              font-size: 0.9rem !important;
            }

            .patients-table {
              font-size: 0.85rem;
            }

            .patients-table th,
            .patients-table td {
              padding: 0.75rem !important;
            }
          }

          /* === ACCESIBILIDAD === */
          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>
    </div>
  )
}