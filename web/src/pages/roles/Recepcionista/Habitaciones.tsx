import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { fetchAllRooms, updateRoomState } from "@/services/roomService"
import { Table, Button, Badge, Card, Alert, Form } from "react-bootstrap"

type Room = {
  room_id: number
  tipo: string
  number: string
  state: string
  present_state: string
  tipo_text: string
}

export default function Habitaciones() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterState, setFilterState] = useState<string>("all")

  useEffect(() => {
    window.scrollTo(0, 0)
    loadRooms()
  }, [])

  async function loadRooms() {
    setLoading(true)
    try {
      const data = await fetchAllRooms()
      setRooms(data)
    } catch (err) {
      console.error("❌ Error al cargar habitaciones:", err)
      setMessage("❌ Error al cargar las habitaciones")
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(room: Room, newState: string, newPresent: string) {
    setUpdating(room.room_id)
    try {
      await updateRoomState(room.room_id, { state: newState, present_state: newPresent })
      setMessage(`✅ Habitación ${room.number} actualizada a: ${newState}`)
      setTimeout(() => setMessage(null), 5000)
      await loadRooms()
    } catch (err) {
      console.error("❌ Error al actualizar estado:", err)
      setMessage("❌ Error al actualizar el estado de la habitación")
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setUpdating(null)
    }
  }

  const getBadgeColor = (state: string) => {
    switch (state) {
      case "Disponible": return "success"
      case "Ocupada": return "danger"
      case "Limpieza": return "warning"
      case "Mantenimiento": return "secondary"
      default: return "info"
    }
  }

  // Filtrado de habitaciones
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = 
      room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.tipo_text.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterState === "all" || room.state === filterState

    return matchesSearch && matchesFilter
  })

  // Estadísticas
  const stats = {
    total: rooms.length,
    disponibles: rooms.filter(r => r.state === "Disponible").length,
    ocupadas: rooms.filter(r => r.state === "Ocupada").length,
    limpieza: rooms.filter(r => r.state === "Limpieza").length,
    mantenimiento: rooms.filter(r => r.state === "Mantenimiento").length,
  }

  /* =============================
     RENDER - LOADING STATE
  ============================= */
  if (loading) {
    return (
      <div
        className="habitaciones-container"
        style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
          minHeight: '100vh',
          padding: 0,
          margin: 0,
        }}
      >
        <div style={{ padding: '2rem 1rem' }}>
          <div className="mx-auto content-wrapper" style={{ maxWidth: 1200 }}>
            <div className="skeleton" style={{ height: '60px', width: '200px', marginBottom: '2rem', borderRadius: '12px' }}></div>
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="skeleton" style={{ height: '100px', borderRadius: '20px' }}></div>
              </div>
              <div className="col-md-3">
                <div className="skeleton" style={{ height: '100px', borderRadius: '20px' }}></div>
              </div>
              <div className="col-md-3">
                <div className="skeleton" style={{ height: '100px', borderRadius: '20px' }}></div>
              </div>
              <div className="col-md-3">
                <div className="skeleton" style={{ height: '100px', borderRadius: '20px' }}></div>
              </div>
            </div>
            <div className="skeleton" style={{ height: '400px', borderRadius: '20px' }}></div>
          </div>
        </div>
      </div>
    )
  }

  /* =============================
     RENDER PRINCIPAL
  ============================= */
  return (
    <div
      className="habitaciones-container"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        minHeight: '100vh',
        padding: 0,
        margin: 0,
      }}
    >
      <div style={{ padding: '2rem 1rem' }}>
        <div className="mx-auto content-wrapper" style={{ maxWidth: 1200 }}>
          
          {/* BOTÓN VOLVER */}
          <Button
            variant="link"
            className="back-button mb-4 px-0"
            onClick={() => navigate(-1)}
            style={{
              textDecoration: "none",
              fontWeight: 600,
              color: '#667eea',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>←</span>
            Volver
          </Button>

          {/* HEADER */}
          <div className="header-section mb-4 pb-3" style={{ borderBottom: '2px solid #e5e7eb' }}>
            <div className="d-flex align-items-center gap-3">
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
                🏨
              </div>
              <div>
                <h3 className="fw-bold mb-0" style={{ color: "#2c3e50", fontSize: '1.8rem' }}>
                  Gestión de Habitaciones
                </h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                  Administre el estado y disponibilidad de las habitaciones
                </p>
              </div>
            </div>
          </div>

          {/* MENSAJE */}
          {message && (
            <Alert 
              variant={message.startsWith("✅") ? "success" : "danger"}
              style={{
                borderRadius: '12px',
                border: 'none',
                background: message.startsWith("✅") 
                  ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                  : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                color: message.startsWith("✅") ? '#065f46' : '#991b1b',
                fontWeight: 500,
                padding: '1rem 1.25rem',
                animation: 'slideInUp 0.4s ease-out',
                marginBottom: '1.5rem',
              }}
              dismissible
              onClose={() => setMessage(null)}
            >
              {message}
            </Alert>
          )}

          {/* ESTADÍSTICAS */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <Card
                className="stat-card-small"
                style={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  animation: 'slideInUp 0.4s ease-out 0.1s backwards',
                  transition: 'all 0.3s ease',
                }}
              >
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-1" style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
                        Total
                      </p>
                      <h4 className="mb-0 fw-bold" style={{ color: '#667eea' }}>
                        {stats.total}
                      </h4>
                    </div>
                    <div
                      style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.3rem',
                      }}
                    >
                      🏨
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>

            <div className="col-md-3">
              <Card
                className="stat-card-small"
                style={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  animation: 'slideInUp 0.4s ease-out 0.2s backwards',
                  transition: 'all 0.3s ease',
                }}
              >
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-1" style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
                        Disponibles
                      </p>
                      <h4 className="mb-0 fw-bold" style={{ color: '#10b981' }}>
                        {stats.disponibles}
                      </h4>
                    </div>
                    <div
                      style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.3rem',
                      }}
                    >
                      ✅
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>

            <div className="col-md-3">
              <Card
                className="stat-card-small"
                style={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  animation: 'slideInUp 0.4s ease-out 0.3s backwards',
                  transition: 'all 0.3s ease',
                }}
              >
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-1" style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
                        Ocupadas
                      </p>
                      <h4 className="mb-0 fw-bold" style={{ color: '#ef4444' }}>
                        {stats.ocupadas}
                      </h4>
                    </div>
                    <div
                      style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.3rem',
                      }}
                    >
                      🚫
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>

            <div className="col-md-3">
              <Card
                className="stat-card-small"
                style={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  animation: 'slideInUp 0.4s ease-out 0.4s backwards',
                  transition: 'all 0.3s ease',
                }}
              >
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-1" style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
                        En Limpieza
                      </p>
                      <h4 className="mb-0 fw-bold" style={{ color: '#f59e0b' }}>
                        {stats.limpieza}
                      </h4>
                    </div>
                    <div
                      style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.3rem',
                      }}
                    >
                      🧹
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>

          {/* CARD PRINCIPAL - TABLA */}
          <Card
            className="main-card"
            style={{
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              animation: 'slideInUp 0.6s ease-out 0.5s backwards',
            }}
          >
            <Card.Body className="p-4">
              
              {/* FILTROS */}
              <div className="row g-3 mb-4">
                <div className="col-md-8">
                  <Form.Group>
                    <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                      🔍 Buscar Habitación
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Buscar por número, tipo o descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        borderRadius: '10px',
                        border: '2px solid #e5e7eb',
                        padding: '12px 16px',
                        fontSize: '0.95rem',
                      }}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                      🎯 Filtrar por Estado
                    </Form.Label>
                    <Form.Select
                      value={filterState}
                      onChange={(e) => setFilterState(e.target.value)}
                      style={{
                        borderRadius: '10px',
                        border: '2px solid #e5e7eb',
                        padding: '12px 16px',
                      }}
                    >
                      <option value="all">Todos los estados</option>
                      <option value="Disponible">✅ Disponible</option>
                      <option value="Ocupada">🚫 Ocupada</option>
                      <option value="Limpieza">🧹 Limpieza</option>
                      <option value="Mantenimiento">🔧 Mantenimiento</option>
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>

              {/* TABLA */}
              {filteredRooms.length === 0 ? (
                <div className="text-center py-5">
                  <div style={{ fontSize: '5rem', marginBottom: '1.5rem', opacity: 0.3 }}>🏨</div>
                  <h5 className="mb-3" style={{ color: '#6b7280', fontWeight: 600 }}>
                    No se encontraron habitaciones
                  </h5>
                  <p className="text-muted" style={{ fontSize: '0.95rem' }}>
                    Intente ajustar los filtros de búsqueda
                  </p>
                </div>
              ) : (
                <div 
                  className="table-wrapper"
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '2px solid #e5e7eb',
                  }}
                >
                  <Table hover responsive className="mb-0 habitaciones-table">
                    <thead style={{ background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)' }}>
                      <tr>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>🆔 ID</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>🏷️ Tipo</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>🔢 Número</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>📊 Estado</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>📝 Subestado</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem' }}>📄 Descripción</th>
                        <th style={{ fontWeight: 700, color: '#374151', padding: '1rem', textAlign: 'center' }}>⚙️ Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRooms.map((room, index) => (
                        <tr 
                          key={room.room_id}
                          className="table-row"
                          style={{
                            animation: `fadeInRow 0.4s ease-out ${index * 0.05}s backwards`,
                          }}
                        >
                          <td style={{ padding: '1rem', color: '#6b7280', fontWeight: 500 }}>
                            {room.room_id}
                          </td>
                          <td style={{ padding: '1rem', color: '#1f2937', fontWeight: 600 }}>
                            {room.tipo}
                          </td>
                          <td style={{ padding: '1rem', color: '#1f2937', fontWeight: 600, fontSize: '1.1rem' }}>
                            {room.number}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <Badge 
                              bg={getBadgeColor(room.state)}
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                padding: '6px 12px',
                                borderRadius: '8px',
                              }}
                            >
                              {room.state === "Disponible" ? "✅" : 
                               room.state === "Ocupada" ? "🚫" : 
                               room.state === "Limpieza" ? "🧹" : "🔧"} {room.state}
                            </Badge>
                          </td>
                          <td style={{ padding: '1rem', color: '#6b7280' }}>
                            {room.present_state}
                          </td>
                          <td style={{ padding: '1rem', color: '#6b7280' }}>
                            {room.tipo_text}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div className="d-flex gap-2 justify-content-center flex-wrap">
                              {updating === room.room_id ? (
                                <div 
                                  className="spinner-border spinner-border-sm" 
                                  role="status"
                                  style={{ color: '#667eea' }}
                                >
                                  <span className="visually-hidden">Actualizando...</span>
                                </div>
                              ) : (
                                <>
                                  {room.state !== "Disponible" && (
                                    <Button
                                      size="sm"
                                      className="action-btn-sm"
                                      onClick={() => handleUpdate(room, "Disponible", "Libre")}
                                      style={{
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                                        transition: 'all 0.3s ease',
                                      }}
                                    >
                                      ✅ Libre
                                    </Button>
                                  )}
                                  {room.state !== "Limpieza" && (
                                    <Button
                                      size="sm"
                                      className="action-btn-sm"
                                      onClick={() => handleUpdate(room, "Limpieza", "Limpieza")}
                                      style={{
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                                        transition: 'all 0.3s ease',
                                      }}
                                    >
                                      🧹 Limpieza
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {/* CONTADOR */}
              {filteredRooms.length > 0 && (
                <div className="mt-3 text-end">
                  <small style={{ color: '#6b7280', fontWeight: 500 }}>
                    Mostrando {filteredRooms.length} de {rooms.length} habitaciones
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>

        </div>
      </div>

      {/* ESTILOS */}
      <style>{`
        /* === ANIMACIONES === */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* === SKELETON === */
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s ease-in-out infinite;
        }

        /* === BOTÓN VOLVER === */
        .back-button:hover {
          color: #764ba2 !important;
          transform: translateX(-5px);
        }

        /* === STAT CARDS === */
        .stat-card-small:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
        }

        /* === TABLA HOVER === */
        .habitaciones-table tbody tr {
          transition: all 0.3s ease;
          border-bottom: 1px solid #f3f4f6;
        }

        .habitaciones-table tbody tr:hover {
          background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
          transform: scale(1.01);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }

        /* === BOTONES ACCIÓN === */
        .action-btn-sm:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }

        .action-btn-sm:active:not(:disabled) {
          transform: translateY(-1px);
        }

        /* === RESPONSIVE === */
        @media (max-width: 768px) {
          .header-section h3 {
            font-size: 1.4rem !important;
          }

          .content-wrapper {
            max-width: 100% !important;
          }

          .stat-card-small h4 {
            font-size: 1.5rem !important;
          }

          .action-btn-sm {
            font-size: 0.7rem !important;
            padding: 4px 8px !important;
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
      `}</style>
    </div>
  )
}