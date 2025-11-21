import { useEffect, useState } from "react"
import { Form, Card, Button, Row, Col, Alert, Spinner } from "react-bootstrap"

import { fetchAllPatients } from "@/services/patientService"
import { fetchAllDoctorsReal } from "@/services/doctorService"
import { fetchAllRooms } from "@/services/roomService"
import { createAdmission } from "@/services/admissionService"
import { useAuth } from "@/context/AuthContext"

export default function NuevaAdmision() {
  const { user } = useAuth()

  const [patients, setPatients] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [searchPatient, setSearchPatient] = useState("")
  const [filteredPatients, setFilteredPatients] = useState<any[]>([])

  const [searchDoctor, setSearchDoctor] = useState("")
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([])

  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_profile_id: "",
    fecha_ingreso: "",
    hora_ingreso: "",
    razon_ingreso: "",
    tipo_ingreso: "",
    persona_acompana: "",
    parentesco_acompana: "",
    telefono_acompana: "",
    diagnostico_ingreso: "",
    habitacion_asignada: "",
    cama_asignada: "",
    created_by: user?.auth_id ?? null,
  })

  // ==========================
  // Cargar datos iniciales
  // ==========================
  useEffect(() => {
    async function load() {
      try {
        const pats = await fetchAllPatients()
        const docs = await fetchAllDoctorsReal()
        const rms = await fetchAllRooms()

        setPatients(pats)
        setDoctors(docs)
        setRooms(rms.filter((r: any) => r.state === "Disponible"))
      } catch (err) {
        console.error(err)
        setError("Error cargando datos")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ==========================
  // Search Paciente
  // ==========================
  function handleSearchPatient(text: string) {
    setSearchPatient(text)

    if (text.length < 2) return setFilteredPatients([])

    const filtered = patients.filter((p) =>
      `${p.names} ${p.lastname} ${p.doc_id}`.toLowerCase().includes(text.toLowerCase())
    )

    setFilteredPatients(filtered)
  }

  // ==========================
  // Search Doctor (según tu tabla REAL)
  // ==========================
  function handleSearchDoctor(text: string) {
    setSearchDoctor(text)

    if (text.length < 2) return setFilteredDoctors([])

    const filtered = doctors.filter((d) =>
      `${d.nombres} ${d.apellidos} ${d.subespecialidad} ${d.cedula_profesional}`
        .toLowerCase()
        .includes(text.toLowerCase())
    )

    setFilteredDoctors(filtered)
  }

  // ==========================
  // Submit
  // ==========================
  async function handleSubmit(e: any) {
    e.preventDefault()
    try {
      await createAdmission(formData)
      setSuccess("Admisión registrada correctamente")
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error(err)
    }
  }

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p>Cargando datos...</p>
      </div>
    )

  return (
    <div className="container mt-4">
      <Card className="shadow-lg p-4">
        <h3 className="fw-bold mb-3">🏥 Nueva Admisión</h3>

        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>

          {/* ===================================
                BUSCAR PACIENTE
          =================================== */}
          <Form.Group className="mb-3">
            <Form.Label>Paciente</Form.Label>

            <Form.Control
              type="text"
              placeholder="Buscar paciente..."
              value={searchPatient}
              onChange={(e) => handleSearchPatient(e.target.value)}
            />

            {filteredPatients.length > 0 && (
              <div className="border rounded mt-1 bg-white" style={{ maxHeight: "200px", overflowY: "auto" }}>
                {filteredPatients.map((p: any) => (
                  <div
                    key={p.patient_id}
                    className="p-2 list-item-hover"
                    onClick={() => {
                      setFormData({ ...formData, patient_id: p.patient_id })
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

          {/* ===================================
                BUSCAR DOCTOR REAL
          =================================== */}
          <Form.Group className="mb-3">
            <Form.Label>Médico responsable</Form.Label>

            <Form.Control
              type="text"
              placeholder="Buscar médico..."
              value={searchDoctor}
              onChange={(e) => handleSearchDoctor(e.target.value)}
            />

            {filteredDoctors.length > 0 && (
              <div className="border rounded mt-1 bg-white" style={{ maxHeight: "200px", overflowY: "auto" }}>
                {filteredDoctors.map((d: any) => (
                  <div
                    key={d.doctors_id}
                    className="p-2 list-item-hover"
                    onClick={() => {
                      setFormData({ ...formData, doctor_profile_id: d.doctors_id })
                      setSearchDoctor(`Dr. ${d.nombres} ${d.apellidos} — ${d.subespecialidad ?? "Sin subespecialidad"}`)
                      setFilteredDoctors([])
                    }}
                  >
                    Dr. {d.nombres} {d.apellidos}
                    {d.subespecialidad ? ` — ${d.subespecialidad}` : ""}
                  </div>
                ))}
              </div>
            )}
          </Form.Group>

          {/* FECHA Y HORA */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Fecha ingreso</Form.Label>
              <Form.Control
                type="date"
                required
                value={formData.fecha_ingreso}
                onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
              />
            </Col>

            <Col md={6}>
              <Form.Label>Hora ingreso</Form.Label>
              <Form.Control
                type="time"
                required
                value={formData.hora_ingreso}
                onChange={(e) => setFormData({ ...formData, hora_ingreso: e.target.value })}
              />
            </Col>
          </Row>

          {/* RAZÓN */}
          <Form.Group className="mb-3">
            <Form.Label>Razón de ingreso</Form.Label>
            <Form.Control
              required
              as="textarea"
              rows={2}
              value={formData.razon_ingreso}
              onChange={(e) => setFormData({ ...formData, razon_ingreso: e.target.value })}
            />
          </Form.Group>

          {/* DIAGNÓSTICO */}
          <Form.Group className="mb-3">
            <Form.Label>Diagnóstico de ingreso</Form.Label>
            <Form.Control
              required
              as="textarea"
              rows={2}
              value={formData.diagnostico_ingreso}
              onChange={(e) => setFormData({ ...formData, diagnostico_ingreso: e.target.value })}
            />
          </Form.Group>

          {/* TIPO */}
            <Form.Group className="mb-3">
            <Form.Label>Tipo de ingreso</Form.Label>
            <Form.Select
                required
                value={formData.tipo_ingreso}
                onChange={(e) => setFormData({ ...formData, tipo_ingreso: e.target.value })}
            >
                <option value="">Seleccione...</option>

                <option value="urgencia">Urgencia</option>
                <option value="hospitalizacion">Hospitalización</option>
                <option value="observacion">Observación</option>
                <option value="programado">Programado</option>

            </Form.Select>
            </Form.Group>

          {/* ACOMPAÑANTE */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Persona que acompaña</Form.Label>
              <Form.Control
                value={formData.persona_acompana}
                onChange={(e) => setFormData({ ...formData, persona_acompana: e.target.value })}
              />
            </Col>

            <Col md={4}>
              <Form.Label>Parentesco</Form.Label>
              <Form.Control
                value={formData.parentesco_acompana}
                onChange={(e) => setFormData({ ...formData, parentesco_acompana: e.target.value })}
              />
            </Col>

            <Col md={4}>
              <Form.Label>Teléfono acompañante</Form.Label>
              <Form.Control
                value={formData.telefono_acompana}
                onChange={(e) => setFormData({ ...formData, telefono_acompana: e.target.value })}
              />
            </Col>
          </Row>

          {/* HABITACIÓN */}
          <Form.Group className="mb-3">
            <Form.Label>Habitación asignada</Form.Label>
            <Form.Select
              required
              value={formData.habitacion_asignada}
              onChange={(e) => setFormData({ ...formData, habitacion_asignada: e.target.value })}
            >
              <option value="">Seleccione...</option>
              {rooms.map((r: any) => (
                <option key={r.room_id} value={r.room_id}>
                  {r.tipo} — {r.number}
                </option>
              ))}
            </Form.Select>
          </Form.Group>


          <Button type="submit" className="w-100">
            Registrar Admisión
          </Button>
        </Form>
      </Card>

      <style>{`
        .list-item-hover { cursor: pointer; }
        .list-item-hover:hover { background: #eef4ff; }
      `}</style>
    </div>
  )
}
