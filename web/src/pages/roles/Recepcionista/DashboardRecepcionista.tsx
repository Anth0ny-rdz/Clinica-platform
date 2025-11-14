import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, Button, Container, Row, Col, Spinner, Alert } from "react-bootstrap"
import { CalendarDays, BedDouble, Users } from "lucide-react"
import { fetchPatientsCountToday, fetchAppointmentsCountToday } from "@/services/dashboardService"
import logoClinica from "@/assets/logo_clinica.png"

export default function DashboardRecepcionista() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resumen, setResumen] = useState({
    pacientesHoy: 0,
    citasHoy: 0,
    habitacionesDisponibles: 0, // futuro
  })

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const [patientsData, appointmentsData] = await Promise.all([
          fetchPatientsCountToday(),
          fetchAppointmentsCountToday(),
        ])

        setResumen({
          pacientesHoy: patientsData.count || 0,
          citasHoy: appointmentsData.count || 0,
          habitacionesDisponibles: 0, // temporal
        })
      } catch (err: any) {
        console.error("Error cargando dashboard:", err)
        setError("⚠️ No se pudieron cargar los datos del servidor.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <Container className="py-4">
        <div className="textAlign mb-4">
            <img
                src={logoClinica}
                alt="Logo Clínica Latacunga"
                className="img-fluid"
                style={{ maxWidth: "180px" }}
            />
        </div>
      <h1 className="fw-bold mb-2">👋 Bienvenido(a), Recepcionista</h1>
      <p className="text-muted mb-4">Resumen general del día en la Clínica Latacunga</p>

      {/* 🔄 Estado de carga */}
      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" />
          <p className="mt-3">Cargando datos...</p>
        </div>
      )}

      {/* ⚠️ Error */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* ✅ Contenido principal */}
      {!loading && !error && (
        <>
          <Row className="g-4 mb-5">
            <Col md={4}>
              <Card className="border-primary shadow-sm">
                <Card.Body>
                  <Card.Title className="fw-semibold text-primary">
                    Pacientes registrados hoy
                  </Card.Title>
                  <h2 className="fw-bold text-primary">{resumen.pacientesHoy}</h2>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="border-success shadow-sm">
                <Card.Body>
                  <Card.Title className="fw-semibold text-success">
                    Citas agendadas hoy
                  </Card.Title>
                  <h2 className="fw-bold text-success">{resumen.citasHoy}</h2>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="border-info shadow-sm">
                <Card.Body>
                  <Card.Title className="fw-semibold text-info">
                    Habitaciones disponibles
                  </Card.Title>
                  <h2 className="fw-bold text-info">{resumen.habitacionesDisponibles ?? "—"}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* 🚀 Accesos rápidos */}
          <h2 className="fw-semibold mb-4">Accesos rápidos</h2>
          <Row className="g-4">
            <Col md={4}>
              <Button
                variant="primary"
                className="w-100 py-4 d-flex flex-column align-items-center shadow-sm"
                onClick={() => navigate("/recepcionista/usuarios")}
              >
                <Users size={36} className="mb-2" />
                Gestionar Usuarios
              </Button>
            </Col>

            <Col md={4}>
              <Button
                variant="success"
                className="w-100 py-4 d-flex flex-column align-items-center shadow-sm"
                onClick={() => navigate("/recepcionista/citas")}
              >
                <CalendarDays size={36} className="mb-2" />
                Ver Citas
              </Button>
            </Col>

            <Col md={4}>
              <Button
                variant="info"
                className="w-100 py-4 d-flex flex-column align-items-center shadow-sm text-white"
                onClick={() => navigate("/recepcionista/habitaciones")}
              >
                <BedDouble size={36} className="mb-2" />
                Habitaciones
              </Button>
            </Col>
          </Row>
        </>
      )}
    </Container>
  )
}
