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

  // ------------------------------
  // IDENTIFICAR SI PDF O IMAGEN
  // ------------------------------

  const resultUrl = item.result_url || null;

  let isPDF = false;
  let isImage = false;

  if (resultUrl) {
    const lower = resultUrl.toLowerCase();
    isPDF = lower.includes(".pdf");
    isImage =
      lower.includes(".png") ||
      lower.includes(".jpg") ||
      lower.includes(".jpeg") ||
      lower.includes(".webp");
  }

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

        {/* ------------------------------
            VISUALIZACIÓN DEL RESULTADO
        ------------------------------ */}
        {item.status === "completado" && resultUrl && (
          <div className="mt-4">
            <h5>📄 Resultado</h5>

            {/* Mostrar PDF */}
            {isPDF && (
              <>
                <iframe
                  src={resultUrl}
                  style={{ width: "100%", height: "600px", borderRadius: "8px" }}
                ></iframe>

                <Button
                  variant="primary"
                  className="mt-3"
                  href={resultUrl}
                  target="_blank"
                >
                  Descargar PDF
                </Button>
              </>
            )}

            {/* Mostrar imagen */}
            {isImage && (
              <>
                <img
                  src={resultUrl}
                  alt="Resultado examen"
                  style={{
                    maxWidth: "100%",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                  }}
                />

                <Button
                  variant="primary"
                  className="mt-3"
                  href={resultUrl}
                  target="_blank"
                >
                  Ver imagen completa
                </Button>
              </>
            )}

            {/* Otro tipo */}
            {!isPDF && !isImage && (
              <Alert variant="info" className="mt-3">
                Tipo de archivo no soportado.
                <br />
                <a href={resultUrl} target="_blank">
                  Descargar archivo
                </a>
              </Alert>
            )}
          </div>
        )}

        {/* ------------------------------
            SUBIR RESULTADO
        ------------------------------ */}
        {item.status === "pendiente" && (
          <Button
            variant="success"
            className="mt-3"
            onClick={() => navigate(`/laboratorio/item/${item.item_id}/subir`)}
          >
            📤 Subir Resultado
          </Button>
        )}
      </Card>
    </div>
  );
}
