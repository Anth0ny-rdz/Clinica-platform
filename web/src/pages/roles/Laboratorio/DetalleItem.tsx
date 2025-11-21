import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spinner, Button, Alert } from "react-bootstrap";
import { fetchExamItemDetail } from "@/services/labService";

export default function DetalleItem() {
  const { item_id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadItem();
  }, []);

  async function loadItem() {
    try {
      setLoading(true);
      const data = await fetchExamItemDetail(Number(item_id));

      console.log("📌 Item recibido:", data);
      setItem(data);
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Error cargando el examen");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Spinner className="m-4" />;

  if (!item)
    return (
      <Alert variant="danger" className="m-4">
        {message || "Item no encontrado."}
      </Alert>
    );

  return (
    <div className="container mt-4">

      <Button variant="link" onClick={() => navigate(-1)}>
        ← Volver
      </Button>

      <Card className="shadow p-4">

        <h3>🧪 Examen #{item.item_id}</h3>

        <p><strong>Paciente:</strong> {item.patient_name}</p>
        <p><strong>Cédula:</strong> {item.patient_doc_id}</p>

        <p><strong>Médico solicitante:</strong> {item.doctor_name}</p>
        <p><strong>Especialidad:</strong> {item.especialidad}</p>

        <hr />

        <p><strong>Examen:</strong> {item.exam_type_name}</p>
        <p><strong>Descripción:</strong> {item.exam_type_description || "—"}</p>
        <p><strong>Estado:</strong> {item.status}</p>

        <hr />

        {item.status === "pendiente" && (
          <Button
            variant="success"
            onClick={() => navigate(`/laboratorio/item/${item.item_id}/subir`)}
          >
            📤 Subir Resultado
          </Button>
        )}

        {item.status === "completado" && item.result_url && (
          <Button
            variant="primary"
            as="a"
            href={item.result_url}
            target="_blank"
          >
            📄 Ver Resultado
          </Button>
        )}
      </Card>
    </div>
  );
}
