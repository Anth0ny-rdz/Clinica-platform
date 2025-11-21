import { Routes, Route } from "react-router-dom";
import HeaderLab from "@/components/HeaderLaboratorio";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";

import Pendientes from "./Pendientes";
import DetalleItem from "./DetalleItem";
import SubirResultado from "./SubirResultado";
import DashboardLaboratorio from "./DashboardLaboratorio"


export default function LabLayout() {
  return (
    <ProtectedRoute>
      <RoleProtectedRoute allowedRoles={["Laboratorio"]}>
        <div>
        <HeaderLab />
        <main style={{ padding: "2rem" }}>
          <Routes>
            <Route index element={<DashboardLaboratorio />} />
            <Route path="pendientes" element={<Pendientes />} />
            <Route path="item/:item_id" element={<DetalleItem />} />
            <Route path="item/:item_id/subir" element={<SubirResultado />} />
          </Routes>
        </main>
        </div>
        
      </RoleProtectedRoute>
    </ProtectedRoute>
  );
}