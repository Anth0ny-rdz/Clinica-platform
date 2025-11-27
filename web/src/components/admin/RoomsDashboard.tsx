import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import "./RoomsDashboard.css";

interface Room {
  room_id: number;
  number: string;
  tipo?: string;
  tipo_text?: string;
  state: string;
  ocupada?: boolean;
}

interface RoomStats {
  total: number;
  ocupadas: number;
  disponibles: number;
  porcentajeOcupacion: number;
}

export default function RoomsDashboard() {
  const [roomStats, setRoomStats] = useState<RoomStats>({
    total: 0,
    ocupadas: 0,
    disponibles: 0,
    porcentajeOcupacion: 0,
  });

  const [habitaciones, setHabitaciones] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchRoomData();
  }, []);

  const fetchRoomData = async () => {
    try {
      const { data: rooms, error: roomsError } = await supabase
        .from("rooms")
        .select("*");

      if (roomsError) throw roomsError;

      const { data: admissions, error: admissionsError } = await supabase
        .from("admissions")
        .select("habitacion_asignada")
        .eq("estado_ingreso", "activo");

      if (admissionsError) throw admissionsError;

      const habitacionesOcupadas = admissions?.map(
        (a) => a.habitacion_asignada
      ) || [];

      const roomsConEstado =
        rooms?.map((r: Room) => ({
          ...r,
          ocupada: habitacionesOcupadas.includes(r.room_id),
        })) || [];

      const total = roomsConEstado.length;
      const ocupadas = roomsConEstado.filter((r) => r.ocupada).length;
      const disponibles = total - ocupadas;

      setRoomStats({
        total,
        ocupadas,
        disponibles,
        porcentajeOcupacion: total
          ? Math.round((ocupadas / total) * 100)
          : 0,
      });

      setHabitaciones(roomsConEstado);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="loading">Cargando estado de habitaciones...</div>;

  return (
    <div className="rooms-dashboard">
      <h1>ESTADO DE HABITACIONES</h1>

      <div className="summary-cards">
        <div className="summary-card total">
          <div className="card-icon">🏥</div>
          <div className="card-content">
            <h3>Total Habitaciones</h3>
            <div className="card-number">{roomStats.total}</div>
          </div>
        </div>

        <div className="summary-card available">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <h3>Disponibles</h3>
            <div className="card-number">{roomStats.disponibles}</div>
          </div>
        </div>

        <div className="summary-card occupied">
          <div className="card-icon">🛌</div>
          <div className="card-content">
            <h3>Ocupadas</h3>
            <div className="card-number">{roomStats.ocupadas}</div>
          </div>
        </div>

        <div className="summary-card occupancy">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Ocupación</h3>
            <div className="card-number">
              {roomStats.porcentajeOcupacion}%
            </div>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <div className="dona-chart">
          <div className="chart-container">
            <div
              className="chart-circle"
              style={{
                background: `conic-gradient(
                  #ff6b6b 0% ${roomStats.porcentajeOcupacion}%,
                  #51cf66 ${roomStats.porcentajeOcupacion}% 100%
                )`,
              }}
            >
              <div className="chart-inner">
                <span className="chart-percent">
                  {roomStats.porcentajeOcupacion}%
                </span>
                <span className="chart-label">Ocupadas</span>
              </div>
            </div>
          </div>

          <div className="chart-legend">
            <div className="legend-item">
              <span>🛌 Ocupadas: {roomStats.ocupadas}</span>
            </div>
            <div className="legend-item">
              <span>✅ Disponibles: {roomStats.disponibles}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rooms-grid-section">
        <h2>Estado Detallado de Habitaciones</h2>

        <div className="rooms-grid">
          {habitaciones.map((room) => (
            <div
              key={room.room_id}
              className={`room-card ${
                room.ocupada ? "occupied" : "available"
              }`}
            >
              <div className="room-header">
                <span className="room-number">
                  Habitación {room.number}
                </span>
                <span className="room-status">
                  {room.ocupada ? "🛌 Ocupada" : "✅ Disponible"}
                </span>
              </div>

              <div className="room-type">
                {room.tipo || room.tipo_text || "—"}
              </div>

              <div className="room-state">{room.state}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
