import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../services/supabaseClient";
import Skeleton from "../skeleton";
import "./AppointmentsChart.css";

interface MonthData {
  mes: string;
  agendadas: number;
  atendidas: number;
}

interface ChartData {
  agendadas: number;
  atendidas: number;
  dataMensual: MonthData[];
}

export default function AppointmentsChart() {
  const [chartData, setChartData] = useState<ChartData>({
    agendadas: 0,
    atendidas: 0,
    dataMensual: [],
  });

  const [loading, setLoading] = useState<boolean>(true);

  const fetchMonthlyData = async (
    startDate: Date,
    endDate: Date
  ): Promise<MonthData[]> => {
    const months: MonthData[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);

      const { count: agendadasMes } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .gte("date", monthStart.toISOString())
        .lte("date", monthEnd.toISOString());

      const { count: atendidasMes } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("status", "atendida")
        .gte("date", monthStart.toISOString())
        .lte("date", monthEnd.toISOString());

      months.push({
        mes: current.toLocaleDateString("es-ES", { month: "short" }),
        agendadas: agendadasMes || 0,
        atendidas: atendidasMes || 0,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return months;
  };

  const fetchAppointmentsData = useCallback(async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);

      const { count: totalAgendadas } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .gte("date", startDate.toISOString())
        .lte("date", endDate.toISOString());

      const { count: totalAtendidas } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("status", "atendida")
        .gte("date", startDate.toISOString())
        .lte("date", endDate.toISOString());

      const monthlyData = await fetchMonthlyData(startDate, endDate);

      setChartData({
        agendadas: totalAgendadas || 0,
        atendidas: totalAtendidas || 0,
        dataMensual: monthlyData,
      });
    } catch (error) {
      console.error("Error cargando citas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointmentsData();
  }, [fetchAppointmentsData]);

  /* =========================
     SKELETON STATE
  ========================== */
  if (loading) {
    return (
      <div className="appointments-chart-small">
        <Skeleton height={22} width="40%" />

        <div className="summary-mini mt-3">
          <Skeleton height={16} width="60%" />
          <Skeleton height={16} width="60%" className="mt-2" />
          <Skeleton height={16} width="60%" className="mt-2" />
        </div>

        <div className="chart-mini mt-4">
          {[1, 2, 3, 4, 5, 6].map((_, i) => (
            <div key={i} className="month-mini">
              <Skeleton height={14} width="30%" />
              <Skeleton height={12} width="80%" className="mt-2" />
              <Skeleton height={12} width="65%" className="mt-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* =========================
     DATA RENDER
  ========================== */

  const maxValue =
    Math.max(...chartData.dataMensual.map((m) => m.agendadas || 1)) || 1;

  return (
    <div className="appointments-chart-small">
      <h3>Citas Médicas</h3>

      <div className="summary-mini">
        <div className="mini-item">
          <span className="mini-label">Agendadas</span>
          <span className="mini-value">{chartData.agendadas}</span>
        </div>

        <div className="mini-item">
          <span className="mini-label">Atendidas</span>
          <span className="mini-value">{chartData.atendidas}</span>
        </div>

        <div className="mini-item">
          <span className="mini-label">Tasa de atención</span>
          <span className="mini-value">
            {chartData.agendadas > 0
              ? Math.round(
                  (chartData.atendidas / chartData.agendadas) * 100
                )
              : 0}
            %
          </span>
        </div>
      </div>

      <div className="chart-mini">
        {chartData.dataMensual.map((mes, i) => (
          <div key={i} className="month-mini">
            <div className="month-abbr">{mes.mes}</div>

            <div className="bars-mini">
              <div
                className="bar-mini agendadas-bar"
                style={{
                  width: `${Math.max((mes.agendadas / maxValue) * 60, 10)}%`,
                }}
              >
                <span className="bar-text">{mes.agendadas}</span>
              </div>

              <div
                className="bar-mini atendidas-bar"
                style={{
                  width: `${Math.max((mes.atendidas / maxValue) * 60, 10)}%`,
                }}
              >
                <span className="bar-text">{mes.atendidas}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
