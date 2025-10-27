import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchPatientByCedula, updatePatient } from '@/services/patientService'

export default function DetallePaciente() {
  const { doc_id } = useParams()
  const [patient, setPatient] = useState<any>(null)
  const [editMode, setEditMode] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const data = await fetchPatientByCedula(doc_id!)
        setPatient(data)
      } catch (err: any) {
        setMessage(err.message)
      }
    }
    loadPatient()
  }, [doc_id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPatient((prev: any) => ({ ...prev, [name]: value }))
  }

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

  if (!patient) return <p style={{ padding: '2rem' }}>{message || 'Cargando datos del paciente...'}</p>

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto' }}>
      <h2>🩺 Detalles del Paciente</h2>
      <p><strong>Cédula:</strong> {patient.doc_id}</p>
      <p><strong>Nombre:</strong> {patient.names} {patient.lastname}</p>
      <p><strong>Teléfono:</strong> {patient.telephone || '—'}</p>
      <p><strong>Dirección:</strong> {patient.address || '—'}</p>
      <p><strong>Correo:</strong> {patient.email || '—'}</p>

      <hr style={{ margin: '1rem 0' }} />

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

      {message && <p style={{ marginTop: '1rem', color: message.startsWith('✅') ? 'green' : 'red' }}>{message}</p>}
    </div>
  )
}
