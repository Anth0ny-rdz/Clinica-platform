import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchPatientByCedula, updatePatient } from '@/services/patientService'
import { fetchEncountersByPatient } from '@/services/encounterService'

export default function DetallePaciente() {
  const { doc_id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<any>(null)
  const [encounters, setEncounters] = useState<any[]>([])
  const [editMode, setEditMode] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // 🔹 Cargar paciente y su historial
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const data = await fetchPatientByCedula(doc_id!)
        setPatient(data)

        const histories = await fetchEncountersByPatient(data.patient_id)
        setEncounters(histories)
      } catch (err: any) {
        console.error('Error cargando datos:', err)
        setMessage(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [doc_id])

  // 🔹 Manejo de cambios de texto/inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPatient((prev: any) => ({ ...prev, [name]: value }))
  }

  // 🔹 Guardar cambios del paciente
  const handleSave = async () => {
    try {
      const updates = {
        personal_history: patient.personal_history || null,
        family_history: patient.family_history || null,
        allergy: patient.allergy || null,
        common_medicines: patient.common_medicines || null,
        blood_type: patient.blood_type || null,
        genre: patient.genre || null,
        parroquia: patient.parroquia || null,
        ciudad: patient.ciudad || null,
        provincia: patient.provincia || null,
      }
      await updatePatient(doc_id!, updates)
      setEditMode(false)
      setMessage('✅ Paciente actualizado correctamente')
    } catch (err: any) {
      setMessage('❌ Error al guardar cambios: ' + err.message)
    }
  }

  if (loading) return <p style={{ padding: '2rem' }}>Cargando datos del paciente...</p>
  if (!patient) return <p style={{ padding: '2rem' }}>{message || 'Paciente no encontrado.'}</p>

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button onClick={() => navigate(-1)}>← Volver</button>
        <button onClick={() => navigate(`/medico/pacientes/${patient.patient_id}/nueva-historia`)}>
          ➕ Nueva Historia Médica
        </button>
      </div>

      <h2>🧍‍♂️ Detalles del Paciente</h2>
      <p><strong>Cédula:</strong> {patient.doc_id}</p>
      <p><strong>Nombre:</strong> {patient.names} {patient.lastname}</p>
      <p><strong>Teléfono:</strong> {patient.telephone || '—'}</p>
      <p><strong>Dirección:</strong> {patient.address || '—'}</p>
      <p><strong>Correo:</strong> {patient.email || '—'}</p>

      <hr style={{ margin: '1rem 0' }} />

      {/* Sección de antecedentes */}
      {editMode ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <textarea name="personal_history" value={patient.personal_history || ''} onChange={handleChange} placeholder="Antecedentes personales" />
          <textarea name="family_history" value={patient.family_history || ''} onChange={handleChange} placeholder="Antecedentes familiares" />
          <textarea name="allergy" value={patient.allergy || ''} onChange={handleChange} placeholder="Alergias" />
          <textarea name="common_medicines" value={patient.common_medicines || ''} onChange={handleChange} placeholder="Medicamentos comunes" />
          <input name="blood_type" value={patient.blood_type || ''} onChange={handleChange} placeholder="Tipo de sangre" />
          <input name="genre" value={patient.genre || ''} onChange={handleChange} placeholder="Género" />
          <input name="provincia" value={patient.provincia || ''} onChange={handleChange} placeholder="Provincia" />
          <input name="ciudad" value={patient.ciudad || ''} onChange={handleChange} placeholder="Ciudad" />
          <input name="parroquia" value={patient.parroquia || ''} onChange={handleChange} placeholder="Parroquia" />
          <button onClick={handleSave}>Guardar</button>
        </div>
      ) : (
        <div>
          <p><strong>Antecedentes personales:</strong> {patient.personal_history || '—'}</p>
          <p><strong>Antecedentes familiares:</strong> {patient.family_history || '—'}</p>
          <p><strong>Alergias:</strong> {patient.allergy || '—'}</p>
          <p><strong>Medicamentos comunes:</strong> {patient.common_medicines || '—'}</p>
          <p><strong>Tipo de sangre:</strong> {patient.blood_type || '—'}</p>
          <p><strong>Género:</strong> {patient.genre || '—'}</p>
          <p><strong>Provincia:</strong> {patient.provincia || '—'}</p>
          <p><strong>Ciudad:</strong> {patient.ciudad || '—'}</p>
          <p><strong>Parroquia:</strong> {patient.parroquia || '—'}</p>
        </div>
      )}

      <button onClick={() => setEditMode(!editMode)} style={{ marginTop: '1rem' }}>
        {editMode ? 'Cancelar' : 'Editar'}
      </button>

      {message && (
        <p style={{ marginTop: '1rem', color: message.startsWith('✅') ? 'green' : 'red' }}>
          {message}
        </p>
      )}

      {/* Historial médico */}
      <hr style={{ margin: '2rem 0' }} />
      <h3>📋 Historial Médico</h3>

      {encounters.length === 0 ? (
        <p style={{ color: '#555' }}>No hay historias médicas registradas.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>Fecha</th>
              <th style={{ padding: '0.5rem' }}>Motivo</th>
              <th style={{ padding: '0.5rem' }}>Médico</th>
              <th style={{ padding: '0.5rem' }}>Presión</th>
              <th style={{ padding: '0.5rem' }}>Pulso</th>
              <th style={{ padding: '0.5rem' }}>Temp</th>
              <th style={{ padding: '0.5rem' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {encounters.map((e) => (
              <tr key={e.encounter_id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{e.date || '—'}</td>
                <td style={{ padding: '0.5rem' }}>{e.reason_for_consultation || '—'}</td>
                <td style={{ padding: '0.5rem' }}>{e.doctor_name || '—'}</td>
                <td style={{ padding: '0.5rem' }}>{e.vitals?.presion_arterial || '—'}</td>
                <td style={{ padding: '0.5rem' }}>{e.vitals?.pulso_xmin || '—'}</td>
                <td style={{ padding: '0.5rem' }}>{e.vitals?.temperatura || '—'}</td>
                <td style={{ padding: '0.5rem' }}>
                  <button
                    onClick={() => navigate(`/medico/pacientes/historia/${e.encounter_id}`)}
                    style={{
                      background: '#007bff',
                      color: 'white',
                      padding: '0.3rem 0.7rem',
                      border: 'none',
                      borderRadius: '4px',
                    }}
                  >
                    🔍 Ver Detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
