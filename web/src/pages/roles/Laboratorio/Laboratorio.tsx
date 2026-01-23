import { Routes, Route } from "react-router-dom";
import HeaderLab from "@/components/HeaderLaboratorio";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";

import Pendientes from "./Pendientes";
import DetalleItem from "./DetalleItem";
import SubirResultado from "./SubirResultado";
import DashboardLaboratorio from "./DashboardLaboratorio"
import Completados from "./Completados";


export default function LabLayout() {
  return (
    <ProtectedRoute>
      <RoleProtectedRoute allowedRoles={["Laboratorio"]}>
        <div>
        <HeaderLab />
        <main style={{ padding: "0" }}>
          <Routes>
            <Route index element={<DashboardLaboratorio />} />
            <Route path="pendientes" element={<Pendientes />} />
            <Route path="item/:item_id" element={<DetalleItem />} />
            <Route path="item/:item_id/subir" element={<SubirResultado />} />
            <Route path="completados" element={<Completados />} />
          </Routes>
        </main>
        </div>
        
      </RoleProtectedRoute>
    </ProtectedRoute>
  );
}