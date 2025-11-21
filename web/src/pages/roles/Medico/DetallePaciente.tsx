import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Spinner, Button, Table, Alert } from "react-bootstrap"

import { fetchPatientByCedula, updatePatient, fetchHospitalizationsByPatient } from '@/services/patientService'
import { fetchEncountersByPatient } from '@/services/encounterService'

export default function DetallePaciente() {
  const { doc_id } = useParams()
  const navigate = useNavigate()

  const [patient, setPatient] = useState<any>(null)
  const [encounters, setEncounters] = useState<any[]>([])
  const [hospitalizations, setHospitalizations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)

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
      setMessage("✅ Paciente actualizado correctamente")
    } catch (err: any) {
      setMessage("❌ Error al guardar cambios: " + err.message)
    }
  }

  if (loading) return <Spinner className="m-4" />

  if (!patient) return <Alert variant="danger">{message || "Paciente no encontrado"}</Alert>

  return (
    <div className="container mt-4">

      <Button variant="link" onClick={() => navigate(-1)}>
    ← Volver
      </Button>

      <Button 
        variant="success"
        onClick={() => navigate(`/medico/pacientes/${patient.patient_id}/nueva-historia`)}
      >
        ➕ Nueva Historia Clínica
      </Button>

      <Card className="shadow p-4 mb-4">
        <h3>🧍 Datos del Paciente</h3>

        <p><strong>Cédula:</strong> {patient.doc_id}</p>
        <p><strong>Nombre:</strong> {patient.names} {patient.lastname}</p>
        <p><strong>Teléfono:</strong> {patient.telephone || "—"}</p>
        <p><strong>Dirección:</strong> {patient.address || "—"}</p>
        <p><strong>Email:</strong> {patient.email || "—"}</p>

        <hr />

        <h4>📌 Antecedentes</h4>

        {editMode ? (
          <div className="d-flex flex-column gap-2">
            <textarea name="personal_history" value={patient.personal_history || ""} onChange={handleChange} className="form-control" placeholder="Antecedentes personales" />
            <textarea name="family_history" value={patient.family_history || ""} onChange={handleChange} className="form-control" placeholder="Antecedentes familiares" />
            <textarea name="allergy" value={patient.allergy || ""} onChange={handleChange} className="form-control" placeholder="Alergias" />
            <textarea name="common_medicines" value={patient.common_medicines || ""} onChange={handleChange} className="form-control" placeholder="Medicamentos comunes" />

            <Button onClick={handleSave} variant="success">Guardar cambios</Button>
          </div>
        ) : (
          <>
            <p><strong>Antecedentes personales:</strong> {patient.personal_history || "—"}</p>
            <p><strong>Antecedentes familiares:</strong> {patient.family_history || "—"}</p>
            <p><strong>Alergias:</strong> {patient.allergy || "—"}</p>
            <p><strong>Medicamentos comunes:</strong> {patient.common_medicines || "—"}</p>

            <Button variant="primary" onClick={() => setEditMode(true)}>
              Editar información
            </Button>
          </>
        )}

        {message && (
          <Alert className="mt-3" variant={message.startsWith("✅") ? "success" : "danger"}>
            {message}
          </Alert>
        )}
      </Card>

      {/* HISTORIAL DE HOSPITALIZACIONES */}
      <Card className="shadow p-4 mb-4">
        <h3>🏥 Historial de Hospitalizaciones</h3>

        {hospitalizations.length === 0 ? (
          <p className="text-muted">No existen hospitalizaciones registradas.</p>
        ) : (
          <Table bordered hover className="mt-3">
            <thead>
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
                  <td>{h.estado_ingreso}</td>
                  <td>{h.fecha_alta ? `${h.fecha_alta} ${h.hora_alta}` : "—"}</td>
                  <td>
                    <Button 
                      size="sm"
                      variant="info"
                      onClick={() => navigate(`/medico/hospitalizaciondetalle/${h.admission_id}`)}
                    >
                      Ver Detalle
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* HISTORIAL MÉDICO */}
      <Card className="shadow p-4 mb-5">
        <h3>📋 Historias Clínicas</h3>

        {encounters.length === 0 ? (
          <p className="text-muted">No hay historias clínicas registradas.</p>
        ) : (
          <Table bordered hover className="mt-3">
            <thead>
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
                      onClick={() => navigate(`/medico/pacientes/historia/${e.encounter_id}`)}
                    >
                      Ver Detalle
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
