import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Table, Alert, Badge } from "react-bootstrap"

import Skeleton from '@/components/skeleton'
import {
  fetchPatientByCedula,
  updatePatient,
  fetchHospitalizationsByPatient
} from '@/services/patientService'
import { fetchEncountersByPatient } from '@/services/encounterService'

export default function DetallePaciente() {
  const { doc_id } = useParams()
  const navigate = useNavigate()

  const [patient, setPatient] = useState<any>(null)
  const [encounters, setEncounters] = useState<any[]>([])
  const [hospitalizations, setHospitalizations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)

  /* =========================
     CARGA DE DATOS
  ========================= */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        const data = await fetchPatientByCedula(doc_id!)
        setPatient(data)

        const histories = await fetchEncountersByPatient(data.patient_id)
        setEncounters(histories)

        const admissions = await fetchHospitalizationsByPatient(data.patient_id)
        setHospitalizations(admissions)

      } catch (err: any) {
        console.error('Error cargando datos:', err)
        setMessage(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [doc_id])

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setPatient((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      await updatePatient(doc_id!, patient)
      setEditMode(false)
      setMessage("Paciente actualizado correctamente")
    } catch (err: any) {
      setMessage("Error al guardar cambios: " + err.message)
    }
  }

  /* =========================
     SKELETON STATE
  ========================= */
  if (loading) {
    return (
      <div className="container mt-4" style={{ maxWidth: 1100 }}>
        {/* HEADER */}
        <div className="d-flex justify-content-between mb-3">
          <Skeleton height={24} width="120px" />
          <Skeleton height={36} width="220px" />
        </div>

        {/* DATOS PACIENTE */}
        <Card className="shadow p-4 mb-4">
          <Skeleton height={22} width="40%" />

          <div className="row mt-3">
            <div className="col-md-6">
              <Skeleton height={16} className="mb-2" />
              <Skeleton height={16} className="mb-2" />
              <Skeleton height={16} className="mb-2" />
            </div>
            <div className="col-md-6">
              <Skeleton height={16} className="mb-2" />
              <Skeleton height={16} className="mb-2" />
              <Skeleton height={16} className="mb-2" />
            </div>
          </div>
        </Card>

        {/* HOSPITALIZACIONES */}
        <Card className="shadow p-4 mb-4">
          <Skeleton height={22} width="50%" />
          {[1, 2].map((_, i) => (
            <Skeleton key={i} height={18} className="mt-3" />
          ))}
        </Card>

        {/* HISTORIAS */}
        <Card className="shadow p-4">
          <Skeleton height={22} width="45%" />
          {[1, 2, 3].map((_, i) => (
            <Skeleton key={i} height={18} className="mt-3" />
          ))}
        </Card>
      </div>
    )
  }

  if (!patient) {
    return <Alert variant="danger">{message || "Paciente no encontrado"}</Alert>
  }

  /* =========================
     RENDER REAL
  ========================= */
  return (
    <div className="container mt-4" style={{ maxWidth: "1100px" }}>
      {/* ================= HEADER ================= */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="link" onClick={() => navigate(-1)}>
          ← Volver
        </Button>

        <Button
          variant="success"
          onClick={() =>
            navigate(`/medico/pacientes/${patient.patient_id}/nueva-historia`)
          }
        >
          Nueva Historia Clínica
        </Button>
      </div>

      {/* ================= DATOS PACIENTE ================= */}
      <Card className="shadow p-4 mb-4">
        <h3 className="mb-3">Datos del Paciente</h3>

        <div className="row">
          <div className="col-md-6">
            <p><strong>Cédula:</strong> {patient.doc_id}</p>
            <p><strong>Nombre:</strong> {patient.names} {patient.lastname}</p>
            <p><strong>Teléfono:</strong> {patient.telephone || "—"}</p>
          </div>
          <div className="col-md-6">
            <p><strong>Dirección:</strong> {patient.address || "—"}</p>
            <p><strong>Email:</strong> {patient.email || "—"}</p>
            <p><strong>Género:</strong> {patient.genre || "—"}</p>
          </div>
        </div>

        <hr />

        {/* ================= ANTECEDENTES ================= */}
        <h4 className="mb-3">Antecedentes</h4>

        {editMode ? (
          <div className="d-flex flex-column gap-2">
            {[
              { name: "personal_history", label: "Antecedentes personales" },
              { name: "family_history", label: "Antecedentes familiares" },
              { name: "allergy", label: "Alergias" },
              { name: "common_medicines", label: "Medicamentos comunes" }
            ].map(f => (
              <textarea
                key={f.name}
                name={f.name}
                value={patient[f.name] || ""}
                onChange={handleChange}
                className="form-control"
                placeholder={f.label}
              />
            ))}

            <select
              name="blood_type"
              value={patient.blood_type || ""}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Tipo de sangre</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bt => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>

            <select
              name="genre"
              value={patient.genre || ""}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Género</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
              <option value="No especifica">No especifica</option>
            </select>

            <div className="d-flex gap-2">
              <Button onClick={handleSave} variant="success">
                Guardar cambios
              </Button>
              <Button variant="outline-secondary" onClick={() => setEditMode(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p><strong>Antecedentes personales:</strong> {patient.personal_history || "—"}</p>
            <p><strong>Antecedentes familiares:</strong> {patient.family_history || "—"}</p>
            <p><strong>Alergias:</strong> {patient.allergy || "—"}</p>
            <p><strong>Medicamentos comunes:</strong> {patient.common_medicines || "—"}</p>
            <p><strong>Tipo de sangre:</strong> {patient.blood_type || "—"}</p>

            <Button variant="primary" onClick={() => setEditMode(true)}>
              Editar información
            </Button>
          </>
        )}

        {message && (
          <Alert
            className="mt-3"
            variant={message.includes("correctamente") ? "success" : "danger"}
          >
            {message}
          </Alert>
        )}
      </Card>

      {/* ================= HOSPITALIZACIONES ================= */}
      <Card className="shadow p-4 mb-4">
        <h3 className="mb-3">Hospitalizaciones</h3>

        {hospitalizations.length === 0 ? (
          <p className="text-muted">No existen hospitalizaciones registradas.</p>
        ) : (
          <Table bordered hover responsive>
            <thead className="table-light">
              <tr>
                <th>Ingreso</th>
                <th>Habitación</th>
                <th>Razón</th>
                <th>Estado</th>
                <th>Alta</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {hospitalizations.map((h) => (
                <tr key={h.admission_id}>
                  <td>{h.fecha_ingreso} {h.hora_ingreso}</td>
                  <td>{h.habitacion_asignada}</td>
                  <td>{h.razon_ingreso}</td>
                  <td>
                    <Badge bg={h.estado_ingreso === "Activo" ? "warning" : "success"}>
                      {h.estado_ingreso}
                    </Badge>
                  </td>
                  <td>{h.fecha_alta ? `${h.fecha_alta} ${h.hora_alta}` : "—"}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-info"
                      onClick={() =>
                        navigate(`/medico/hospitalizaciondetalle/${h.admission_id}`)
                      }
                    >
                      Ver detalle
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* ================= HISTORIAS ================= */}
      <Card className="shadow p-4 mb-5">
        <h3 className="mb-3">Historias Clínicas</h3>

        {encounters.length === 0 ? (
          <p className="text-muted">No hay historias clínicas registradas.</p>
        ) : (
          <Table bordered hover responsive>
            <thead className="table-light">
              <tr>
                <th>Fecha</th>
                <th>Motivo</th>
                <th>Médico</th>
                <th>Presión</th>
                <th>Pulso</th>
                <th>Temp</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {encounters.map((e) => (
                <tr key={e.encounter_id}>
                  <td>{e.date || "—"}</td>
                  <td>{e.reason_for_consultation || "—"}</td>
                  <td>{e.doctor_name || "—"}</td>
                  <td>{e.vital_signs?.presion_arterial || "—"}</td>
                  <td>{e.vital_signs?.pulso_xmin || "—"}</td>
                  <td>{e.vital_signs?.temperatura || "—"}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() =>
                        navigate(`/medico/pacientes/historia/${e.encounter_id}`)
                      }
                    >
                      Ver detalle
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  )
}
