import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { fetchAppointmentsCalendar, updateAppointmentStatus } from '@/services/appointmentService'
import type { EventInput } from '@fullcalendar/core'
import { useNavigate } from 'react-router-dom'

export default function CalendarioCitas() {
  const [events, setEvents] = useState<EventInput[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [panelVisible, setPanelVisible] = useState(false)
  const navigate = useNavigate()

  // 🔹 Cargar citas
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchAppointmentsCalendar()
        console.log('📅 Citas cargadas:', data)

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
              : '#f4c542',
          extendedProps: {
            reason: a.reason,
            status: a.status,
            doc_id: a.doc_id,       // ✅ importante
            patient_id: a.patient_id // ✅ lo agregamos también
          },
        }))
        setEvents(formatted)
      } catch (err: any) {
        console.error('❌ Error cargando citas:', err)
        setMessage('❌ Error cargando citas: ' + err.message)
      }
    }
    loadEvents()
  }, [])

  const handleEventClick = (info: any) => {
    const event = info.event
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start,
      status: event.extendedProps.status,
      reason: event.extendedProps.reason,
      doc_id: event.extendedProps.doc_id,          // ✅ ahora sí lo guardas
      patient_id: event.extendedProps.patient_id,  // ✅ lo guardas también
    })
    setPanelVisible(true)
  }


  const handleClosePanel = () => {
    setPanelVisible(false)
    setTimeout(() => setSelectedEvent(null), 300) // limpia después de la animación
  }

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

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '1.5rem',
        maxWidth: '95%',
        margin: '2rem auto',
      }}
    >
      {/* 📅 Calendario principal */}
      <div style={{ flex: 3 }}>
        <h2 className="text-center text-2xl font-semibold mb-4"> Agenda de Citas</h2>

        {message && (
          <p style={{ color: message.startsWith('✅') ? 'green' : 'red', textAlign: 'center' }}>
            {message}
          </p>
        )}

        {/* Leyenda */}
        <div className="flex justify-center gap-4 mb-4">
          <span><strong style={{ color: '#f4c542' }}>●</strong> Pendiente</span>
          <span><strong style={{ color: '#42b883' }}>●</strong> Confirmada</span>
          <span><strong style={{ color: '#e74c3c' }}>●</strong> Cancelada</span>
        </div>

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
      </div>

      {/* 🧾 Panel flotante a la derecha */}
      <div
        style={{
          flex: panelVisible ? 1.3 : 0,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          maxWidth: panelVisible ? '380px' : '0px',
        }}
      >
        <div
          style={{
            opacity: panelVisible ? 1 : 0,
            transform: panelVisible ? 'translateX(0)' : 'translateX(50px)',
            transition: 'all 0.3s ease',
            background: 'white',
            borderRadius: '10px',
            boxShadow: '0 0 12px rgba(0,0,0,0.1)',
            padding: panelVisible ? '1rem 1.5rem' : '0',
            height: '80vh',
          }}
        >
          {selectedEvent ? (
            <>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold"> Detalle de la Cita</h3>
                <button
                  onClick={handleClosePanel}
                  className="text-gray-600 hover:text-gray-900 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              <p><strong>Paciente y Médico:</strong> {selectedEvent.title}</p>
              <p><strong>Fecha y hora:</strong> {new Date(selectedEvent.start).toLocaleString()}</p>
              <p><strong>Motivo:</strong> {selectedEvent.reason}</p>
              <p><strong>Estado actual:</strong> {selectedEvent.status}</p>

              <div className="flex flex-col gap-3 mt-6">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  onClick={() => handleStatusChange('confirmada')}
                >
                  ✅ Confirmar cita
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  onClick={() => handleStatusChange('cancelada')}
                >
                  ❌ Cancelar cita
                </button>
                <button
                  onClick={() => {
                    const docId =
                      selectedEvent?.extendedProps?.doc_id || selectedEvent?.doc_id

                    if (docId) {
                      navigate(`/medico/pacientes/${docId}`)
                    } else {
                      alert('⚠️ No se encontró la cédula del paciente.')
                      console.log('Evento:', selectedEvent)
                    }
                  }}
                >
                   Ver perfil del paciente
                </button>

              </div>
            </>
          ) : (
            <div className="text-gray-500 text-center mt-10">
              <p>Haz clic en una cita para ver los detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
