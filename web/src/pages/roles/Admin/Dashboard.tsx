import { useEffect, useState } from "react"
import DashboardMain from "../../../components/admin/Dashboard"
import RoomsDashboard from "../../../components/admin/RoomsDashboard"
import AppointmentsChart from "../../../components/admin/AppointmentsChart"
import Skeleton from "../../../components/skeleton"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className="dashboard-admin-wrapper"
      style={{
        background: "linear-gradient(135deg, #f4f6f9 0%, #e8ecf1 100%)",
        minHeight: "calc(100vh - 77px)",
        padding: "2rem 1rem", // ← Padding directo aquí
        margin: 0,
        overflowX: "hidden",
    overflowY: "hidden",
      }}
    >
      <div className="container-fluid" style={{ padding: 0 }}> {/* ← Sin padding adicional */}
        {/* HEADER */}
        <div className="row mb-4 fade-in">
          <div className="col text-center">
            <div className="header-icon mb-3">
              <span style={{ fontSize: '3rem' }}>📊</span>
            </div>
            <h1 className="fw-bold mb-2 text-slide-down" style={{ color: '#2c3e50', fontSize: '2rem' }}>
              Dashboard Administrativo
            </h1>
            <p className="text-muted mb-0 text-slide-up" style={{ fontSize: '1.05rem' }}>
              Vista general del estado operativo de la clínica
            </p>
          </div>
        </div>

        {/* GRID */}
        <div className="row g-4">
          {/* CARD 1 */}
          <div className="col-12 col-lg-4">
            <div className="dashboard-card card card-animate" style={{ animationDelay: "0.1s" }}>
              <div className="card-body">
                <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2" style={{ fontSize: '1rem' }}>
                  <span className="icon-pulse">📊</span>
                  Indicadores Generales
                </h6>

                {loading ? (
                  <>
                    <Skeleton height={18} />
                    <Skeleton height={18} className="mt-2" />
                    <Skeleton height={180} className="mt-3" />
                  </>
                ) : (
                  <div className="content-fade-in">
                    <DashboardMain />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="col-12 col-lg-4">
            <div className="dashboard-card card card-animate" style={{ animationDelay: "0.2s" }}>
              <div className="card-body">
                <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2" style={{ fontSize: '1rem' }}>
                  <span className="icon-pulse" style={{ animationDelay: "0.2s" }}>🏥</span>
                  Ocupación de Habitaciones
                </h6>

                {loading ? (
                  <Skeleton height={220} />
                ) : (
                  <div className="content-fade-in">
                    <RoomsDashboard />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="col-12 col-lg-4">
            <div className="dashboard-card card card-animate" style={{ animationDelay: "0.3s" }}>
              <div className="card-body">
                <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2" style={{ fontSize: '1rem' }}>
                  <span className="icon-pulse" style={{ animationDelay: "0.4s" }}>📅</span>
                  Citas Médicas
                </h6>

                {loading ? (
                  <Skeleton height={220} />
                ) : (
                  <div className="content-fade-in">
                    <AppointmentsChart />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ESTILOS MEJORADOS */}
      <style>
        {`
          /* === ANIMACIONES DE ENTRADA === */
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          /* === WRAPPER === */
          .dashboard-admin-wrapper {
            animation: fadeIn 0.6s ease-out;
          }

          /* === HEADER ICON === */
          .header-icon {
            display: inline-block;
            animation: float 3s ease-in-out infinite;
          }

          /* === CLASES DE ANIMACIÓN === */
          .fade-in {
            animation: fadeIn 0.6s ease-out;
          }

          .text-slide-down {
            animation: slideDown 0.6s ease-out;
          }

          .text-slide-up {
            animation: slideUp 0.6s ease-out 0.2s backwards;
          }

          .card-animate {
            animation: slideInUp 0.6s ease-out backwards;
          }

          .content-fade-in {
            animation: fadeIn 0.5s ease-out;
          }

          .icon-pulse {
            display: inline-block;
            animation: pulse 2s ease-in-out infinite;
          }

          /* === CARDS === */
          .dashboard-card {
            border-radius: 20px;
            border: none;
            background: #ffffff;
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }

          .dashboard-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.4),
              transparent
            );
            transition: left 0.5s ease;
          }

          .dashboard-card:hover::before {
            left: 100%;
          }

          .dashboard-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 32px rgba(0,0,0,0.12);
          }

          .dashboard-card:active {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          }

          /* === KPI CARDS === */
          .kpi-card {
            background: #ffffff;
            border-radius: 14px;
            padding: 1.25rem;
            box-shadow: 0 6px 20px rgba(0,0,0,0.06);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid transparent;
          }

          .kpi-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 28px rgba(0,0,0,0.1);
            border-color: rgba(30,64,175,0.1);
          }

          /* === TÍTULOS DE CARD === */
          .card-body h6 {
            color: #2c3e50;
            letter-spacing: -0.01em;
            transition: color 0.3s ease;
          }

          .dashboard-card:hover .card-body h6 {
            color: #1e40af;
          }

          /* === MEJORAS EN SKELETON === */
          .skeleton {
            transition: opacity 0.3s ease;
          }

          /* === SMOOTH SCROLL === */
          * {
            scroll-behavior: smooth;
          }

          /* === RESPONSIVE === */
          @media (max-width: 991px) {
            .dashboard-admin-wrapper {
              padding: 1rem !important;
            }

            .dashboard-card {
              margin-bottom: 0;
            }
            
            .card-animate {
              animation-delay: 0s !important;
            }

            .header-icon span {
              font-size: 2rem !important;
            }

            h1 {
              font-size: 1.5rem !important;
            }
          }

          /* === ACCESIBILIDAD === */
          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }

          /* === FOCUS STATES === */
          .dashboard-card:focus-within {
            outline: 2px solid #1e40af;
            outline-offset: 2px;
          }
        `}
      </style>
    </div>
  )
}