import { useEffect, useState } from "react";
import { Table, Button, Spinner, Card } from "react-bootstrap";
import { fetchDoctorByAuth } from "@/services/doctorService";
import { fetchHospitalizacionesMedico } from "@/services/admissionService";
import { useAuth } from "@/context/AuthContext";

import { useNavigate } from "react-router-dom";



export default function HospitalizacionesMedico() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const auth_id = user?.auth_id;   // 👈 ESTE ES EL CORRECTO

  const [hospitalizaciones, setHospitalizaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // 1️⃣ Obtener doctor_profile a partir del AUTH_ID CORRECTO
      const doctor = await fetchDoctorByAuth(auth_id!);

      // 2️⃣ Obtener hospitalizaciones
      const data = await fetchHospitalizacionesMedico(doctor.doctor_profile_id);
      setHospitalizaciones(data);

    } catch (error) {
      console.error("❌ Error cargando hospitalizaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth_id) return;  // 👈 Evita error de undefined
    cargarDatos();
  }, [auth_id]);

  return (
    <Card className="p-4 shadow-sm">
      <h3 className="mb-4">Pacientes Hospitalizados</h3>

      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : hospitalizaciones.length === 0 ? (
        <p>No hay pacientes hospitalizados a tu cargo.</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Documento</th>
              <th>Ingreso</th>
              <th>Habitación</th>
              <th>Razón</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {hospitalizaciones.map((adm) => (
              <tr key={adm.admission_id}>
                <td>{adm.patients?.names} {adm.patients?.last_names}</td>
                <td>{adm.patients?.doc_id}</td>
                <td>{adm.fecha_ingreso} {adm.hora_ingreso}</td>
                <td>{adm.habitacion_asignada}</td>
                <td>{adm.razon_ingreso}</td>
                <td>
                <Button 
                  variant="primary"
                  onClick={() => navigate(`/medico/hospitalizaciondetalle/${adm.admission_id}`)}
                >
                  Ver detalles
                </Button>
              </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
