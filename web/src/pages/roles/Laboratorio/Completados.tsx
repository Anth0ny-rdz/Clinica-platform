import { useEffect, useState } from "react";
import { Card, Table, Form, Button, Alert, Spinner, Badge } from "react-bootstrap";
import { fetchCompletedExams, getSignedResultUrl } from "@/services/labService";

export default function Completados() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    date: "",
    examtype: "",
    patient: "",
    doctor: "",
  });

  const [message, setMessage] = useState<string | null>(null);

  // =========================
  // DEBOUNCE (ORIGINAL)
  // =========================
  useEffect(() => {
    const timer = setTimeout(() => load(), 300);
    return () => clearTimeout(timer);
  }, [filters]);

  async function load() {
    try {
      setLoading(true);
      setMessage(null);

      const cleanFilters: any = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v) cleanFilters[k] = v;
      });

      const data = await fetchCompletedExams(cleanFilters);
      setItems(data);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setFilters({
      date: "",
      examtype: "",
      patient: "",
      doctor: "",
    });
  }

  return (
    <Card className="shadow p-4">

      {/* ================= HEADER ================= */}
      <div className="mb-3">
        <h3 className="mb-1">📁 Exámenes Completados</h3>
        <p className="text-muted mb-0">
          Resultados de exámenes ya procesados por el laboratorio
        </p>
      </div>

      {/* ================= FILTROS ================= */}
      <Card className="p-3 mb-4 bg-light border">
        <div className="row g-2 align-items-end">

          {/* TIPO EXAMEN */}
          <div className="col-md-3">
            <Form.Label className="fw-semibold">Tipo de examen</Form.Label>
            <Form.Control
              placeholder="Ej: Hemograma"
              value={filters.examtype}
              onChange={(e) => setFilters({ ...filters, examtype: e.target.value })}
            />
          </div>

          {/* PACIENTE */}
          <div className="col-md-3">
            <Form.Label className="fw-semibold">Paciente</Form.Label>
            <Form.Control
              placeholder="Nombre del paciente"
              value={filters.patient}
              onChange={(e) => setFilters({ ...filters, patient: e.target.value })}
            />
          </div>

          {/* MÉDICO */}
          <div className="col-md-3">
            <Form.Label className="fw-semibold">Médico</Form.Label>
            <Form.Control
              placeholder="Nombre del médico"
              value={filters.doctor}
              onChange={(e) => setFilters({ ...filters, doctor: e.target.value })}
            />
          </div>

          {/* LIMPIAR */}
          <div className="col-md-3 d-grid">
            <Button variant="outline-secondary" onClick={clearFilters}>
              ↺ Limpiar filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* ================= ERROR ================= */}
      {message && (
        <Alert variant="danger">
          ❌ {message}
        </Alert>
      )}

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="text-center text-muted my-3">
          <Spinner animation="border" size="sm" className="me-2" />
          Cargando resultados...
        </div>
      )}

      {/* ================= TABLA ================= */}
      {!loading && (
        <Table bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th>Paciente</th>
              <th>Médico</th>
              <th>Examen</th>
              <th>Fecha</th>
              <th>Resultado</th>
            </tr>
          </thead>

          <tbody>
            {items.length > 0 ? (
              items.map((i) => {
                const p = i.exam_orders?.patients;
                const d = i.exam_orders?.doctors;
                const result =
                  Array.isArray(i.exam_results) && i.exam_results.length > 0
                    ? i.exam_results[0]
                    : null;

                return (
                  <tr key={i.item_id}>
                    <td>
                      {p ? (
                        <>
                          <strong>{p.names} {p.lastname}</strong>
                        </>
                      ) : "—"}
                    </td>

                    <td>
                      {d ? (
                        <>
                          Dr. {d.nombres} {d.apellidos}
                        </>
                      ) : "—"}
                    </td>

                    <td>{i.exam_type?.name ?? "—"}</td>

                    <td>
                      {result?.uploaded_at
                        ? new Date(result.uploaded_at).toLocaleDateString("es-EC")
                        : "—"}
                    </td>

                    <td>
                      {result?.file_url ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={async () => {
                            try {
                              const data = await getSignedResultUrl(i.item_id);
                              const url = data?.signed_url || data?.url;
                              if (url) window.open(url, "_blank");
                            } catch {
                              alert("No se pudo obtener el archivo.");
                            }
                          }}
                        >
                          📄 Ver Resultado
                        </Button>
                      ) : (
                        <Badge bg="secondary">Sin archivo</Badge>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-muted py-3">
                  No se encontraron exámenes con los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
