import React from "react";

import DashboardMain from "../../../components/admin/Dashboard";
import RoomsDashboard from "../../../components/admin/RoomsDashboard";
import AppointmentsChart from "../../../components/admin/AppointmentsChart";

export default function Dashboard() {
  return (
    <div
      className="container-fluid py-4"
      style={{
        background: "#f4f6f9",
        minHeight: "100vh",
      }}
    >
      {/* TÍTULO */}
      <div className="text-center mb-5">
        <h1
          className="fw-bold"
          style={{
            background: "linear-gradient(90deg, #2c3e50, #3498db)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "2.3rem",
          }}
        >
          Dashboard Administrativo
        </h1>
        <p className="text-muted mt-2">
          Vista general del estado de la clínica
        </p>
      </div>

      {/* GRID */}
      <div className="row g-4">
        {/* COLUMNA 1 */}
        <div className="col-12 col-lg-4">
          <div
            className="h-100 p-4 bg-white shadow-sm dashboard-card"
            style={{
              borderRadius: "16px",
              transition: "all 0.25s ease",
            }}
          >
            <h5 className="fw-semibold mb-3 text-primary">
              📊 Indicadores Generales
            </h5>
            <DashboardMain />
          </div>
        </div>

        {/* COLUMNA 2 */}
        <div className="col-12 col-lg-4">
          <div
            className="h-100 p-4 bg-white shadow-sm dashboard-card"
            style={{
              borderRadius: "16px",
              transition: "all 0.25s ease",
            }}
          >
            <h5 className="fw-semibold mb-3 text-success">
              🏥 Ocupación de Habitaciones
            </h5>
            <RoomsDashboard />
          </div>
        </div>

        {/* COLUMNA 3 */}
        <div className="col-12 col-lg-4">
          <div
            className="h-100 p-4 bg-white shadow-sm dashboard-card"
            style={{
              borderRadius: "16px",
              transition: "all 0.25s ease",
            }}
          >
            <h5 className="fw-semibold mb-3 text-warning">
              📅 Citas Médicas
            </h5>
            <AppointmentsChart />
          </div>
        </div>
      </div>

      {/* ESTILO HOVER */}
      <style>
        {`
          .dashboard-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 25px rgba(0, 0, 0, 0.08);
          }
        `}
      </style>
    </div>
  );
}
