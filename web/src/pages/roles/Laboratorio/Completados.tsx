import { useEffect, useState } from "react";
import { Card, Table, Form, Button, Alert, Spinner, Badge } from "react-bootstrap";
import { fetchCompletedExams, getSignedResultUrl } from "@/services/labService";
import { useNavigate } from "react-router-dom";

export default function Completados() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // ← Cambiado a true para carga inicial
  const [searching, setSearching] = useState(false); // ← Nuevo estado para búsqueda
  
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    date: "",
    examtype: "",
    patient: "",
    doctor: "",
  });

  const [message, setMessage] = useState<string | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true); // ← Para detectar primera carga

  // Carga inicial
  useEffect(() => {
    loadInitial();
  }, []);

  // Filtrado con debounce
  useEffect(() => {
    if (isFirstLoad) return; // No ejecutar en primera carga
    
    const timer = setTimeout(() => load(), 300);
    return () => clearTimeout(timer);
  }, [filters]);

  async function loadInitial() {
    try {
      setLoading(true);
      const data = await fetchCompletedExams({});
      setItems(data);
      setIsFirstLoad(false);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function load() {
    try {
      setSearching(true);
      setMessage(null);

      const cleanFilters: any = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v) cleanFilters[k] = v;
      });

      const data = await fetchCompletedExams(cleanFilters);
      setItems(data);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSearching(false);
    }
  }

  function clearFilters() {
    setFilters({
      date: "",
      examtype: "",
      patient: "",
      doctor: "",
    });
  }

  // Skeleton Component
  const SkeletonRow = () => (
    <tr>
      <td style={{ padding: '1rem' }}>
        <div className="skeleton" style={{ height: '20px', width: '70%', marginBottom: '8px' }}></div>
        <div className="skeleton" style={{ height: '16px', width: '50%' }}></div>
      </td>
      <td style={{ padding: '1rem' }}>
        <div className="skeleton" style={{ height: '20px', width: '80%' }}></div>
      </td>
      <td style={{ padding: '1rem' }}>
        <div className="skeleton" style={{ height: '20px', width: '60%' }}></div>
      </td>
      <td style={{ padding: '1rem' }}>
        <div className="skeleton" style={{ height: '20px', width: '50%' }}></div>
      </td>
      <td className="text-center" style={{ padding: '1rem' }}>
        <div className="skeleton" style={{ height: '32px', width: '120px', margin: '0 auto' }}></div>
      </td>
    </tr>
  );

  return (
    <div
      className="completados-container"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        minHeight: "100vh",
        padding: 0,
        margin: 0,
      }}
    >
      {/* Wrapper interno con padding */}
      <div style={{ padding: '2rem 1rem' }}>
        <div className="mx-auto content-wrapper" style={{ maxWidth: 1100 }}>
          <Card
            className="main-card"
            style={{
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            <Card.Body className="p-4">

              {/* ================= HEADER MEJORADO ================= */}
              <div className="header-section mb-4">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div 
                    className="icon-badge"
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    📁
                  </div>
                  <div>
                    <h3 className="fw-bold mb-1 title-text" style={{ color: "#2c3e50", fontSize: '1.6rem' }}>
                      Exámenes Completados
                    </h3>
                    <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                      Resultados de exámenes procesados por el laboratorio clínico
                    </p>
                  </div>
                </div>
                
                {/* Contador de resultados */}
                {!loading && (
                  <div className="mt-3">
                    <Badge 
                      bg="success" 
                      className="counter-badge"
                      style={{
                        fontSize: '0.9rem',
                        padding: '8px 16px',
                        fontWeight: 600,
                        borderRadius: '8px',
                      }}
                    >
                      {items.length} {items.length === 1 ? 'examen completado' : 'exámenes completados'}
                    </Badge>
                  </div>
                )}
              </div>

              {/* ================= FILTROS MEJORADOS ================= */}
              <div
                className="filters-section mb-4"
                style={{
                  background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '2px solid #e3e6eb',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)',
                }}
              >
                {loading ? (
                  // Skeleton para filtros
                  <div className="row g-3">
                    <div className="col-md-3">
                      <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '8px' }}></div>
                      <div className="skeleton" style={{ height: '38px', width: '100%' }}></div>
                    </div>
                    <div className="col-md-3">
                      <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '8px' }}></div>
                      <div className="skeleton" style={{ height: '38px', width: '100%' }}></div>
                    </div>
                    <div className="col-md-3">
                      <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '8px' }}></div>
                      <div className="skeleton" style={{ height: '38px', width: '100%' }}></div>
                    </div>
                    <div className="col-md-3">
                      <div className="skeleton" style={{ height: '38px', width: '100%', marginTop: '28px' }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="row g-3 align-items-end">
                    {/* TIPO EXAMEN */}
                    <div className="col-md-3">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#374151', fontSize: '0.9rem' }}>
                        🔬 Tipo de examen
                      </Form.Label>
                      <Form.Control
                        className="filter-input"
                        placeholder="Ej: Hemograma"
                        value={filters.examtype}
                        onChange={(e) =>
                          setFilters({ ...filters, examtype: e.target.value })
                        }
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                          transition: 'all 0.3s ease',
                        }}
                      />
                    </div>

                    {/* PACIENTE */}
                    <div className="col-md-3">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#374151', fontSize: '0.9rem' }}>
                        👤 Paciente
                      </Form.Label>
                      <Form.Control
                        className="filter-input"
                        placeholder="Nombre del paciente"
                        value={filters.patient}
                        onChange={(e) =>
                          setFilters({ ...filters, patient: e.target.value })
                        }
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                          transition: 'all 0.3s ease',
                        }}
                      />
                    </div>

                    {/* MÉDICO */}
                    <div className="col-md-3">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#374151', fontSize: '0.9rem' }}>
                        ⚕️ Médico
                      </Form.Label>
                      <Form.Control
                        className="filter-input"
                        placeholder="Nombre del médico"
                        value={filters.doctor}
                        onChange={(e) =>
                          setFilters({ ...filters, doctor: e.target.value })
                        }
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          padding: '10px 14px',
                          transition: 'all 0.3s ease',
                        }}
                      />
                    </div>

                    {/* LIMPIAR */}
                    <div className="col-md-3 d-grid">
                      <Button
                        className="clear-btn"
                        variant="outline-secondary"
                        onClick={clearFilters}
                        style={{
                          borderRadius: '10px',
                          padding: '10px',
                          fontWeight: 600,
                          border: '2px solid #e5e7eb',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        ↺ Limpiar filtros
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* ================= ERROR MEJORADO ================= */}
              {message && (
                <Alert 
                  variant="danger" 
                  className="error-alert"
                  style={{
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                    color: '#991b1b',
                    padding: '1rem 1.25rem',
                    fontWeight: 500,
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)',
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: '1.2rem' }}>❌</span>
                    <span>{message}</span>
                  </div>
                </Alert>
              )}

              {/* ================= BUSCANDO (solo para filtros) ================= */}
              {searching && (
                <div 
                  className="searching-indicator"
                  style={{
                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    border: '2px solid #93c5fd',
                  }}
                >
                  <Spinner animation="border" size="sm" style={{ color: '#1e40af' }} />
                  <span style={{ color: '#1e40af', fontWeight: 500 }}>
                    Buscando resultados…
                  </span>
                </div>
              )}

              {/* ================= TABLA CON SKELETON ================= */}
              <div
                className="table-wrapper"
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '2px solid #e6e9ee',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                }}
              >
                <Table hover responsive className="mb-0 custom-table">
                  <thead 
                    style={{ 
                      background: 'linear-gradient(135deg, #f4f6f9 0%, #e8ecf1 100%)',
                    }}
                  >
                    <tr>
                      <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>👤 Paciente</th>
                      <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>⚕️ Médico</th>
                      <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>🔬 Examen</th>
                      <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>📅 Fecha</th>
                      <th className="text-center" style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>📄 Resultado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      // Skeleton loading rows
                      <>
                        <SkeletonRow />
                        <SkeletonRow />
                        <SkeletonRow />
                        <SkeletonRow />
                        <SkeletonRow />
                      </>
                    ) : items.length > 0 ? (
                      items.map((i, index) => {
                        const p = i.exam_orders?.patients;
                        const d = i.exam_orders?.doctors;
                        const result =
                          Array.isArray(i.exam_results) &&
                          i.exam_results.length > 0
                            ? i.exam_results[0]
                            : null;

                        return (
                          <tr 
                            key={i.item_id}
                            className="table-row-animated"
                            style={{
                              animation: `fadeInRow 0.4s ease-out ${index * 0.05}s backwards`,
                            }}
                          >
                            {/* PACIENTE */}
                            <td style={{ padding: '1rem' }}>
                              {p ? (
                                <div>
                                  <strong style={{ color: '#1f2937', fontSize: '0.95rem' }}>
                                    {p.names} {p.lastname}
                                  </strong>
                                </div>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>

                            {/* MÉDICO */}
                            <td style={{ padding: '1rem', color: '#374151' }}>
                              {d ? (
                                <span>
                                  Dr. {d.nombres} {d.apellidos}
                                </span>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>

                            {/* EXAMEN */}
                            <td style={{ padding: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 500, color: '#374151' }}>
                                  {i.exam_type?.name ?? "—"}
                                </span>
                                <Badge 
                                  bg="success" 
                                  className="status-badge"
                                  style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                  }}
                                >
                                  ✓ Completo
                                </Badge>
                              </div>
                            </td>

                            {/* FECHA */}
                            <td style={{ padding: '1rem', color: '#6b7280' }}>
                              {result?.uploaded_at
                                ? new Date(
                                    result.uploaded_at
                                  ).toLocaleDateString("es-EC", {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })
                                : "—"}
                            </td>

                            {/* RESULTADO */}
                            <td className="text-center" style={{ padding: '1rem' }}>
                              {result?.file_url ? (
                                <Button
                                  size="sm"
                                  className="result-btn"
                                  onClick={() =>
                                    navigate(
                                      `/laboratorio/item/${i.item_id}`
                                    )
                                  }
                                  style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                    transition: 'all 0.3s ease',
                                  }}
                                >
                                  📄 Ver resultado
                                </Button>
                              ) : (
                                <Badge 
                                  bg="secondary"
                                  style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                  }}
                                >
                                  Sin archivo
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-5"
                        >
                          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>
                            🔍
                          </div>
                          <p style={{ color: '#9ca3af', fontSize: '1.1rem', fontWeight: 500 }}>
                            No se encontraron exámenes con los filtros aplicados
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* ESTILOS */}
      <style>
        {`
          /* === SKELETON === */
          .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s ease-in-out infinite;
            border-radius: 8px;
          }

          @keyframes loading {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }

          /* === ANIMACIONES === */
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

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }

          /* === COMPONENTES === */
          .completados-container {
            animation: fadeIn 0.6s ease-out;
          }

          .content-wrapper {
            animation: fadeIn 0.7s ease-out 0.1s backwards;
          }

          .main-card {
            animation: fadeIn 0.8s ease-out 0.2s backwards;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .main-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 48px rgba(0,0,0,0.12) !important;
          }

          .header-section {
            animation: fadeIn 0.6s ease-out 0.3s backwards;
          }

          .icon-badge {
            animation: pulse 3s ease-in-out infinite;
          }

          .title-text {
            animation: fadeIn 0.6s ease-out 0.4s backwards;
          }

          .counter-badge {
            animation: fadeIn 0.6s ease-out 0.5s backwards;
          }

          .filters-section {
            animation: fadeIn 0.6s ease-out 0.6s backwards;
          }

          .filter-input:focus {
            border-color: #10b981 !important;
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1) !important;
            transform: translateY(-1px);
          }

          .filter-input:hover:not(:focus) {
            border-color: #cbd5e1 !important;
          }

          .clear-btn:hover {
            background: #f3f4f6 !important;
            border-color: #9ca3af !important;
            transform: translateY(-2px);
          }

          .clear-btn:active {
            transform: translateY(0) !important;
          }

          .error-alert {
            animation: fadeIn 0.4s ease-out;
          }

          .searching-indicator {
            animation: fadeIn 0.3s ease-out;
          }

          .table-wrapper {
            animation: fadeIn 0.6s ease-out 0.7s backwards;
          }

          .custom-table tbody tr {
            transition: all 0.3s ease;
            border-bottom: 1px solid #f3f4f6;
          }

          .custom-table tbody tr:hover {
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            transform: scale(1.01);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
          }

          .status-badge {
            animation: fadeIn 0.5s ease-out;
          }

          .result-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4) !important;
          }

          .result-btn:active {
            transform: translateY(-1px);
          }

          /* === RESPONSIVE === */
          @media (max-width: 768px) {
            .icon-badge {
              width: 40px !important;
              height: 40px !important;
              font-size: 1.2rem !important;
            }

            .title-text {
              font-size: 1.3rem !important;
            }

            .filters-section {
              padding: 1rem !important;
            }

            .custom-table {
              font-size: 0.85rem;
            }

            .custom-table th,
            .custom-table td {
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
  );
}