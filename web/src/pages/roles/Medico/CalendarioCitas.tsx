import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { fetchAppointmentsCalendarByDoctor, updateAppointmentStatus } from '@/services/appointmentService'
import { fetchDoctorByAuth } from '@/services/doctorService'
import type { EventInput } from '@fullcalendar/core'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Alert, Badge } from 'react-bootstrap'
import { useAuth } from '@/context/AuthContext'

export default function CalendarioCitas() {
  const { user } = useAuth()
  const [events, setEvents] = useState<EventInput[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [panelVisible, setPanelVisible] = useState(false)
  const [loadingDoctor, setLoadingDoctor] = useState(true)
  const navigate = useNavigate()

  const [doctorProfileId, setDoctorProfileId] = useState<number | null>(null)

  // Loader de usuario
  if (!user || !user.auth_id) {
    return (
      <div
        style={{
          position: 'fixed',
          top: '77px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <div 
          className="spinner-border" 
          style={{ 
            width: '4rem', 
            height: '4rem',
            color: '#667eea',
            borderWidth: '4px',
          }}
        ></div>
        <p style={{ fontWeight: 600, fontSize: '1.1rem', color: '#6b7280' }}>
          Cargando usuario...
        </p>
      </div>
    )
  }

  // Cargar doctor
  useEffect(() => {
    const loadDoctor = async () => {
      try {
        if (!user?.auth_id) return

        const doctor = await fetchDoctorByAuth(user.auth_id)
        setDoctorProfileId(doctor.doctor_profile_id)

      } catch (err) {
        console.error("❌ Error cargando doctor", err)
        setMessage("❌ No se pudo cargar el perfil del médico.")
      } finally {
        setLoadingDoctor(false)
      }
    }

    loadDoctor()
  }, [user])

  // Cargar citas
  useEffect(() => {
    const loadEvents = async () => {
      if (!doctorProfileId) return

      try {
        const data = await fetchAppointmentsCalendarByDoctor(doctorProfileId)

        const formatted: EventInput[] = data.map((a: any) => ({
          id: String(a.id),
          title: a.title,
          start: a.start,
          end: new Date(new Date(a.start).getTime() + 30 * 60000).toISOString(),
          color:
            a.status === 'confirmada'
              ? '#10b981'
              : a.status === 'cancelada'
              ? '#ef4444'
              : a.status === 'atendida'
              ? '#3b82f6'
              : '#f59e0b',
          extendedProps: {
            reason: a.reason,
            status: a.status,
            doc_id: a.doc_id,
            patient_id: a.patient_id
          }
        }))

        setEvents(formatted)

      } catch (err: any) {
        console.error("❌ Error cargando citas:", err)
        setMessage('❌ Error cargando citas: ' + err.message)
      }
    }

    loadEvents()
  }, [doctorProfileId])

  // Selección de cita
  const handleEventClick = (info: any) => {
    const event = info.event

    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start,
      status: event.extendedProps.status,
      reason: event.extendedProps.reason,
      doc_id: event.extendedProps.doc_id,
      patient_id: event.extendedProps.patient_id,
      extendedProps: event.extendedProps
    })

    setPanelVisible(true)
  }

  const handleClosePanel = () => {
    setPanelVisible(false)
    setTimeout(() => setSelectedEvent(null), 250)
  }

  // Actualizar estado
  const handleStatusChange = async (status: string) => {
    if (!selectedEvent) return

    try {
      await updateAppointmentStatus(selectedEvent.id, status)

      setEvents((prev) =>
        prev.map((e) =>
          e.id === selectedEvent.id
            ? {
                ...e,
                color:
                  status === 'confirmada'
                    ? '#10b981'
                    : status === 'cancelada'
                    ? '#ef4444'
                    : status === 'atendida'
                    ? '#3b82f6'
                    : '#f59e0b',
                extendedProps: { ...e.extendedProps, status },
              }
            : e
        )
      )

      setSelectedEvent({ ...selectedEvent, status })
      setMessage(`✅ Cita ${status} correctamente`)

    } catch (err: any) {
      setMessage('❌ Error al actualizar cita: ' + err.message)
    }
  }

  // Loader del doctor
  if (loadingDoctor) {
    return (
      <div
        style={{
          position: 'fixed',
          top: '77px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <div 
          className="spinner-border" 
          style={{ 
            width: '4rem', 
            height: '4rem',
            color: '#10b981',
            borderWidth: '4px',
          }}
        ></div>
        <p style={{ fontWeight: 600, fontSize: '1.1rem', color: '#6b7280' }}>
          Cargando calendario del médico...
        </p>
      </div>
    )
  }

  // Vista principal
  return (
    <div
      className="calendario-container"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        minHeight: '100vh',
        padding: 0,
        margin: 0,
      }}
    >
      <div style={{ padding: '2rem 1rem' }}>
        <div 
          className="calendario-wrapper"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'start',
            gap: '1.5rem',
            maxWidth: '1800px',
            margin: '0 auto',
          }}
        >
          {/* CALENDARIO */}
          <div 
            className="calendar-section"
            style={{ 
              flex: panelVisible ? '1 1 65%' : '1 1 100%',
              transition: 'all 0.3s ease',
            }}
          >
            {/* HEADER */}
            <div className="calendar-header mb-4">
              <div className="d-flex align-items-center gap-3 mb-3">
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
                  📅
                </div>
                <div>
                  <h2 className="fw-bold mb-0" style={{ color: '#2c3e50', fontSize: '1.8rem' }}>
                    Agenda del Médico
                  </h2>
                  <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                    Gestiona tus citas y horarios
                  </p>
                </div>
              </div>

              {/* MENSAJE */}
              {message && (
                <Alert 
                  variant={message.startsWith('✅') ? 'success' : 'danger'}
                  className="mb-3"
                  style={{
                    borderRadius: '12px',
                    border: 'none',
                    background: message.startsWith('✅') 
                      ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                      : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                    color: message.startsWith('✅') ? '#065f46' : '#991b1b',
                    fontWeight: 500,
                    padding: '1rem 1.25rem',
                  }}
                >
                  {message}
                </Alert>
              )}

              {/* LEYENDA */}
              <div 
                className="legend-box"
                style={{
                  background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)',
                  padding: '1rem 1.5rem',
                  borderRadius: '12px',
                  border: '2px solid #e3e6eb',
                  display: 'flex',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                }}
              >
                <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem', color: '#f59e0b' }}>●</span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>Pendiente</span>
                </div>
                <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem', color: '#10b981' }}>●</span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>Confirmada</span>
                </div>
                <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem', color: '#ef4444' }}>●</span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>Cancelada</span>
                </div>
                <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem', color: '#3b82f6' }}>●</span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>Atendida</span>
                </div>
              </div>
            </div>

            {/* FULLCALENDAR */}
            <Card 
              className="calendar-card"
              style={{
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                overflow: 'hidden',
              }}
            >
              <Card.Body className="p-4">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  locales={[esLocale]}
                  locale="es"
                  slotDuration="00:30:00"
                  allDaySlot={false}
                  editable={false}
                  selectable={false}
                  events={events}
                  eventClick={handleEventClick}
                  height="70vh"
                  nowIndicator={true}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                  }}
                />
              </Card.Body>
            </Card>
          </div>

          {/* PANEL LATERAL */}
          <div
            className="detail-panel"
            style={{
              flex: panelVisible ? '0 0 380px' : '0 0 0',
              maxWidth: panelVisible ? '380px' : '0',
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Card
              style={{
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                height: '100%',
              }}
            >
              <Card.Body 
                className="p-4"
                style={{
                  opacity: panelVisible ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }}
              >
                {selectedEvent ? (
                  <>
                    {/* HEADER DEL PANEL */}
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3" style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '1.5rem' }}>📋</span>
                        <h4 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>Detalle de Cita</h4>
                      </div>
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        onClick={handleClosePanel}
                        style={{
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontWeight: 600,
                        }}
                      >
                        ✕
                      </Button>
                    </div>

                    {/* INFO DE LA CITA */}
                    <div className="appointment-info mb-4">
                      <div className="info-item mb-3">
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                          👤 Paciente
                        </div>
                        <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '1rem' }}>
                          {selectedEvent.title}
                        </div>
                      </div>

                      <div className="info-item mb-3">
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                          🕐 Fecha y hora
                        </div>
                        <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '1rem' }}>
                          {new Date(selectedEvent.start).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                          <br />
                          <span style={{ color: '#667eea' }}>
                            {new Date(selectedEvent.start).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="info-item mb-3">
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                          📝 Motivo
                        </div>
                        <div style={{ fontWeight: 500, color: '#374151', fontSize: '0.95rem', lineHeight: '1.5' }}>
                          {selectedEvent.reason || 'Sin motivo especificado'}
                        </div>
                      </div>

                      <div className="info-item mb-4">
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                          🏷️ Estado actual
                        </div>
                        <Badge 
                          bg={
                            selectedEvent.status === 'confirmada' ? 'success' :
                            selectedEvent.status === 'cancelada' ? 'danger' :
                            selectedEvent.status === 'atendida' ? 'primary' :
                            'warning'
                          }
                          style={{
                            fontSize: '0.9rem',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                          }}
                        >
                          {selectedEvent.status}
                        </Badge>
                      </div>
                    </div>

                    {/* ACCIONES */}
                    <div className="actions-section" style={{ borderTop: '2px solid #e5e7eb', paddingTop: '1.5rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>
                        ⚡ Acciones rápidas
                      </div>
                      
                      <div className="d-flex flex-column gap-2">
                        <Button 
                          className="action-btn"
                          variant="success" 
                          onClick={() => handleStatusChange('confirmada')}
                          style={{
                            borderRadius: '10px',
                            fontWeight: 600,
                            padding: '10px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          ✓ Confirmar Cita
                        </Button>

                        <Button 
                          className="action-btn"
                          variant="danger" 
                          onClick={() => handleStatusChange('cancelada')}
                          style={{
                            borderRadius: '10px',
                            fontWeight: 600,
                            padding: '10px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                          }}
                        >
                          ✕ Cancelar Cita
                        </Button>

                        <Button 
                          className="action-btn"
                          variant="info" 
                          onClick={() => handleStatusChange('atendida')}
                          style={{
                            borderRadius: '10px',
                            fontWeight: 600,
                            padding: '10px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                          }}
                        >
                          ✓ Marcar Atendida
                        </Button>

                        <Button
                          className="action-btn"
                          variant="primary"
                          onClick={() => navigate(`/medico/pacientes/${selectedEvent.doc_id}`)}
                          style={{
                            borderRadius: '10px',
                            fontWeight: 600,
                            padding: '10px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                          }}
                        >
                          👤 Ver Perfil del Paciente
                        </Button>
                      </div>
                    </div>

                  </>
                ) : (
                  <div className="text-center mt-5" style={{ padding: '3rem 1rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>📅</div>
                    <p style={{ color: '#9ca3af', fontWeight: 500, fontSize: '1rem' }}>
                      Selecciona una cita en el calendario<br />para ver los detalles
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
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
          .calendario-container {
            animation: fadeIn 0.6s ease-out;
          }

          .calendario-wrapper {
            animation: fadeIn 0.7s ease-out 0.1s backwards;
          }

          /* === CALENDAR === */
          .calendar-header {
            animation: slideInUp 0.6s ease-out 0.2s backwards;
          }

          .calendar-card {
            animation: slideInUp 0.6s ease-out 0.3s backwards;
            transition: all 0.3s ease;
          }

          .calendar-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 48px rgba(0,0,0,0.12) !important;
          }

          /* === LEGEND === */
          .legend-item {
            animation: fadeIn 0.5s ease-out backwards;
          }

          .legend-item:nth-child(1) { animation-delay: 0.4s; }
          .legend-item:nth-child(2) { animation-delay: 0.5s; }
          .legend-item:nth-child(3) { animation-delay: 0.6s; }
          .legend-item:nth-child(4) { animation-delay: 0.7s; }

          /* === PANEL === */
          .detail-panel {
            animation: fadeIn 0.6s ease-out 0.4s backwards;
          }

          /* === BOTONES === */
          .action-btn {
            transition: all 0.3s ease;
          }

          .action-btn:hover {
            transform: translateY(-3px);
            filter: brightness(1.1);
          }

          .action-btn:active {
            transform: translateY(-1px);
          }

          /* === FULLCALENDAR CUSTOM === */
          .fc {
            font-family: inherit;
          }

          .fc .fc-button {
            border-radius: 8px !important;
            font-weight: 600 !important;
            padding: 8px 16px !important;
          }

          .fc .fc-button-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            border: none !important;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
          }

          .fc .fc-button-primary:hover {
            filter: brightness(1.1) !important;
            transform: translateY(-2px);
          }

          .fc .fc-button-primary:disabled {
            opacity: 0.5 !important;
          }

          .fc-event {
            border-radius: 6px !important;
            border: none !important;
            padding: 4px 8px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
          }

          .fc-event:hover {
            transform: scale(1.05) !important;
            filter: brightness(1.1) !important;
          }

          /* === RESPONSIVE === */
          @media (max-width: 1200px) {
            .calendario-wrapper {
              flex-direction: column !important;
            }

            .calendar-section {
              flex: 1 1 100% !important;
            }

            .detail-panel {
              flex: 1 1 100% !important;
              max-width: 100% !important;
            }
          }

          @media (max-width: 768px) {
            .calendar-header h2 {
              font-size: 1.4rem !important;
            }

            .legend-box {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 0.75rem !important;
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