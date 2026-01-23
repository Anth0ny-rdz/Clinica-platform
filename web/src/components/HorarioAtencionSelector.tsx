import { useState } from 'react'

interface HorarioAtencionSelectorProps {
  onHorarioChange: (horario: Record<string, { activo: boolean; inicio: string; fin: string }>) => void
}

export default function HorarioAtencionSelector({ onHorarioChange }: HorarioAtencionSelectorProps) {
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const [horarios, setHorarios] = useState<Record<string, { activo: boolean; inicio: string; fin: string }>>(
    Object.fromEntries(diasSemana.map(dia => [dia, { activo: false, inicio: '08:00', fin: '16:00' }]))
  )

  const toggleDia = (dia: string) => {
    const nuevo = { ...horarios, [dia]: { ...horarios[dia], activo: !horarios[dia].activo } }
    setHorarios(nuevo)
    onHorarioChange(nuevo)
  }

  const cambiarHora = (dia: string, campo: 'inicio' | 'fin', valor: string) => {
    const nuevo = { ...horarios, [dia]: { ...horarios[dia], [campo]: valor } }
    setHorarios(nuevo)
    onHorarioChange(nuevo)
  }

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: '1rem' }}>
      <h4 style={{ marginBottom: '0.5rem' }}>🕓 Horario de atención</h4>
      {diasSemana.map((dia) => (
        <div
          key={dia}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '0.5rem',
            gap: '0.5rem'
          }}
        >
          <input type="checkbox" checked={horarios[dia].activo} onChange={() => toggleDia(dia)} />
          <label style={{ width: 90 }}>{dia}</label>
          <input
            type="time"
            value={horarios[dia].inicio}
            onChange={(e) => cambiarHora(dia, 'inicio', e.target.value)}
            disabled={!horarios[dia].activo}
          />
          <span>–</span>
          <input
            type="time"
            value={horarios[dia].fin}
            onChange={(e) => cambiarHora(dia, 'fin', e.target.value)}
            disabled={!horarios[dia].activo}
          />
        </div>
      ))}
    </div>
  )
}
