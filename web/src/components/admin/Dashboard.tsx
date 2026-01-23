import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import Skeleton from "../skeleton";
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
      // Total pacientes
      const { count: totalPacientes } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true });

      // Semana actual
      const startOfWeek = new Date();
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      // Citas semana
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
      console.error("Error dashboard:", error);
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

  /* =========================
     SKELETON STATE
  ========================== */
  if (loading) {
    return (
      <div className="dashboard">
        <div className="stats-container">
          {[1, 2].map((_, i) => (
            <div key={i} className="stat-card">
              <Skeleton height={18} width="70%" />
              <Skeleton height={14} width="40%" className="mt-1" />

              <div className="mt-3">
                <Skeleton height={36} width="50%" />
              </div>

              <div className="mt-3">
                <Skeleton height={10} />
              </div>

              <div className="progress-info mt-2">
                <Skeleton height={12} width="30%" />
                <Skeleton height={12} width="30%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* =========================
     DATA RENDER
  ========================== */

  return (
    <div className="dashboard">
      <div className="stats-container">
        {/* TARJETA PACIENTES */}
        <div className="stat-card">
          <h3>Total de pacientes</h3>
          <p>Registrados</p>

          <div className="number">
            {stats.totalPacientes.toLocaleString()}
          </div>

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

        {/* TARJETA CITAS */}
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
