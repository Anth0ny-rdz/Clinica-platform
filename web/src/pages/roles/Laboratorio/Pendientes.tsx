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
    <Card className="shadow p-4">

      {/* ================= HEADER ================= */}
      <div className="mb-3">
        <h3 className="mb-1">🧪 Exámenes Pendientes</h3>
        <p className="text-muted mb-0">
          Exámenes en espera de procesamiento por laboratorio
        </p>
      </div>

      {message && (
        <Alert variant="danger">
          ❌ {message}
        </Alert>
      )}

      {/* ================= FILTROS ================= */}
      <Card className="p-3 mb-3 bg-light border">
        <div className="row g-2 align-items-end">

          <div className="col-md-3">
            <Form.Label className="fw-semibold">Tipo de examen</Form.Label>
            <Form.Control
              placeholder="Ej: Glucosa"
              value={filters.examtype}
              onChange={(e) =>
                setFilters({ ...filters, examtype: e.target.value })
              }
            />
          </div>

          <div className="col-md-3">
            <Form.Label className="fw-semibold">Paciente</Form.Label>
            <Form.Control
              placeholder="Nombre del paciente"
              value={filters.patient}
              onChange={(e) =>
                setFilters({ ...filters, patient: e.target.value })
              }
            />
          </div>

          <div className="col-md-3">
            <Form.Label className="fw-semibold">Médico</Form.Label>
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
      </Card>

      {/* ================= INDICADOR BÚSQUEDA ================= */}
      {searching && (
        <div className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>
          Buscando resultados…
        </div>
      )}

      {/* ================= TABLA ================= */}
      <Table bordered hover responsive className="mt-2">
        <thead className="table-light">
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
                    Cédula: {i.exam_orders?.patients?.doc_id ?? "—"}
                  </small>
                </td>

                {/* EXAMEN */}
                <td>
                  {i.exam_type?.name ?? "Sin tipo"}
                  <br />
                  <Badge bg="warning" className="mt-1">
                    Pendiente
                  </Badge>
                </td>

                {/* MÉDICO */}
                <td>
                  Dr. {i.exam_orders?.doctors?.nombres ?? "—"}{" "}
                  {i.exam_orders?.doctors?.apellidos ?? ""}
                </td>

                {/* OBSERVACIONES */}
                <td>{i.exam_orders?.observations ?? "—"}</td>

                {/* ORDEN */}
                <td>#{i.exam_orders?.order_id ?? "—"}</td>

                {/* ACCIÓN */}
                <td>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() =>
                      navigate(`/laboratorio/item/${i.item_id}`)
                    }
                  >
                    🧪 Procesar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center text-muted py-3">
                No existen exámenes pendientes con los filtros aplicados.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Card>
  );
}
