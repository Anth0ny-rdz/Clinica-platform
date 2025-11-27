import { useEffect, useState, useRef } from "react";
import { Card, Table, Spinner, Alert, Button, Form } from "react-bootstrap";
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

  useEffect(() => {
    loadData();
  }, []);

  // 🔥 Auto-filtrado con debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      applyFilters();
    }, 400); // ⏳ espera 400ms sin escribir

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

  if (loading) return <Spinner className="m-4" />;

  return (
    <Card className="shadow p-4">
      <h3>🧪 Exámenes Pendientes</h3>

      {message && <Alert variant="danger">{message}</Alert>}

      {/* 🔍 FILTROS AVANZADOS */}
      <div className="d-flex gap-3 flex-wrap mb-4 mt-3">

        <Form.Control
          placeholder="Tipo de examen"
          value={filters.examtype}
          onChange={(e) =>
            setFilters({ ...filters, examtype: e.target.value })
          }
        />

        <Form.Control
          placeholder="Paciente"
          value={filters.patient}
          onChange={(e) =>
            setFilters({ ...filters, patient: e.target.value })
          }
        />

        <Form.Control
          placeholder="Médico"
          value={filters.doctor}
          onChange={(e) =>
            setFilters({ ...filters, doctor: e.target.value })
          }
        />

        {/* Botón limpiar */}
        {(filters.examtype || filters.patient || filters.doctor) && (
          <Button variant="secondary" type="button" onClick={clearFilters}>
            Limpiar
          </Button>
        )}
      </div>

      {/* Indicador de búsqueda */}
      {searching && (
        <div className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>
          Buscando resultados…
        </div>
      )}

      {/* TABLA */}
      <Table bordered hover className="mt-2">
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
          {i.exam_orders?.patients?.names ?? "—"}{" "}
          {i.exam_orders?.patients?.lastname ?? ""}
        </strong>
        <br />
        <small>Cédula: {i.exam_orders?.patients?.doc_id ?? "—"}</small>
      </td>

      {/* EXAMEN */}
      <td>{i.exam_type?.name ?? "Sin tipo"}</td>

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
