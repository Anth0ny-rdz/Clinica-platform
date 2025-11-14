import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Spinner, Button, Modal, Form } from "react-bootstrap";
import { fetchAdmissionById, altaMedica } from "@/services/admissionService";

export default function HospitalizacionDetalle() {
  const { admission_id } = useParams();
  const [admission, setAdmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // MODAL estado
  const [showModal, setShowModal] = useState(false);
  const [motivoAlta, setMotivoAlta] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchAdmissionById(Number(admission_id));
      setAdmission(data);
    } catch (err) {
      console.error("❌ Error obteniendo admisión:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAltaMedica = async () => {
    try {
      await altaMedica(Number(admission_id), { motivo_alta: motivoAlta });
      alert("Alta médica registrada correctamente.");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error al registrar alta.");
    }
  };

  if (loading) return <Spinner />;

  return (
    <Card className="p-4 shadow-sm">
      <h3>Detalles de la Hospitalización</h3>

      <p><strong>Paciente:</strong> {admission.patients.names} {admission.patients.lastname}</p>
      <p><strong>Documento:</strong> {admission.patients.doc_id}</p>
      <p><strong>Razón ingreso:</strong> {admission.razon_ingreso}</p>
      <p><strong>Diagnóstico:</strong> {admission.diagnostico_ingreso}</p>
      <p><strong>Habitación:</strong> {admission.habitacion_asignada}</p>
      <p><strong>Estado:</strong> {admission.estado_ingreso}</p>

      <hr />

      {admission.estado_ingreso === "activo" ? (
        <Button variant="success" onClick={() => setShowModal(true)}>
          Dar Alta Médica
        </Button>
      ) : (
        <p className="text-success"><strong>Este paciente ya fue dado de alta.</strong></p>
      )}

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Dar Alta Médica</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group>
            <Form.Label>Motivo de Alta</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3}
              value={motivoAlta}
              onChange={(e) => setMotivoAlta(e.target.value)}
              required 
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleAltaMedica}>
            Confirmar Alta
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}
