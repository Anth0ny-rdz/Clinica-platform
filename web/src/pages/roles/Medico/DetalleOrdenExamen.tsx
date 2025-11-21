import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spinner, Button, Table, Alert } from "react-bootstrap";

import { fetchExamOrderDetail } from "@/services/examService";

export default function DetalleOrdenExamen() {
  const { order_id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadOrder();
  }, []);

  async function loadOrder() {
    try {
      setLoading(true);
      const data = await fetchExamOrderDetail(Number(order_id));
      console.log("📌 DATA ORDEN --->", data);
      setOrder(data);
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Error cargando orden de examen");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Spinner className="m-4" />;

  if (!order)
    return (
      <Alert variant="danger" className="m-4">
        {message || "No se encontró la orden."}
      </Alert>
    );

  return (
    <div className="container mt-4">
      <Button variant="link" onClick={() => navigate(-1)}>
        ← Volver
      </Button>

      <Card className="shadow p-4">
        <h3>🧪 Orden de Exámenes #{order.order_id}</h3>

        <p><strong>Paciente:</strong> {order.patient_name}</p>
        <p><strong>Cédula:</strong> {order.patient_doc_id}</p>

        <p><strong>Médico:</strong> {order.doctor_name}</p>
        <p><strong>Especialidad:</strong> {order.especialidad}</p>
        <p><strong>Subespecialidad:</strong> {order.subespecialidad}</p>

        <p><strong>Prioridad:</strong> {order.priority}</p>
        <p><strong>Observaciones:</strong> {order.observations || "—"}</p>

        <p><strong>Fecha de solicitud:</strong> {order.created_at}</p>

        <h4 className="mt-4 mb-3">🧬 Exámenes Solicitados</h4>

        <Table bordered hover>
          <thead>
            <tr>
              <th>Examen</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: any) => (
              <tr key={item.item_id}>
                <td>{item.exam_type_name}</td>
                <td>{item.status}</td>
                <td>
                  {/* Mostrar botón SOLO si hay resultados */}
                  {(item.status === "completado" || item.status === "realizado") ? (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() =>
                        navigate(`/medico/examenes/resultado/${item.item_id}`)
                      }
                    >
                      Ver Resultados
                    </Button>
                  ) : (
                    <span className="text-muted">Sin resultados</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
