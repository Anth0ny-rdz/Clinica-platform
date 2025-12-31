import { Card, Badge, Alert, ListGroup } from 'react-bootstrap'

type Props = {
  data: any
}

export default function AIApoyoClinicoCards({ data }: Props) {
  if (!data) return null

  return (
    <Card className="shadow p-4 mb-4 border-info">
      <h5 className="text-info mb-2">🧠 Apoyo Clínico con IA</h5>

      <Alert variant="warning" className="small">
        {data.disclaimer || 'Este apoyo es referencial y no reemplaza el criterio médico.'}
      </Alert>

      {/* Nivel de confianza */}
      <p>
        <strong>Confianza:</strong>{' '}
        <Badge bg={
          data.confidence === 'high'
            ? 'success'
            : data.confidence === 'medium'
            ? 'warning'
            : 'secondary'
        }>
          {data.confidence}
        </Badge>
      </p>

      {/* Diagnósticos */}
      {data.diagnostic_hypotheses?.length > 0 && (
        <>
          <h6>🩺 Posibles diagnósticos</h6>
          <ListGroup className="mb-3">
            {data.diagnostic_hypotheses.map((d: string, i: number) => (
              <ListGroup.Item key={i}>{d}</ListGroup.Item>
            ))}
          </ListGroup>
        </>
      )}

      {/* Exámenes */}
      {data.recommended_tests?.length > 0 && (
        <>
          <h6>🧪 Exámenes recomendados</h6>
          <ListGroup className="mb-3">
            {data.recommended_tests.map((t: string, i: number) => (
              <ListGroup.Item key={i}>{t}</ListGroup.Item>
            ))}
          </ListGroup>
        </>
      )}

      {/* Tratamiento */}
      {data.treatment_suggestions?.length > 0 && (
        <>
          <h6>💊 Sugerencias de manejo</h6>
          <ListGroup className="mb-3">
            {data.treatment_suggestions.map((t: string, i: number) => (
              <ListGroup.Item key={i}>{t}</ListGroup.Item>
            ))}
          </ListGroup>
        </>
      )}

      {/* Alertas */}
      {data.red_flags?.length > 0 && (
        <>
          <h6 className="text-danger">🚨 Signos de alarma</h6>
          <ListGroup variant="flush">
            {data.red_flags.map((r: string, i: number) => (
              <ListGroup.Item key={i} className="text-danger">
                {r}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </>
      )}

      {/* Razonamiento */}
      {data.rationale_brief && (
        <>
          <hr />
          <p className="small text-muted">
            <strong>Justificación:</strong> {data.rationale_brief}
          </p>
        </>
      )}
    </Card>
  )
}
