import { useEffect, useState } from "react";
import { Card, Table, Form, Button, Alert } from "react-bootstrap";
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

  // Debounce
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
      <h3 className="mb-3">📁 Exámenes Completados</h3>

      {/* FILTROS */}
      <div className="d-flex gap-3 flex-wrap mb-4">

        {/* <Form.Control
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        /> */}

        <Form.Control
          placeholder="Tipo de examen"
          value={filters.examtype}
          onChange={(e) => setFilters({ ...filters, examtype: e.target.value })}
        />

        <Form.Control
          placeholder="Paciente"
          value={filters.patient}
          onChange={(e) => setFilters({ ...filters, patient: e.target.value })}
        />

        <Form.Control
          placeholder="Médico"
          value={filters.doctor}
          onChange={(e) => setFilters({ ...filters, doctor: e.target.value })}
        />

        <Button variant="secondary" onClick={clearFilters}>
          Limpiar
        </Button>
      </div>

      {message && <Alert variant="danger">{message}</Alert>}

      <Table bordered hover>
        <thead>
          <tr>
            <th>Paciente</th>
            <th>Médico</th>
            <th>Examen</th>
            <th>Fecha</th>
            <th>Resultado</th>
          </tr>
        </thead>

        <tbody>
          {items.map((i) => {
            const p = i.exam_orders?.patients;
            const d = i.exam_orders?.doctors;
            const result =
              Array.isArray(i.exam_results) && i.exam_results.length > 0
                ? i.exam_results[0]
                : null;

            return (
              <tr key={i.item_id}>

                <td>{p ? `${p.names} ${p.lastname}` : "—"}</td>

                <td>{d ? `${d.nombres} ${d.apellidos}` : "—"}</td>

                <td>{i.exam_type?.name ?? "—"}</td>

                <td>{result?.uploaded_at ?? "—"}</td>

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
                        } catch (error) {
                          alert("No se pudo obtener el archivo.");
                        }
                      }}
                    >
                      Ver Resultado
                    </Button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Card>
  );
}
