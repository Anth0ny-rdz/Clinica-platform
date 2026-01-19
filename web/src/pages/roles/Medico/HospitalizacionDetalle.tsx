import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Spinner, Button, Modal, Form, Row, Col } from "react-bootstrap";
import { fetchAdmissionById, altaMedica } from "@/services/admissionService";

export default function HospitalizacionDetalle() {
  const { admission_id } = useParams();
  const [admission, setAdmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  // ------- TOAST PROFESIONAL SIN ARCHIVOS -------
  function showToast(message: string, type: "success" | "error" = "success") {
    const toast = document.createElement("div");

    toast.className = `toast align-items-center text-white border-0 show ${
      type === "success" ? "bg-success" : "bg-danger"
    }`;
    toast.role = "alert";
    toast.style.opacity = "0.95";
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;

    document.getElementById("toastArea")!.appendChild(toast);

    setTimeout(() => toast.remove(), 3500);
  }

  const handleAltaMedica = async () => {
    try {
      await altaMedica(Number(admission_id), { motivo_alta: motivoAlta });

      showToast("Alta médica registrada correctamente.", "success");
      setShowModal(false);

      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err) {
      console.error(err);
      showToast("Error al registrar alta.", "error");
    }
  };

  if (loading) return <Spinner />;

  return (
    <>
      <Card className="p-4 shadow-sm">
        <h3 className="mb-4">Detalles de la Hospitalización</h3>

        {/* INFORMACIÓN DEL PACIENTE */}
        <h5 className="text-primary mb-3">📋 Datos del Paciente</h5>
        <Row className="mb-3">
          <Col md={6}>
            <p><strong>Paciente:</strong> {admission.patients.names} {admission.patients.lastname}</p>
          </Col>
          <Col md={6}>
            <p><strong>Documento:</strong> {admission.patients.doc_id}</p>
          </Col>
        </Row>

        <hr />

        {/* INFORMACIÓN DEL INGRESO */}
        <h5 className="text-primary mb-3">🏥 Información del Ingreso</h5>
        <Row className="mb-3">
          <Col md={6}>
            <p><strong>Fecha de ingreso:</strong> {admission.fecha_ingreso}</p>
          </Col>
          <Col md={6}>
            <p><strong>Hora de ingreso:</strong> {admission.hora_ingreso}</p>
          </Col>
          <Col md={6}>
            <p><strong>Tipo de ingreso:</strong> {admission.tipo_ingreso}</p>
          </Col>
          <Col md={6}>
            <p>
              <strong>Estado:</strong>{" "}
              <span className={
                admission.estado_ingreso === "activo" 
                  ? "text-success" 
                  : admission.estado_ingreso === "alta_medica"
                  ? "text-info"
                  : "text-secondary"
              }>
                {admission.estado_ingreso === "activo" 
                  ? "Activo" 
                  : admission.estado_ingreso === "alta_medica"
                  ? "Alta Médica"
                  : admission.estado_ingreso}
              </span>
            </p>
          </Col>
          <Col md={12}>
            <p><strong>Razón de ingreso:</strong> {admission.razon_ingreso}</p>
          </Col>
          <Col md={12}>
            <p><strong>Diagnóstico:</strong> {admission.diagnostico_ingreso}</p>
          </Col>
          <Col md={6}>
            <p><strong>Habitación:</strong> {admission.habitacion_asignada}</p>
          </Col>
        </Row>

        <hr />

        {/* INFORMACIÓN DEL ACOMPAÑANTE */}
        <h5 className="text-primary mb-3">👥 Datos del Acompañante</h5>
        <Row className="mb-3">
          <Col md={6}>
            <p><strong>Nombre:</strong> {admission.persona_acompana || "No especificado"}</p>
          </Col>
          <Col md={6}>
            <p><strong>Parentesco:</strong> {admission.parentesco_acompana || "No especificado"}</p>
          </Col>
          <Col md={6}>
            <p><strong>Teléfono:</strong> {admission.telefono_acompana || "No especificado"}</p>
          </Col>
        </Row>

        <hr />

        {/* BOTÓN DE ALTA */}
        {admission.estado_ingreso === "activo" ? (
          <Button variant="success" onClick={() => setShowModal(true)}>
            Dar Alta Médica
          </Button>
        ) : (
          <>
            <p className="text-success mb-3"><strong>✓ Este paciente ya fue dado de alta.</strong></p>
            {admission.fecha_alta && (
              <Row>
                <Col md={6}>
                  <p><strong>Fecha de alta:</strong> {admission.fecha_alta}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Hora de alta:</strong> {admission.hora_alta}</p>
                </Col>
                {admission.motivo_alta && (
                  <Col md={12}>
                    <p><strong>Motivo de alta:</strong> {admission.motivo_alta}</p>
                  </Col>
                )}
              </Row>
            )}
          </>
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

      {/* CONTENEDOR DEL TOAST */}
      <div
        className="toast-container position-fixed bottom-0 end-0 p-3"
        id="toastArea"
      />
    </>
  );
}