import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, Spinner, Button, Table, Alert } from "react-bootstrap"

import { fetchEncounterDetail } from "@/services/encounterService"
import { fetchExamOrdersByEncounter } from "@/services/examService"

export default function HistoriaDetalle() {
  const { encounter_id } = useParams()
  const navigate = useNavigate()

  const [encounter, setEncounter] = useState<any>(null)
  const [examOrders, setExamOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!encounter_id) return

        // 🔹 Cargar historia clínica
        const detail = await fetchEncounterDetail(Number(encounter_id))
        setEncounter(detail)

        // 🔹 Cargar órdenes de examen asociadas
        const exams = await fetchExamOrdersByEncounter(Number(encounter_id))
        setExamOrders(exams)

      } catch (err: any) {
        console.error("❌ Error:", err)
        setMessage(err.message || "Error cargando detalles")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [encounter_id])

  if (loading) return <Spinner className="m-4" />

  if (!encounter)
    return (
      <Alert variant="danger" className="m-4">
        {message || "No se encontró la historia clínica."}
      </Alert>
    )

  return (
    <div className="container mt-4">

      <Button variant="link" onClick={() => navigate(-1)}>
        ← Volver
      </Button>

      <Card className="shadow p-4 mb-4">
        <h3>🧑‍⚕️ Historia Clínica</h3>

        <p><strong>Fecha:</strong> {encounter.date}</p>
        <p><strong>Médico:</strong> {encounter.doctor_name}</p>
        <p><strong>Motivo:</strong> {encounter.reason_for_consultation}</p>

        <hr />

        <h4>🩺 Signos Vitales</h4>
        <p><strong>Presión arterial:</strong> {encounter.vital_signs?.presion_arterial || "—"}</p>
        <p><strong>Pulso:</strong> {encounter.vital_signs?.pulso_xmin || "—"}</p>
        <p><strong>Temperatura:</strong> {encounter.vital_signs?.temperatura || "—"}</p>
      </Card>

      {/* ========================== */}
      {/*   ÓRDENES DE EXÁMENES     */}
      {/* ========================== */}
      <Card className="shadow p-4 mb-5">
        <div className="d-flex justify-content-between align-items-center">
          <h3>🧪 Órdenes de Exámenes</h3>

          {/* 🔥 NUEVO BOTÓN PARA CREAR ORDEN */}
          <Button
            variant="success"
            onClick={() => navigate(`/medico/examenes/nuevo/${encounter_id}`)}
          >
            ➕ Solicitar Examen
          </Button>
        </div>

        {examOrders.length === 0 ? (
          <p className="text-muted mt-3">No existen órdenes de examen.</p>
        ) : (
          <Table bordered hover className="mt-3">
            <thead>
              <tr>
                <th>ID Orden</th>
                <th>Fecha</th>
                <th>Diagnóstico</th>
                <th>Items</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {examOrders.map((order) => (
                <tr key={order.order_id}>
                  <td>{order.order_id}</td>
                  <td>{order.created_at}</td>
                  <td>{order.diagnosis || "—"}</td>
                  <td>{order.items_count} exámenes</td>
                  <td>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() =>
                        navigate(`/medico/examenes/orden/${order.order_id}`)
                      }
                    >
                      Ver Detalle
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  )
}
