import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Form, Spinner, Alert, Badge } from "react-bootstrap";

import {
  fetchExamContext,
  fetchAllExamTypes,
  fetchExamCategories,
  createExamOrder,
  addExamItems,
} from "@/services/examService";

import { useAuth } from "@/context/AuthContext";

// TIPOS DE DATOS
interface ExamCategory {
  category_id: number;
  name: string;
}

interface ExamType {
  examtype_id: number;
  name: string;
  category_id: number;
}

export default function SolicitarExamen() {
  const { encounter_id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [encounter, setEncounter] = useState<any>(null);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [categories, setCategories] = useState<ExamCategory[]>([]);

  const [selectedExams, setSelectedExams] = useState<number[]>([]);
  const [priority, setPriority] = useState("normal");
  const [observations, setObservations] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const enc = await fetchExamContext(Number(encounter_id));
      setEncounter(enc);

      const tipos = await fetchAllExamTypes();
      setExamTypes(tipos);

      const cats = await fetchExamCategories();
      setCategories(cats);
    } catch (err: any) {
      setMessage(err.message || "Error cargando información");
    } finally {
      setLoading(false);
    }
  }

  function toggleExam(examtype_id: number) {
    setSelectedExams((prev) =>
      prev.includes(examtype_id)
        ? prev.filter((id) => id !== examtype_id)
        : [...prev, examtype_id]
    );
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (selectedExams.length === 0)
      return setMessage("⚠️ Selecciona al menos un tipo de examen.");

    try {
      setSaving(true);

      const order = await createExamOrder({
        encounter_id: Number(encounter_id),
        patient_id: encounter.patient_id,
        doctor_id: encounter.doctor_id,
        priority,
        observations,
      });

      await addExamItems(order.order_id, selectedExams);

      setMessage("✅ Orden creada correctamente. Redirigiendo...");
      setTimeout(() => {
        navigate(`/medico/examenes/orden/${order.order_id}`);
      }, 1200);
    } catch (err: any) {
      setMessage("❌ Error al crear la orden: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  // Loading
  if (loading) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
          minHeight: '100vh',
          padding: 0,
          margin: 0,
        }}
      >
        <div style={{ padding: '2rem 1rem' }}>
          <div className="mx-auto" style={{ maxWidth: 1100 }}>
            <div className="text-center py-5">
              <Spinner 
                animation="border" 
                style={{ 
                  width: '4rem', 
                  height: '4rem',
                  color: '#667eea',
                  borderWidth: '4px',
                }}
              />
              <p className="mt-3" style={{ fontWeight: 600, fontSize: '1.1rem', color: '#6b7280' }}>
                Cargando información...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!encounter) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
          minHeight: '100vh',
          padding: 0,
          margin: 0,
        }}
      >
        <div style={{ padding: '2rem 1rem' }}>
          <Alert 
            variant="danger"
            style={{
              maxWidth: 600,
              margin: '4rem auto',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              color: '#991b1b',
              padding: '1.5rem',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
            <div>Error cargando la historia médica.</div>
          </Alert>
        </div>
      </div>
    )
  }

  // AGRUPAR EXÁMENES POR CATEGORÍA
  const grouped: Array<ExamCategory & { exams: ExamType[] }> = categories.map(
    (cat: ExamCategory) => ({
      ...cat,
      exams: examTypes.filter(
        (t: ExamType) => t.category_id === cat.category_id
      ),
    })
  );

  return (
    <div
      className="solicitar-examen-container"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        minHeight: '100vh',
        padding: 0,
        margin: 0,
      }}
    >
      <div style={{ padding: '2rem 1rem' }}>
        <div className="mx-auto content-wrapper" style={{ maxWidth: 1100 }}>

          {/* BOTÓN VOLVER */}
          <Button
            variant="link"
            className="back-button mb-4 px-0"
            onClick={() => navigate(-1)}
            style={{
              textDecoration: "none",
              fontWeight: 600,
              color: '#667eea',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>←</span>
            Volver
          </Button>

          {/* CARD CONTEXTO */}
          <Card
            className="context-card mb-4"
            style={{
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div 
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                  }}
                >
                  🧪
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: "#2c3e50", fontSize: '1.8rem' }}>
                    Solicitar Exámenes
                  </h3>
                  <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                    Crear nueva orden de exámenes de laboratorio
                  </p>
                </div>
              </div>

              <div 
                className="context-info"
                style={{
                  background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '2px solid #e3e6eb',
                }}
              >
                <div className="row g-3">
                  <div className="col-md-4">
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                      👤 Paciente
                    </div>
                    <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '1rem' }}>
                      {encounter.patient_name}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                      👨‍⚕️ Médico
                    </div>
                    <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '1rem' }}>
                      {encounter.doctor_name}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                      📝 Motivo
                    </div>
                    <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '1rem' }}>
                      {encounter.reason_for_consultation}
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* CARD FORMULARIO */}
          <Card
            className="form-card"
            style={{
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            <Card.Body className="p-4">

              {/* MENSAJE */}
              {message && (
                <Alert 
                  variant={message.startsWith("✅") ? "success" : message.startsWith("⚠️") ? "warning" : "danger"}
                  style={{
                    borderRadius: '12px',
                    border: 'none',
                    background: message.startsWith("✅") 
                      ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                      : message.startsWith("⚠️")
                      ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                      : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                    color: message.startsWith("✅") ? '#065f46' : message.startsWith("⚠️") ? '#92400e' : '#991b1b',
                    fontWeight: 500,
                    padding: '1rem 1.25rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  {message}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                
                {/* PRIORIDAD */}
                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: 700, color: '#374151', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🚨</span>
                    Prioridad de la orden
                  </Form.Label>
                  <Form.Select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{
                      borderRadius: '10px',
                      border: '2px solid #e5e7eb',
                      padding: '12px 16px',
                      fontSize: '1rem',
                      fontWeight: 500,
                    }}
                  >
                    <option value="normal">Normal</option>
                    <option value="urgente">Urgente</option>
                  </Form.Select>
                </Form.Group>

                {/* OBSERVACIONES */}
                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: 700, color: '#374151', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📝</span>
                    Observaciones adicionales
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Escriba observaciones adicionales sobre los exámenes solicitados..."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    style={{
                      borderRadius: '10px',
                      border: '2px solid #e5e7eb',
                      padding: '12px 16px',
                      fontSize: '1rem',
                    }}
                  />
                </Form.Group>

                {/* SECCIONES POR CATEGORÍA */}
                <div className="exams-section">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0" style={{ color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🔬</span>
                      Seleccione los exámenes por categoría
                    </h5>
                    {selectedExams.length > 0 && (
                      <Badge 
                        bg="primary"
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          padding: '8px 16px',
                          borderRadius: '10px',
                        }}
                      >
                        {selectedExams.length} {selectedExams.length === 1 ? 'examen seleccionado' : 'exámenes seleccionados'}
                      </Badge>
                    )}
                  </div>

                  <div
                    className="exams-list"
                    style={{
                      border: '2px solid #e5e7eb',
                      borderRadius: '14px',
                      padding: '1.5rem',
                      maxHeight: 450,
                      overflowY: 'auto',
                      background: '#fafbfc',
                    }}
                  >
                    {grouped.map((cat, catIndex) =>
                      cat.exams.length > 0 ? (
                        <div 
                          key={cat.category_id} 
                          className="category-section mb-4"
                          style={{
                            animation: `slideInUp 0.4s ease-out ${catIndex * 0.1}s backwards`,
                          }}
                        >
                          <div 
                            className="category-header"
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              padding: '10px 16px',
                              borderRadius: '10px',
                              fontWeight: 700,
                              fontSize: '1rem',
                              marginBottom: '1rem',
                              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                            }}
                          >
                            {cat.name}
                          </div>

                          <div
                            className="exams-grid"
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                              gap: '12px',
                              marginLeft: '10px',
                            }}
                          >
                            {cat.exams.map((exam: ExamType) => (
                              <div
                                key={exam.examtype_id}
                                className="exam-checkbox"
                                style={{
                                  background: selectedExams.includes(exam.examtype_id) 
                                    ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' 
                                    : '#ffffff',
                                  border: selectedExams.includes(exam.examtype_id)
                                    ? '2px solid #10b981'
                                    : '2px solid #e5e7eb',
                                  borderRadius: '10px',
                                  padding: '12px 14px',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer',
                                }}
                                onClick={() => toggleExam(exam.examtype_id)}
                              >
                                <Form.Check
                                  type="checkbox"
                                  label={exam.name}
                                  checked={selectedExams.includes(exam.examtype_id)}
                                  onChange={() => toggleExam(exam.examtype_id)}
                                  style={{
                                    fontWeight: selectedExams.includes(exam.examtype_id) ? 600 : 500,
                                    color: selectedExams.includes(exam.examtype_id) ? '#065f46' : '#374151',
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>

                {/* BOTÓN SUBMIT */}
                <div className="d-flex justify-content-end mt-4 pt-3" style={{ borderTop: '2px solid #e5e7eb' }}>
                  <Button
                    type="submit"
                    className="submit-btn"
                    disabled={saving || selectedExams.length === 0}
                    style={{
                      background: saving || selectedExams.length === 0
                        ? '#9ca3af' 
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      padding: '14px 32px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      boxShadow: saving || selectedExams.length === 0 ? 'none' : '0 6px 20px rgba(16, 185, 129, 0.4)',
                      transition: 'all 0.3s ease',
                      minWidth: '200px',
                    }}
                  >
                    {saving ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Guardando...
                      </>
                    ) : (
                      '✓ Crear Orden de Examen'
                    )}
                  </Button>
                </div>
              </Form>

            </Card.Body>
          </Card>

        </div>
      </div>

      {/* ESTILOS */}
      <style>
        {`
          /* === ANIMACIONES === */
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* === CONTAINER === */
          .solicitar-examen-container {
            animation: fadeIn 0.6s ease-out;
          }

          .content-wrapper {
            animation: fadeIn 0.7s ease-out 0.1s backwards;
          }

          /* === BOTÓN VOLVER === */
          .back-button:hover {
            color: #764ba2 !important;
            transform: translateX(-5px);
          }

          /* === CARDS === */
          .context-card {
            animation: slideInUp 0.6s ease-out 0.2s backwards;
          }

          .form-card {
            animation: slideInUp 0.6s ease-out 0.3s backwards;
          }

          /* === EXAMS LIST === */
          .exams-list::-webkit-scrollbar {
            width: 8px;
          }

          .exams-list::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 10px;
          }

          .exams-list::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
          }

          .exams-list::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }

          /* === EXAM CHECKBOX === */
          .exam-checkbox:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }

          /* === SUBMIT BUTTON === */
          .submit-btn:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5) !important;
          }

          .submit-btn:active:not(:disabled) {
            transform: translateY(-1px);
          }

          .submit-btn:disabled {
            cursor: not-allowed;
            opacity: 0.6;
          }

          /* === RESPONSIVE === */
          @media (max-width: 768px) {
            .context-card h3 {
              font-size: 1.4rem !important;
            }

            .exams-grid {
              grid-template-columns: 1fr !important;
            }

            .submit-btn {
              width: 100%;
            }
          }

          /* === ACCESIBILIDAD === */
          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>
    </div>
  );
}