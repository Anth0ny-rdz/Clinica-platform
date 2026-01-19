import { useEffect, useState } from "react"
import DashboardMain from "../../../components/admin/Dashboard"
import RoomsDashboard from "../../../components/admin/RoomsDashboard"
import AppointmentsChart from "../../../components/admin/AppointmentsChart"
import Skeleton from "../../../components/skeleton"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)

  // Simula carga (luego reemplazas con fetch real)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className="container-fluid px-4 py-4"
      style={{
        backgroundColor: "#f4f6f9",
      }}
    >
      {/* HEADER */}
      <div className="row mb-4">
        <div className="col text-center">
          <h1 className="fw-bold mb-1">Dashboard Administrativo</h1>
          <p className="text-muted mb-0">
            Vista general del estado operativo de la clínica
          </p>
        </div>
      </div>

      {/* GRID */}
      <div className="row g-4">
        {/* CARD 1 */}
        <div className="col-12 col-lg-4">
          <div className="dashboard-card card">
            <div className="card-body">
              <h6 className="fw-semibold mb-2">Indicadores Generales</h6>

              {loading ? (
                <>
                  <Skeleton height={18} />
                  <Skeleton height={18} className="mt-2" />
                  <Skeleton height={180} className="mt-3" />
                </>
              ) : (
                <DashboardMain />
              )}
            </div>
          </div>
        </div>

        {/* CARD 2 */}
        <div className="col-12 col-lg-4">
          <div className="dashboard-card card">
            <div className="card-body">
              <h6 className="fw-semibold mb-2">Ocupación de Habitaciones</h6>

              {loading ? (
                <Skeleton height={220} />
              ) : (
                <RoomsDashboard />
              )}
            </div>
          </div>
        </div>

        {/* CARD 3 */}
        <div className="col-12 col-lg-4">
          <div className="dashboard-card card">
            <div className="card-body">
              <h6 className="fw-semibold mb-2">Citas Médicas</h6>

              {loading ? (
                <Skeleton height={220} />
              ) : (
                <AppointmentsChart />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ESTILOS */}
      <style>
        {`
          .dashboard-card {
            border-radius: 16px;
            border: none;
            background: #ffffff;
            box-shadow: 0 6px 20px rgba(0,0,0,0.06);
          }

          .kpi-card {
            background: #ffffff;
            border-radius: 14px;
            padding: 1.25rem;
            box-shadow: 0 6px 20px rgba(0,0,0,0.06);
          }
        `}
      </style>
    </div>
  )
}
