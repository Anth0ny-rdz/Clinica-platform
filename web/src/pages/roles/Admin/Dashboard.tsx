import React from "react";

import DashboardMain from "../../../components/admin/Dashboard";
import RoomsDashboard from "../../../components/admin/RoomsDashboard";
import AppointmentsChart from "../../../components/admin/AppointmentsChart";

export default function Dashboard() {
  return (
    <div className="container py-3">

      {/* TÍTULO */}
      <h1 className="text-center fw-bold mb-4" style={{ color: "#2c3e50" }}>
        Dashboard Administrativo
      </h1>

      {/* GRID DE 3 COLUMNAS */}
      <div className="row g-4">

        {/* COLUMNA 1 */}
        <div className="col-12 col-md-4">
          <div
            className="p-3 rounded shadow-sm"
            style={{
              background: "white",
              minHeight: "100%",
              borderRadius: "12px",
            }}
          >
            <DashboardMain />
          </div>
        </div>

        {/* COLUMNA 2 */}
        <div className="col-12 col-md-4">
          <div
            className="p-3 rounded shadow-sm"
            style={{
              background: "white",
              minHeight: "100%",
              borderRadius: "12px",
            }}
          >
            <RoomsDashboard />
          </div>
        </div>

        {/* COLUMNA 3 */}
        <div className="col-12 col-md-4">
          <div
            className="p-3 rounded shadow-sm"
            style={{
              background: "white",
              minHeight: "100%",
              borderRadius: "12px",
            }}
          >
            <AppointmentsChart />
          </div>
        </div>

      </div>
    </div>
  );
}
