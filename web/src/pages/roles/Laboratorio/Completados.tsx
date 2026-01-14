import { useEffect, useState } from "react";
import { Card, Table, Form, Button, Alert, Spinner, Badge } from "react-bootstrap";
import { fetchCompletedExams, getSignedResultUrl } from "@/services/labService";
import { useNavigate } from "react-router-dom";

export default function Completados() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

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
  <div
    className="container-fluid py-4"
    style={{
      background: "#f2f4f7",
      minHeight: "100vh",
    }}
  >
    <div
      className="mx-auto"
      style={{
        maxWidth: 1100,
      }}
    >
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
              📁 Exámenes Completados
            </h3>
            <p className="text-muted mb-0">
              Resultados de exámenes procesados por el laboratorio clínico
            </p>
          </div>

          {/* ================= FILTROS ================= */}
          <div
            className="mb-4"
            style={{
              background: "#f8f9fb",
              padding: "1rem",
              borderRadius: "12px",
              border: "1px solid #e3e6eb",
            }}
          >
            <div className="row g-3 align-items-end">

              {/* TIPO EXAMEN */}
              <div className="col-md-3">
                <Form.Label className="fw-semibold mb-1">
                  Tipo de examen
                </Form.Label>
                <Form.Control
                  placeholder="Ej: Hemograma"
                  value={filters.examtype}
                  onChange={(e) =>
                    setFilters({ ...filters, examtype: e.target.value })
                  }
                />
              </div>

              {/* PACIENTE */}
              <div className="col-md-3">
                <Form.Label className="fw-semibold mb-1">
                  Paciente
                </Form.Label>
                <Form.Control
                  placeholder="Nombre del paciente"
                  value={filters.patient}
                  onChange={(e) =>
                    setFilters({ ...filters, patient: e.target.value })
                  }
                />
              </div>

              {/* MÉDICO */}
              <div className="col-md-3">
                <Form.Label className="fw-semibold mb-1">
                  Médico
                </Form.Label>
                <Form.Control
                  placeholder="Nombre del médico"
                  value={filters.doctor}
                  onChange={(e) =>
                    setFilters({ ...filters, doctor: e.target.value })
                  }
                />
              </div>

              {/* LIMPIAR */}
              <div className="col-md-3 d-grid">
                <Button
                  variant="outline-secondary"
                  onClick={clearFilters}
                >
                  ↺ Limpiar filtros
                </Button>
              </div>
            </div>
          </div>

          {/* ================= ERROR ================= */}
          {message && (
            <Alert variant="danger" className="py-2">
              ❌ {message}
            </Alert>
          )}

          {/* ================= LOADING ================= */}
          {loading && (
            <div className="text-center text-muted my-4">
              <Spinner animation="border" size="sm" className="me-2" />
              Cargando resultados del laboratorio...
            </div>
          )}

          {/* ================= TABLA ================= */}
          {!loading && (
            <div
              style={{
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #e6e9ee",
              }}
            >
              <Table hover responsive className="mb-0">
                <thead style={{ background: "#f4f6f9" }}>
                  <tr>
                    <th>Paciente</th>
                    <th>Médico</th>
                    <th>Examen</th>
                    <th>Fecha</th>
                    <th className="text-center">Resultado</th>
                  </tr>
                </thead>

                <tbody>
                  {items.length > 0 ? (
                    items.map((i) => {
                      const p = i.exam_orders?.patients;
                      const d = i.exam_orders?.doctors;
                      const result =
                        Array.isArray(i.exam_results) &&
                        i.exam_results.length > 0
                          ? i.exam_results[0]
                          : null;

                      return (
                        <tr key={i.item_id}>
                          <td>
                            {p ? (
                              <div>
                                <strong>
                                  {p.names} {p.lastname}
                                </strong>
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td>
                            {d ? (
                              <span>
                                Dr. {d.nombres} {d.apellidos}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td>
                            {i.exam_type?.name ?? "—"}
                          </td>

                          <td>
                            {result?.uploaded_at
                              ? new Date(
                                  result.uploaded_at
                                ).toLocaleDateString("es-EC")
                              : "—"}
                          </td>

                          <td className="text-center">
                            {result?.file_url ? (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() =>
                                  navigate(
                                    `/laboratorio/item/${i.item_id}`
                                  )
                                }
                              >
                                📄 Ver resultado
                              </Button>
                            ) : (
                              <Badge bg="secondary">
                                Sin archivo
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center text-muted py-4"
                      >
                        No se encontraron exámenes con los filtros aplicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  </div>
);

}
