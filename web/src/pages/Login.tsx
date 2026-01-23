import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Spinner, Card, Form, Button, Container, Row, Col, Alert } from "react-bootstrap"
import logoClinica from "@/assets/logo_clinica.png" // ✅ Ajusta la ruta si está en otra carpeta

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const authUser = await signIn(email, password)

      if (!authUser) {
        setError("Credenciales inválidas o usuario sin rol asignado.")
        setLoading(false)
        return
      }

      switch (authUser.rol) {
        case "Administrador":
          navigate("/admin")
          break

        case "Médico":
          navigate("/medico")
          break

        case "Enfermeria":
          navigate("/enfermeria")
          break

        case "Recepcionista / Asistente administrativo":
          navigate("/recepcionista")
          break

        case "Paciente":
          navigate("/paciente")
          break

        case "Laboratorio":
          navigate("/laboratorio")
          break
          
        default:
          setError(`Rol desconocido: ${authUser.rol}`)
      }
    } catch (err: any) {
      console.error("❌ Error al iniciar sesión:", err)
      setError("Credenciales inválidas o usuario sin rol asignado.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container fluid className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <Row className="w-100 justify-content-center">
        <Col xs={10} sm={8} md={6} lg={4}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-5 text-center">
              {/* 🏥 Logo */}
              <div className="mb-4">
                <img
                  src={logoClinica}
                  alt="Logo Clínica Latacunga"
                  className="img-fluid mb-2"
                  style={{ maxWidth: "120px" }}
                />
                <h2 className="fw-bold text-primary mt-3">Clínica Latacunga</h2>
                <p className="text-muted small">Sistema de Gestión Clínica</p>
              </div>

              {/* 🧾 Formulario */}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label className="fw-semibold text-secondary">Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4 text-start">
                  <Form.Label className="fw-semibold text-secondary">Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 fw-semibold shadow-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" /> Ingresando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </Form>

              {/* ⚠️ Mensaje de error */}
              {error && <Alert variant="danger" className="mt-3 py-2">{error}</Alert>}

              {/* 📆 Footer */}
              <p className="text-muted small mt-4 mb-0">
                © {new Date().getFullYear()} Clínica Latacunga — Todos los derechos reservados.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
