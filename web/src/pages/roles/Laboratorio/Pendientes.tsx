import { useEffect, useState, useRef } from "react";
import { Card, Table, Spinner, Alert, Button, Form, Badge } from "react-bootstrap";
import { fetchExamPendientesFiltrado } from "@/services/labService";
import { useNavigate } from "react-router-dom";

export default function Pendientes() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    examtype: "",
    patient: "",
    doctor: "",
  });

  const navigate = useNavigate();
  const debounceRef = useRef<any>(null);

  /* =========================
     CARGA INICIAL (ORIGINAL)
  ========================= */
  useEffect(() => {
    loadData();
  }, []);

  /* =========================
     AUTO-FILTRADO (ORIGINAL)
  ========================= */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      applyFilters();
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [filters]);

  async function applyFilters() {
    try {
      setSearching(true);
      setMessage(null);

      const cleanFilters: any = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v) cleanFilters[k] = v;
      });

      const data = await fetchExamPendientesFiltrado(cleanFilters);
      setItems(data);

    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSearching(false);
    }
  }

  async function loadData() {
    try {
      setLoading(true);
      const data = await fetchExamPendientesFiltrado();
      setItems(data);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setFilters({
      examtype: "",
      patient: "",
      doctor: "",
    });
  }

  if (loading) {
    return (
      <div className="text-center my-5 text-muted">
        <Spinner animation="border" className="me-2" />
        Cargando exámenes pendientes...
      </div>
    );
  }

  return (
  <div
    className="container-fluid py-4"
    style={{
      background: "#f2f4f7",
      minHeight: "100vh",
    }}
  >
    <div className="mx-auto" style={{ maxWidth: 1200 }}>
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
              🧪 Exámenes Pendientes
            </h3>
            <p className="text-muted mb-0">
              Exámenes en espera de procesamiento por el laboratorio clínico
            </p>
          </div>

          {/* ================= ERROR ================= */}
          {message && (
            <Alert variant="danger" className="py-2">
              ❌ {message}
            </Alert>
          )}

          {/* ================= FILTROS ================= */}
          <div
            className="mb-3"
            style={{
              background: "#f8f9fb",
              padding: "1rem",
              borderRadius: "12px",
              border: "1px solid #e3e6eb",
            }}
          >
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <Form.Label className="fw-semibold mb-1">
                  Tipo de examen
                </Form.Label>
                <Form.Control
                  placeholder="Ej: Glucosa"
                  value={filters.examtype}
                  onChange={(e) =>
                    setFilters({ ...filters, examtype: e.target.value })
                  }
                />
              </div>

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

              <div className="col-md-3 d-grid">
                {(filters.examtype || filters.patient || filters.doctor) && (
                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={clearFilters}
                  >
                    ↺ Limpiar filtros
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* ================= BUSCANDO ================= */}
          {searching && (
            <div className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
              <Spinner animation="border" size="sm" className="me-2" />
              Buscando resultados…
            </div>
          )}

          {/* ================= TABLA ================= */}
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
                  <th>Examen</th>
                  <th>Médico</th>
                  <th>Observaciones</th>
                  <th>Orden</th>
                  <th className="text-center">Acción</th>
                </tr>
              </thead>

              <tbody>
                {items.length > 0 ? (
                  items.map((i) => (
                    <tr key={i.item_id}>
                      {/* PACIENTE */}
                      <td>
                        <strong>
                          {i.exam_orders?.patients?.names ?? "—"}{" "}
                          {i.exam_orders?.patients?.lastname ?? ""}
                        </strong>
                        <br />
                        <small className="text-muted">
                          Cédula:{" "}
                          {i.exam_orders?.patients?.doc_id ?? "—"}
                        </small>
                      </td>

                      {/* EXAMEN */}
                      <td>
                        <div>{i.exam_type?.name ?? "Sin tipo"}</div>
                        <Badge bg="warning" className="mt-1">
                          Pendiente
                        </Badge>
                      </td>

                      {/* MÉDICO */}
                      <td>
                        Dr.{" "}
                        {i.exam_orders?.doctors?.nombres ?? "—"}{" "}
                        {i.exam_orders?.doctors?.apellidos ?? ""}
                      </td>

                      {/* OBSERVACIONES */}
                      <td>
                        {i.exam_orders?.observations ?? "—"}
                      </td>

                      {/* ORDEN */}
                      <td>
                        #{i.exam_orders?.order_id ?? "—"}
                      </td>

                      {/* ACCIÓN */}
                      <td className="text-center">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            navigate(
                              `/laboratorio/item/${i.item_id}`
                            )
                          }
                        >
                          🧪 Procesar
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center text-muted py-4"
                    >
                      No existen exámenes pendientes con los filtros
                      aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  </div>
);

}
