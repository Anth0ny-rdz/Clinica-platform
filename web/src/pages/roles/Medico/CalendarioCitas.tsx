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
import { Button, Card, Alert } from 'react-bootstrap'
import { useAuth } from '@/context/AuthContext'

export default function CalendarioCitas() {
  const { user } = useAuth()
  const [events, setEvents] = useState<EventInput[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [panelVisible, setPanelVisible] = useState(false)
  const [loadingDoctor, setLoadingDoctor] = useState(true)
  const navigate = useNavigate()

  // =====================================
  // 🩺 ID real del doctor
  // =====================================
  const [doctorProfileId, setDoctorProfileId] = useState<number | null>(null)

 useEffect(() => {
  const loadDoctor = async () => {
    try {
      if (!user?.auth_id) return

      const doctor = await fetchDoctorByAuth(user.auth_id)

      console.log("🩺 Respuesta API doctor:", doctor)

      // ✅ TU KEY REAL ES ESTA
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

  // =====================================
  // 📅 Cargar citas SOLO del médico logeado
  // =====================================
  useEffect(() => {
    const loadEvents = async () => {
      if (!doctorProfileId) return

      try {
        const data = await fetchAppointmentsCalendarByDoctor(doctorProfileId)
        console.log("📆 doctorProfileId:", doctorProfileId)

        const formatted: EventInput[] = data.map((a: any) => ({
          id: String(a.id),
          title: a.title,
          start: a.start,
          end: new Date(new Date(a.start).getTime() + 30 * 60000).toISOString(),
          color:
            a.status === 'confirmada'
              ? '#42b883'
              : a.status === 'cancelada'
              ? '#e74c3c'
              : a.status === 'atendida'
              ? '#2980b9'
              : '#f4c542',
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

  // =====================================
  // 📌 Selección de cita
  // =====================================
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

  // =====================================
  // 🔄 Actualizar estado de cita
  // =====================================
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
                    ? '#42b883'
                    : status === 'cancelada'
                    ? '#e74c3c'
                    : status === 'atendida'
                    ? '#2980b9'
                    : '#f4c542',
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

  if (loadingDoctor)
    return <p className="text-center mt-5">Cargando calendario...</p>

  return (
    <div className="d-flex justify-content-center align-items-start gap-4 mt-4 px-3">

      {/* =====================================
          📅 CALENDARIO
      ===================================== */}
      <div style={{ flex: 3 }}>
        <h2 className="text-center fw-bold mb-3">Agenda del Médico</h2>

        {message && (
          <Alert variant={message.startsWith('✅') ? 'success' : 'danger'}>
            {message}
          </Alert>
        )}

        {/* Leyenda */}
        <div className="d-flex justify-content-center gap-4 mb-3 fw-semibold">
          <span><span style={{ color: '#f4c542' }}>●</span> Pendiente</span>
          <span><span style={{ color: '#42b883' }}>●</span> Confirmada</span>
          <span><span style={{ color: '#e74c3c' }}>●</span> Cancelada</span>
          <span><span style={{ color: '#2980b9' }}>●</span> Atendida</span>
        </div>

        <Card className="shadow-sm p-3">
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
            height="80vh"
            nowIndicator={true}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
          />
        </Card>
      </div>

      {/* =====================================
          📄 PANEL LATERAL
      ===================================== */}
      <div
        className="bg-white rounded shadow-sm"
        style={{
          flex: panelVisible ? 1 : 0,
          maxWidth: panelVisible ? 380 : 0,
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}
      >
        <div
          style={{
            opacity: panelVisible ? 1 : 0,
            padding: panelVisible ? '1rem' : '0',
            transition: 'all 0.3s ease'
          }}
        >
          {selectedEvent ? (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold mb-0">Detalle de la Cita</h4>
                <Button variant="outline-secondary" size="sm" onClick={handleClosePanel}>
                  ✕
                </Button>
              </div>

              <p><strong>Paciente y Médico:</strong> {selectedEvent.title}</p>
              <p><strong>Fecha y hora:</strong> {new Date(selectedEvent.start).toLocaleString()}</p>
              <p><strong>Motivo:</strong> {selectedEvent.reason}</p>
              <p><strong>Estado actual:</strong> {selectedEvent.status}</p>

              <div className="d-flex flex-column gap-2 mt-4">
                <Button variant="success" onClick={() => handleStatusChange('confirmada')}>
                  Confirmar Cita
                </Button>

                <Button variant="danger" onClick={() => handleStatusChange('cancelada')}>
                  Cancelar Cita
                </Button>

                <Button variant="info" onClick={() => handleStatusChange('atendida')}>
                  Atendida
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/medico/pacientes/${selectedEvent.doc_id}`)}
                >
                  Ver Perfil del Paciente
                </Button>
              </div>
            </>
          ) : (
            <p className="text-muted text-center mt-5">
              Haz clic en una cita para ver los detalles
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
