import { useEffect, useState } from "react";
import { Card, Table, Spinner, Alert, Button } from "react-bootstrap";
import { fetchExamPendientes } from "@/services/labService";
import { useNavigate } from "react-router-dom";

export default function Pendientes() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await fetchExamPendientes();
      setItems(data);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Spinner className="m-4" />;

  return (
    <Card className="shadow p-4">
      <h3>🧪 Exámenes Pendientes</h3>

      {message && <Alert variant="danger">{message}</Alert>}

      <Table bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Paciente</th>
            <th>Examen</th>
            <th>Médico</th>
            <th>Observaciones</th>
            <th>Orden</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {items.map((i) => (
            <tr key={i.item_id}>
              {/* PACIENTE */}
              <td>
                <strong>
                  {i.exam_orders.patients.names} {i.exam_orders.patients.lastname}
                </strong>
                <br />
                <small>Cédula: {i.exam_orders.patients.doc_id}</small>
              </td>

              {/* EXAMEN */}
              <td>{i.exam_type.name}</td>

              {/* MÉDICO */}
              <td>
                Dr. {i.exam_orders.doctors.nombres}{" "}
                {i.exam_orders.doctors.apellidos}
              </td>

              {/* OBSERVACIONES */}
              <td>{i.exam_orders.observations || "—"}</td>

              {/* ORDEN */}
              <td>#{i.exam_orders.order_id}</td>

              {/* BOTÓN */}
              <td>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() =>
                    navigate(`/laboratorio/item/${i.item_id}`)
                  }
                >
                  Procesar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
