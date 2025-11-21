import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, Button, Form, Spinner, Alert } from "react-bootstrap"

import { fetchExamContext } from "@/services/examService"
import { fetchAllExamTypes, createExamOrder, addExamItems } from "@/services/examService"
import { useAuth } from "@/context/AuthContext"

export default function SolicitarExamen() {
  const { encounter_id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [encounter, setEncounter] = useState<any>(null)
  const [examTypes, setExamTypes] = useState<any[]>([])
  const [selectedExams, setSelectedExams] = useState<number[]>([])
  const [priority, setPriority] = useState("normal")
  const [observations, setObservations] = useState("")   // 👈 CAMBIADO
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)

      // 🔹 Cargar datos del encounter
      const enc = await fetchExamContext(Number(encounter_id))
      setEncounter(enc)

      // 🔹 Cargar tipos de examen
      const tipos = await fetchAllExamTypes()
      setExamTypes(tipos)

    } catch (err: any) {
      console.error("❌ Error:", err)
      setMessage(err.message || "Error cargando información")
    } finally {
      setLoading(false)
    }
  }

  // 🟦 Manejar selección múltiple
  function toggleExam(examtype_id: number) {
    setSelectedExams((prev) =>
      prev.includes(examtype_id)
        ? prev.filter((id) => id !== examtype_id)
        : [...prev, examtype_id]
    )
  }

  // 🟩 Guardar Orden + Items
  async function handleSubmit(e: any) {
    e.preventDefault()

    if (selectedExams.length === 0)
      return setMessage("⚠️ Selecciona al menos un tipo de examen.")

    try {
      setSaving(true)

      const order = await createExamOrder({
        encounter_id: Number(encounter_id),
        patient_id: encounter.patient_id,
        doctor_id: encounter.doctor_id,  // 👈 este sí existía
        priority: priority,
        observations              // 👈 CORREGIDO
      })

      // 🔹 Crear items
      await addExamItems(order.order_id, selectedExams)

      setMessage("✅ Orden creada correctamente. Redirigiendo...")
      setTimeout(() => {
        navigate(`/medico/examenes/orden/${order.order_id}`)
      }, 1200)

    } catch (err: any) {
      setMessage("❌ Error al crear la orden: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner className="m-4" />

  if (!encounter)
    return (
      <Alert variant="danger" className="m-4">
        Error cargando la historia médica.
      </Alert>
    )

  return (
    <div className="container mt-4">

      <Button variant="link" onClick={() => navigate(-1)}>
        ← Volver
      </Button>

      <Card className="shadow p-4 mb-4">
        <h3>🧪 Solicitar Exámenes</h3>
        <p><strong>Paciente:</strong> {encounter.patient_name}</p>
        <p><strong>Médico:</strong> {encounter.doctor_name}</p>
        <p><strong>Motivo consulta:</strong> {encounter.reason_for_consultation}</p>
      </Card>

      <Card className="shadow p-4">
        {message && (
          <Alert variant={message.startsWith("✅") ? "success" : "danger"}>
            {message}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>

          {/* PRIORIDAD */}
          <Form.Group className="mb-3">
            <Form.Label><strong>Prioridad</strong></Form.Label>
            <Form.Select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="normal">Normal</option>
              <option value="urgente">Urgente</option>
            </Form.Select>
          </Form.Group>

          {/* OBSERVACIONES */}
          <Form.Group className="mb-3">
            <Form.Label><strong>Observaciones</strong></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Escriba observaciones adicionales..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)} // 👈 CORREGIDO
            />
          </Form.Group>

          {/* LISTA DE TIPOS DE EXAMEN */}
          <h5 className="mt-4 mb-3">Seleccione los exámenes a solicitar</h5>

          <div className="border rounded p-3" style={{ maxHeight: 250, overflowY: "auto" }}>
            {examTypes.map((exam) => (
              <Form.Check
                key={exam.examtype_id}
                type="checkbox"
                label={`${exam.name}`}
                checked={selectedExams.includes(exam.examtype_id)}
                onChange={() => toggleExam(exam.examtype_id)}
                className="mb-2"
              />
            ))}
          </div>

          <Button
            type="submit"
            className="mt-3"
            variant="success"
            disabled={saving}
          >
            {saving ? "Guardando..." : "Crear Orden"}
          </Button>
        </Form>
      </Card>
    </div>
  )
}
