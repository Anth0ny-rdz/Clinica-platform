import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spinner, Button, Alert } from "react-bootstrap";

import { getSignedResultUrl } from "@/services/labService";
import { fetchExamResultsByItem } from "@/services/examService";

export default function ResultadoExamen() {
  const { item_id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState<any>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadResult();
  }, []);

  async function loadResult() {
    try {
      setLoading(true);

      const data = await fetchExamResultsByItem(Number(item_id));

      if (!data || data.length === 0) {
        setMessage("⚠️ No existen resultados para este examen.");
        return;
      }

      const first = data[0];
      setResult(first);

      // Obtener URL firmada desde backend
      const signed = await getSignedResultUrl(Number(item_id));
      setSignedUrl(signed.url);

    } catch (err: any) {
      console.error(err);
      setMessage("❌ Error cargando resultados.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Spinner className="m-4" />;

  return (
    <div className="container mt-4">
      <Button variant="link" onClick={() => navigate(-1)}>
        ← Volver
      </Button>

      <Card className="shadow p-4">
        <h3>🧪 Resultado del Examen</h3>

        {message && (
          <Alert variant="warning" className="mt-3">
            {message}
          </Alert>
        )}

        {result && signedUrl && (
          <div className="mt-3">
            <p><strong>Subido por:</strong> Usuario #{result.uploaded_by}</p>
            <p><strong>Fecha:</strong> {result.uploaded_at}</p>

            {/* DECODIFICAR EXTENSION */}
            {(() => {
              const isPDF = signedUrl.toLowerCase().includes(".pdf");
              const isImage =
                signedUrl.toLowerCase().includes(".png") ||
                signedUrl.toLowerCase().includes(".jpg") ||
                signedUrl.toLowerCase().includes(".jpeg") ||
                signedUrl.toLowerCase().includes(".webp");

              if (isPDF) {
                return (
                  <div>
                    <iframe
                      src={signedUrl}
                      style={{ width: "100%", height: "600px", borderRadius: "8px" }}
                    ></iframe>

                    <Button
                      variant="primary"
                      className="mt-2"
                      href={signedUrl}
                      target="_blank"
                    >
                      Descargar PDF
                    </Button>
                  </div>
                );
              }

              if (isImage) {
                return (
                  <div>
                    <img
                      src={signedUrl}
                      alt="Resultado examen"
                      style={{
                        maxWidth: "100%",
                        borderRadius: "10px",
                        border: "1px solid #ddd"
                      }}
                    />
                    <Button
                      variant="primary"
                      className="mt-2"
                      href={signedUrl}
                      target="_blank"
                    >
                      Ver imagen completa
                    </Button>
                  </div>
                );
              }

              return (
                <Alert variant="info" className="mt-2">
                  Tipo de archivo no soportado.
                  <br />
                  <a href={signedUrl} target="_blank">
                    Descargar archivo
                  </a>
                </Alert>
              );
            })()}
          </div>
        )}
      </Card>
    </div>
  );
}
