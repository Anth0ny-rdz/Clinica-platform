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
  <div
    className="container-fluid py-4"
    style={{
      background: "#f2f4f7",
      minHeight: "100vh",
    }}
  >
    <div className="mx-auto" style={{ maxWidth: 1100 }}>
      {/* VOLVER */}
      <Button
        variant="link"
        className="mb-3 px-0"
        onClick={() => navigate(-1)}
        style={{ textDecoration: "none", fontWeight: 500 }}
      >
        ← Volver a exámenes
      </Button>

      <Card
        className="shadow-sm"
        style={{
          borderRadius: "14px",
          border: "1px solid #e6e9ee",
        }}
      >
        <Card.Body className="p-4">

          {/* ================= HEADER ================= */}
          <div className="mb-4">
            <h3 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>
              🧪 Examen #{item.item_id}
            </h3>
            <span className="text-muted">
              Detalle completo del examen de laboratorio
            </span>
          </div>

          {/* ================= DATOS PACIENTE ================= */}
          <div className="mb-4">
            <h6 className="fw-semibold text-secondary mb-2">
              Información del paciente
            </h6>

            <div className="row g-2">
              <div className="col-md-6">
                <strong>Paciente:</strong> {item.patient_name}
              </div>
              <div className="col-md-6">
                <strong>Cédula:</strong> {item.patient_doc_id}
              </div>
            </div>
          </div>

          {/* ================= DATOS MÉDICO ================= */}
          <div className="mb-4">
            <h6 className="fw-semibold text-secondary mb-2">
              Solicitud médica
            </h6>

            <div className="row g-2">
              <div className="col-md-6">
                <strong>Médico solicitante:</strong> {item.doctor_name}
              </div>
              <div className="col-md-6">
                <strong>Especialidad:</strong> {item.especialidad}
              </div>
            </div>
          </div>

          {/* ================= DATOS EXAMEN ================= */}
          <div
            className="mb-4"
            style={{
              background: "#f8f9fb",
              padding: "1rem",
              borderRadius: "12px",
              border: "1px solid #e3e6eb",
            }}
          >
            <h6 className="fw-semibold mb-2">
              Detalles del examen
            </h6>

            <p className="mb-1">
              <strong>Examen:</strong> {item.exam_type_name}
            </p>

            <p className="mb-1">
              <strong>Descripción:</strong>{" "}
              {item.exam_type_description || "—"}
            </p>

            <p className="mb-0">
              <strong>Estado:</strong>{" "}
              <span
                className={
                  item.status === "completado"
                    ? "text-success fw-semibold"
                    : "text-warning fw-semibold"
                }
              >
                {item.status}
              </span>
            </p>
          </div>

          {/* ================= RESULTADO ================= */}
          {item.status === "completado" && resultUrl && (
            <div className="mb-4">
              <h5 className="fw-semibold mb-3">
                📄 Resultado del examen
              </h5>

              {/* PDF */}
              {isPDF && (
                <>
                  <div
                    style={{
                      border: "1px solid #e3e6eb",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <iframe
                      src={resultUrl}
                      style={{
                        width: "100%",
                        height: "600px",
                        border: "none",
                      }}
                    />
                  </div>

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

              {/* IMAGEN */}
              {isImage && (
                <>
                  <div
                    style={{
                      textAlign: "center",
                      background: "#fff",
                      border: "1px solid #e3e6eb",
                      borderRadius: "10px",
                      padding: "1rem",
                    }}
                  >
                    <img
                      src={resultUrl}
                      alt="Resultado examen"
                      style={{
                        maxWidth: "100%",
                        borderRadius: "8px",
                      }}
                    />
                  </div>

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

              {/* OTRO */}
              {!isPDF && !isImage && (
                <Alert variant="info" className="mt-3">
                  Tipo de archivo no soportado para vista previa.
                  <br />
                  <a href={resultUrl} target="_blank">
                    Descargar archivo
                  </a>
                </Alert>
              )}
            </div>
          )}

          {/* ================= SUBIR RESULTADO ================= */}
          {item.status === "pendiente" && (
            <div className="text-end">
              <Button
                variant="success"
                onClick={() =>
                  navigate(
                    `/laboratorio/item/${item.item_id}/subir`
                  )
                }
              >
                📤 Subir resultado
              </Button>
            </div>
          )}

        </Card.Body>
      </Card>
    </div>
  </div>
);

}
