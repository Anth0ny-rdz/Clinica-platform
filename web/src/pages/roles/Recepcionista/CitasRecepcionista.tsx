import { useEffect, useState } from 'react'
import { Modal, Button, Card, Form, Table, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

import { createAppointment, fetchAppointments, fetchAvailableHours } from '@/services/appointmentService'
import { fetchUserProfileId } from '@/services/userService'
import { fetchAllPatients } from '@/services/patientService'
import { fetchSpecialties } from '@/services/specialtyService'
import { fetchDoctorsBySpecialty } from '@/services/doctorService'
import { fetchEncountersByPatientBrief } from '@/services/encounterService'
import { useAuth } from '@/context/AuthContext'

export default function CitasRecepcionista() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState<any[]>([])
  const [specialties, setSpecialties] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [filteredPatients, setFilteredPatients] = useState<any[]>([])

  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null)
  const [availableHours, setAvailableHours] = useState<string[]>([])
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null)
  const [profileId, setProfileId] = useState<number | null>(null)

  const [searchPatient, setSearchPatient] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)

  const [modalHistorial, setModalHistorial] = useState(false)
  const [historial, setHistorial] = useState<any[]>([])

  const [searchAppointment, setSearchAppointment] = useState("")

  const [form, setForm] = useState({
    doctor_id: '',
    date: '',
    time: '',
    reason: '',
  })

  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // ============================
  // Cargar perfil + pacientes + especialidades + citas
  // ============================
  useEffect(() => {
    (async () => {
      if (user?.auth_id) {
        const data = await fetchUserProfileId(user.auth_id)
        setProfileId(data.user_profile_id)
      }

      const pats = await fetchAllPatients()
      const sp = await fetchSpecialties()
      const citas = await fetchAppointments()

      setPatients(pats)
      setSpecialties(sp)
      setAppointments(citas)
    })()
  }, [])

  // ============================
  // Buscador dinámico
  // ============================
  function handleSearchPatient(text: string) {
    setSearchPatient(text)

    if (text.length < 2) return setFilteredPatients([])

    const filtered = patients.filter(
      (p) =>
        `${p.names} ${p.lastname} ${p.doc_id}`
          .toLowerCase()
          .includes(text.toLowerCase())
    )

    setFilteredPatients(filtered)
  }

  // ============================
  // Filtro dinámico de citas
  // ============================
  const filteredAppointments = appointments.filter((a) =>
    `${a.patient_name} ${a.doctor_name} ${a.reason} ${a.status} ${a.date}`
      .toLowerCase()
      .includes(searchAppointment.toLowerCase())
  )

  // ============================
  // Cargar doctores por especialidad
  // ============================
  useEffect(() => {
    if (selectedSpecialty !== null) {
      fetchDoctorsBySpecialty(selectedSpecialty)
        .then((d) => setDoctors(d))
        .catch(() => setDoctors([]))
    }
  }, [selectedSpecialty])

  // ============================
  // Cargar disponibilidad del médico
  // ============================
  useEffect(() => {
    if (form.doctor_id && form.date) {
      fetchAvailableHours(parseInt(form.doctor_id), form.date)
        .then((data) => {
          if (!data.disponible || data.horas.length === 0) {
            setAvailableHours([])
            setAvailabilityMessage(`❌ El médico no atiende el día ${data.dia || ''}.`)
          } else {
            setAvailableHours(data.horas)
            setAvailabilityMessage(null)
          }
        })
        .catch(() => {
          setAvailableHours([])
          setAvailabilityMessage("⚠️ Error obteniendo disponibilidad.")
        })
    }
  }, [form.doctor_id, form.date])

  // ============================
  // Obtener citas ocupadas
  // ============================
  const horasTomadas = appointments
    .filter(
      (c) =>
        form.doctor_id &&
        c.doctor_profile_id === parseInt(form.doctor_id) &&
        c.date === form.date
    )
    .map((c) => c.time.slice(0, 5))

  // ============================
  // Guardar cita
  // ============================
  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!selectedPatient) return setMessage("⚠️ Selecciona un paciente.")

    try {
      setLoading(true)

      await createAppointment({
        patient_id: selectedPatient.patient_id,
        doctor_profile_id: parseInt(form.doctor_id),
        created_by: profileId!,
        date: form.date,
        time: form.time,
        reason: form.reason,
      })

      setMessage("✅ Cita registrada correctamente.")
      setForm({ doctor_id: "", date: "", time: "", reason: "" })
      setSelectedPatient(null)
      setSearchPatient("")
      setFilteredPatients([])

      const updated = await fetchAppointments()
      setAppointments(updated)
    } catch (err: any) {
      setMessage("❌ Error al registrar cita.")
    } finally {
      setLoading(false)
    }
  }

  // ============================
  // Abrir historial médico
  // ============================
  async function abrirHistorial() {
    if (!selectedPatient) return

    const data = await fetchEncountersByPatientBrief(selectedPatient.patient_id)
    setHistorial(data)
    setModalHistorial(true)
  }

  // ============================
  // RENDER
  // ============================
  return (
    <div className="container mt-4">
      <Card className="shadow p-4">
        <h2 className="mb-3">📅 Agendamiento de Citas</h2>

        <Button
          variant="primary"
          className="mb-3"
          onClick={() => navigate("/recepcionista/usuarios")}
        >
          ➕ Registrar Paciente
        </Button>

        {message && (
          <Alert variant={message.startsWith("✅") ? "success" : "danger"}>
            {message}
          </Alert>
        )}

        {/* BUSCAR PACIENTE */}
        <Form.Group className="mb-3">
          <Form.Label>Buscar Paciente</Form.Label>
          <Form.Control
            type="text"
            placeholder="Escriba nombre o cédula..."
            value={searchPatient}
            onChange={(e) => handleSearchPatient(e.target.value)}
          />

          {filteredPatients.length > 0 && (
            <div
              className="border rounded mt-1 bg-white"
              style={{ maxHeight: 180, overflowY: "auto" }}
            >
              {filteredPatients.map((p) => (
                <div
                  key={p.patient_id}
                  className="p-2 list-item-hover"
                  onClick={() => {
                    setSelectedPatient(p)
                    setSearchPatient(`${p.names} ${p.lastname} — ${p.doc_id}`)
                    setFilteredPatients([])
                  }}
                >
                  {p.names} {p.lastname} — {p.doc_id}
                </div>
              ))}
            </div>
          )}
        </Form.Group>

        {/* INFO PACIENTE */}
        {selectedPatient && (
          <Card className="p-3 mb-3 bg-light">
            <h5>🧍 Paciente Seleccionado</h5>
            <p><strong>Nombre:</strong> {selectedPatient.names} {selectedPatient.lastname}</p>
            <p><strong>Tel:</strong> {selectedPatient.telephone || "—"}</p>
            <p><strong>Email:</strong> {selectedPatient.email || "—"}</p>

            <Button variant="info" size="sm" onClick={abrirHistorial}>
              📋 Ver Historial Médico
            </Button>
          </Card>
        )}

        {/* FORMULARIO CITA */}
        <Form onSubmit={handleSubmit}>
          <Form.Select
            className="mb-2"
            value={selectedSpecialty ?? ""}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : null
              setSelectedSpecialty(val)
              setForm((prev) => ({ ...prev, doctor_id: '' }))
            }}
            required
          >
            <option value="">Seleccionar especialidad...</option>
            {specialties.map((s) => (
              <option key={s.especialidad_id} value={s.especialidad_id}>
                {s.name}
              </option>
            ))}
          </Form.Select>

          <Form.Select
            className="mb-2"
            name="doctor_id"
            value={form.doctor_id}
            onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
            disabled={!doctors.length}
            required
          >
            <option value="">
              {doctors.length ? "Seleccionar médico..." : "Elige una especialidad"}
            </option>

            {doctors.map((d) => (
              <option key={d.doctors_id} value={d.doctors_id}>
                Dr. {d.nombres} {d.apellidos} — {d.subespecialidad || "General"}
              </option>
            ))}
          </Form.Select>

          <Form.Control
            className="mb-2"
            type="date"
            min={new Date().toISOString().split("T")[0]}   // 👈 evita días pasados
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          {/* SELECTOR DE HORAS */}
          <Form.Select
              className="mb-2"
              name="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              required
            >
              <option value="">Seleccionar hora...</option>

              {availableHours
                .filter((h) => {
                  if (!form.date) return true;

                  const todayStr = new Date().toISOString().split("T")[0]; 
                  const selectedDateStr = form.date;

                  // 📍 Si la fecha es futura → mostrar todas las horas
                  if (selectedDateStr > todayStr) return true;

                  // 📍 Si la fecha es pasada → no mostrar ninguna
                  if (selectedDateStr < todayStr) return false;

                  // 📍 Si la fecha es HOY → filtrar horas pasadas correctamente
                  const now = new Date();
                  const currentMinutes = now.getHours() * 60 + now.getMinutes();

                  const [hour, minute] = h.split(":").map(Number);
                  const slotMinutes = hour * 60 + minute;

                  return slotMinutes > currentMinutes;
                })
                .map((h) => {
                  const ocupada = horasTomadas.includes(h);

                  return (
                    <option
                      key={h}
                      value={ocupada ? "" : h}
                      disabled={ocupada}
                      style={{ color: ocupada ? "red" : "black" }}
                    >
                      {ocupada ? `${h} — Ocupada` : h}
                    </option>
                  );
                })}
            </Form.Select>


          {availabilityMessage && (
            <p className="text-danger">{availabilityMessage}</p>
          )}

          <Form.Control
            as="textarea"
            className="mb-3"
            placeholder="Motivo de la cita"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />

          <Button type="submit" disabled={loading || !availableHours.length}>
            {loading ? "Guardando..." : "Registrar Cita"}
          </Button>
        </Form>
      </Card>

      {/* ============================
          TABLA DE CITAS + BÚSQUEDA
      ============================ */}
      <Card className="shadow p-4 mt-4">
        <h4>🗂️ Citas Registradas</h4>

        {/* 🔎 Barra de búsqueda */}
        <Form.Control
          type="text"
          placeholder="Buscar cita por paciente, médico, motivo, fecha o estado..."
          className="mt-3"
          value={searchAppointment}
          onChange={(e) => setSearchAppointment(e.target.value)}
        />

        {/* Tabla */}
        <Table bordered hover className="mt-3">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Médico</th>
              <th>Motivo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((a) => (
                <tr key={a.appointment_id}>
                  <td>{new Date(a.date).toLocaleDateString('es-EC')}</td>
                  <td>{a.time.slice(0, 5)}</td>
                  <td>{a.patient_name}</td>
                  <td>{a.doctor_name}</td>
                  <td>{a.reason || "—"}</td>
                  <td>{a.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-muted py-3">
                  No se encontraron citas que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* MODAL HISTORIAL */}
      <Modal show={modalHistorial} onHide={() => setModalHistorial(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Historial Médico</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {historial.length === 0 ? (
            <p>No tiene historias registradas.</p>
          ) : (
            <Table bordered hover>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Médico</th>
                  <th>Especialidad</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((h) => (
                  <tr key={h.encounter_id}>
                    <td>{h.date}</td>
                    <td>{h.doctor_name}</td>
                    <td>{h.specialty}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalHistorial(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      <style>
        {`.list-item-hover:hover { background:#eef4ff; cursor:pointer; }`}
      </style>
    </div>
  )
}
