import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import "./Dashboard.css";

interface DashboardStats {
  totalPacientes: number;
  citasEstaSemana: number;
}

export default function DashboardMain() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPacientes: 0,
    citasEstaSemana: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Total Pacientes
      const { count: totalPacientes } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true });

      // Rango semana actual
      const startOfWeek = new Date();
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      // Citas esta semana
      const { count: citasEstaSemana } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .gte("date", startOfWeek.toISOString())
        .lte("date", endOfWeek.toISOString());

      setStats({
        totalPacientes: totalPacientes || 0,
        citasEstaSemana: citasEstaSemana || 0,
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const porcentajePacientes = Math.min(
    (stats.totalPacientes / 100) * 100,
    100
  );
  const porcentajeCitas = Math.min(
    (stats.citasEstaSemana / 50) * 100,
    100
  );

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="stats-container">
        
        {/* Tarjeta Pacientes */}
        <div className="stat-card">
          <h3>Total de pacientes</h3>
          <p>Registrados</p>
          <div className="number">{stats.totalPacientes.toLocaleString()}</div>

          <div className="progress-bar">
            <div
              className="progress-fill pacientes"
              style={{ width: `${porcentajePacientes}%` }}
            />
          </div>

          <div className="progress-info">
            <span>0</span>
            <span>Meta: 100</span>
          </div>

          <span>Pacientes</span>
        </div>

        {/* Tarjeta Citas */}
        <div className="stat-card">
          <h3>Citas médicas agendadas</h3>
          <p>Esta semana</p>
          <div className="number">{stats.citasEstaSemana}</div>

          <div className="progress-bar">
            <div
              className="progress-fill citas"
              style={{ width: `${porcentajeCitas}%` }}
            />
          </div>

          <div className="progress-info">
            <span>0</span>
            <span>Meta: 50</span>
          </div>

          <span>Citas</span>
        </div>
      </div>
    </div>
  );
}
