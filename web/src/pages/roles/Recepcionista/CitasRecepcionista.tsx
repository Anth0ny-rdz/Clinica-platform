import { useEffect, useState } from 'react'
import { Modal, Button, Card, Form, Table, Alert, Badge } from 'react-bootstrap'
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

  /* =============================
     CARGA INICIAL (ORIGINAL)
  ============================= */
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

  /* =============================
     BUSCADOR PACIENTE (ORIGINAL)
  ============================= */
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

  /* =============================
     FILTRO CITAS (ORIGINAL)
  ============================= */
  const filteredAppointments = appointments.filter((a) =>
    `${a.patient_name} ${a.doctor_name} ${a.reason} ${a.status} ${a.date}`
      .toLowerCase()
      .includes(searchAppointment.toLowerCase())
  )

  /* =============================
     DOCTORES POR ESPECIALIDAD
  ============================= */
  useEffect(() => {
    if (selectedSpecialty !== null) {
      fetchDoctorsBySpecialty(selectedSpecialty)
        .then((d) => setDoctors(d))
        .catch(() => setDoctors([]))
    }
  }, [selectedSpecialty])

  /* =============================
     DISPONIBILIDAD MÉDICO (ORIGINAL)
  ============================= */
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

  /* =============================
     HORAS TOMADAS (ORIGINAL)
  ============================= */
  const horasTomadas = appointments
    .filter(
      (c) =>
        form.doctor_id &&
        c.doctor_profile_id === parseInt(form.doctor_id) &&
        c.date === form.date
    )
    .map((c) => c.time.slice(0, 5))

  /* =============================
     GUARDAR CITA (ORIGINAL)
  ============================= */
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
    } catch {
      setMessage("❌ Error al registrar cita.")
    } finally {
      setLoading(false)
    }
  }

  /* =============================
     HISTORIAL MÉDICO (ORIGINAL)
  ============================= */
  async function abrirHistorial() {
    if (!selectedPatient) return
    const data = await fetchEncountersByPatientBrief(selectedPatient.patient_id)
    setHistorial(data)
    setModalHistorial(true)
  }

  /* =============================
     RENDER
  ============================= */
  return (
    <div className="container mt-4">

      <Card className="shadow p-4 mb-4">
        <h2 className="mb-1">📅 Agendamiento de Citas</h2>
        <p className="text-muted">
          Seleccione un paciente, elija médico y registre la cita.
        </p>

        <div className="d-flex justify-content-end mb-3">
          <Button
            variant="outline-primary"
            onClick={() => navigate("/recepcionista/usuarios")}
          >
            ➕ Registrar Paciente
          </Button>
        </div>

        {message && (
          <Alert variant={message.startsWith("✅") ? "success" : "danger"}>
            {message}
          </Alert>
        )}

        {/* BUSCAR PACIENTE */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">🔎 Buscar Paciente</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nombre o documento..."
            value={searchPatient}
            onChange={(e) => handleSearchPatient(e.target.value)}
          />

          {filteredPatients.length > 0 && (
            <div className="border rounded mt-1 bg-white" style={{ maxHeight: 180, overflowY: "auto" }}>
              {filteredPatients.map((p) => (
                <div
                  key={p.patient_id}
                  className="p-2 list-item-hover border-bottom"
                  onClick={() => {
                    setSelectedPatient(p)
                    setSearchPatient(`${p.names} ${p.lastname} — ${p.doc_id}`)
                    setFilteredPatients([])
                  }}
                >
                  <strong>{p.names} {p.lastname}</strong><br />
                  <small className="text-muted">{p.doc_id}</small>
                </div>
              ))}
            </div>
          )}
        </Form.Group>

        {/* PACIENTE */}
        {selectedPatient && (
          <Card className="p-3 mb-3 bg-light border-start border-4 border-primary">
            <h5>🧍 Paciente Seleccionado</h5>
            <p><strong>Nombre:</strong> {selectedPatient.names} {selectedPatient.lastname}</p>
            <p><strong>Tel:</strong> {selectedPatient.telephone || "—"}</p>
            <p><strong>Email:</strong> {selectedPatient.email || "—"}</p>

            <Button variant="outline-info" size="sm" onClick={abrirHistorial}>
              📋 Ver Historial Médico
            </Button>
          </Card>
        )}

        {/* FORMULARIO */}
        <Form onSubmit={handleSubmit}>
          <hr />
          <h5>🩺 Datos de la cita</h5>

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
                Dr. {d.nombres} {d.apellidos}
              </option>
            ))}
          </Form.Select>

          <Form.Control
            className="mb-2"
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />

          {/* === SELECTOR DE HORAS (LÓGICA ORIGINAL) === */}
          <Form.Select
            className="mb-2"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            required
          >
            <option value="">Seleccionar hora...</option>

            {availableHours
              .filter((h) => {
                if (!form.date) return true

                const todayStr = new Date().toISOString().split("T")[0]
                const selectedDateStr = form.date

                if (selectedDateStr > todayStr) return true
                if (selectedDateStr < todayStr) return false

                const now = new Date()
                const currentMinutes = now.getHours() * 60 + now.getMinutes()

                const [hour, minute] = h.split(":").map(Number)
                const slotMinutes = hour * 60 + minute

                return slotMinutes > currentMinutes
              })
              .map((h) => {
                const ocupada = horasTomadas.includes(h)

                return (
                  <option
                    key={h}
                    value={ocupada ? "" : h}
                    disabled={ocupada}
                    style={{ color: ocupada ? "#dc3545" : "black" }}
                  >
                    {ocupada ? `${h} — Ocupada` : h}
                  </option>
                )
              })}
          </Form.Select>

          {availabilityMessage && (
            <Alert variant="warning">{availabilityMessage}</Alert>
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

      {/* TABLA CITAS */}
      <Card className="shadow p-4">
        <h4>🗂️ Citas Registradas</h4>

        <Form.Control
          className="mt-3"
          placeholder="Buscar cita..."
          value={searchAppointment}
          onChange={(e) => setSearchAppointment(e.target.value)}
        />

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
            {filteredAppointments.map((a) => (
              <tr key={a.appointment_id}>
                <td>{new Date(a.date).toLocaleDateString('es-EC')}</td>
                <td>{a.time.slice(0, 5)}</td>
                <td>{a.patient_name}</td>
                <td>{a.doctor_name}</td>
                <td>{a.reason || "—"}</td>
                <td>
                  <Badge
                    bg={
                      a.status === "Pendiente"
                        ? "warning"
                        : a.status === "cancelada"
                        ? "danger"
                        : "success"
                    }
                  >
                    {a.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* MODAL HISTORIAL */}
      <Modal show={modalHistorial} onHide={() => setModalHistorial(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>📋 Historial Médico</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {historial.length === 0 ? (
            <Alert variant="secondary">
              No tiene historias clínicas registradas.
            </Alert>
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
                    <td>{new Date(h.date).toLocaleDateString('es-EC')}</td>
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
