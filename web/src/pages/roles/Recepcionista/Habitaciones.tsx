import { useEffect, useState } from "react"
import { fetchAllRooms, updateRoomState } from "@/services/roomService"
import { Table, Button, Badge, Spinner } from "react-bootstrap"

type Room = {
  room_id: number
  tipo: string
  number: string
  state: string
  present_state: string
  tipo_text: string
}

export default function Habitaciones() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)

  useEffect(() => {
    loadRooms()
  }, [])

  async function loadRooms() {
    setLoading(true)
    try {
      const data = await fetchAllRooms()
      setRooms(data)
    } catch (err) {
      console.error("❌ Error al cargar habitaciones:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(room: Room, newState: string, newPresent: string) {
    setUpdating(room.room_id)
    try {
      await updateRoomState(room.room_id, { state: newState, present_state: newPresent })
      await loadRooms()
    } catch (err) {
      console.error("❌ Error al actualizar estado:", err)
    } finally {
      setUpdating(null)
    }
  }

  const getBadgeColor = (state: string) => {
    switch (state) {
      case "Disponible": return "success"
      case "Ocupada": return "danger"
      case "Limpieza": return "warning"
      case "Mantenimiento": return "secondary"
      default: return "info"
    }
  }

  return (
    <div>
      <h2 className="fw-bold mb-4">🏨 Gestión de Habitaciones</h2>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-3">Cargando habitaciones...</p>
        </div>
      ) : (
        <Table bordered hover responsive className="align-middle shadow-sm">
          <thead className="table-primary">
            <tr>
              <th>#</th>
              <th>Tipo</th>
              <th>Número</th>
              <th>Estado</th>
              <th>Subestado</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.room_id}>
                <td>{room.room_id}</td>
                <td>{room.tipo}</td>
                <td>{room.number}</td>
                <td>
                  <Badge bg={getBadgeColor(room.state)}>{room.state}</Badge>
                </td>
                <td>{room.present_state}</td>
                <td>{room.tipo_text}</td>
                <td className="text-center">
                  {updating === room.room_id ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <>
                      {room.state !== "Ocupada" && (
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="me-2"
                          onClick={() => handleUpdate(room, "Ocupada", "En uso")}
                        >
                          Ocupada
                        </Button>
                      )}
                      {room.state !== "Disponible" && (
                        <Button
                          size="sm"
                          variant="outline-success"
                          className="me-2"
                          onClick={() => handleUpdate(room, "Disponible", "Libre")}
                        >
                          Libre
                        </Button>
                      )}
                      {room.state !== "Limpieza" && (
                        <Button
                          size="sm"
                          variant="outline-warning"
                          onClick={() => handleUpdate(room, "Limpieza", "Limpieza")}
                        >
                          Limpieza
                        </Button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  )
}
