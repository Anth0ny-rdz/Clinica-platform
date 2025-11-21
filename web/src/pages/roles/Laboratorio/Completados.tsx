import { useEffect, useState } from "react";
import { Card, Table, Form, Button, Alert } from "react-bootstrap";
import { fetchCompletedExams, getSignedResultUrl } from "@/services/labService";

export default function Completados() {
  const [items, setItems] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    date: "",
    examtype: "",
    patient: "",
    doctor: "",
  });

  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    try {
      const cleanFilters: any = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v) cleanFilters[k] = v;
      });

      const data = await fetchCompletedExams(cleanFilters);
      setItems(data);
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <Card className="shadow p-4">
      <h3 className="mb-3">📁 Exámenes Completados</h3>

      {/* FILTROS */}
      <div className="d-flex gap-3 flex-wrap mb-4">
        <Form.Control
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />

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

        <Button onClick={load}>Filtrar</Button>
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

            // exam_results ES UN ARRAY → tomamos el primero
            const result =
              Array.isArray(i.exam_results) && i.exam_results.length > 0
                ? i.exam_results[0]
                : null;

            return (
              <tr key={i.item_id}>
                {/* PACIENTE */}
                <td>{p ? `${p.names} ${p.lastname}` : "—"}</td>

                {/* MÉDICO */}
                <td>{d ? `${d.nombres} ${d.apellidos}` : "—"}</td>

                {/* EXAMEN */}
                <td>{i.exam_type?.name ?? "—"}</td>

                {/* FECHA */}
                <td>{result?.uploaded_at ?? "—"}</td>

                {/* RESULTADO */}
                <td>
                  {result?.file_url ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={async () => {
                        try {
                          const itemId = i.item_id;

                          if (!itemId) {
                            console.error("❌ item_id no existe:", i);
                            alert("No se encontró el archivo del examen.");
                            return;
                          }

                          const data = await getSignedResultUrl(itemId);

                          // 🔥 SOPORTE PARA AMBOS FORMATS
                          const url = data?.signed_url || data?.url;

                          if (!url) {
                            console.error("❌ URL firmada no recibida:", data);
                            alert("No se pudo obtener la URL firmada.");
                            return;
                          }

                          // Abrir el archivo
                          window.open(url, "_blank");
                        } catch (error) {
                          console.error("Error obteniendo URL firmada:", error);
                          alert("No se pudo obtener el resultado del examen.");
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
