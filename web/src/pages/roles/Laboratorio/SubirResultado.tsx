import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Form, Alert, Spinner } from "react-bootstrap";

import { uploadExamFile } from "@/services/storageService";
import { registerExamResult } from "@/services/labService";
import { fetchUserProfileId } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";

export default function SubirResultado() {
  const { item_id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [userProfileId, setUserProfileId] = useState<number | null>(null);


  // 🔹 Obtener user_profile_id al cargar
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!user?.auth_id) {
          setMessage("❌ Usuario no autenticado.");
          return;
        }


        const profile = await fetchUserProfileId(user.auth_id);


        if (!profile?.user_profile_id) {
          return setMessage("❌ No se pudo obtener el ID del usuario.");
        }


        setUserProfileId(profile.user_profile_id);

      } catch (err) {
        console.error("🔥 [DEBUG] Error cargando perfil:", err);
      }
    };

    loadProfile();
  }, [user]);

  // 🟩 Captura archivo
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] || null;
    console.log("📸 [DEBUG] Archivo seleccionado:", selected?.name);
    setFile(selected);
  }

  // 🟥 Envío del formulario
  async function handleSubmit(e: any) {
    e.preventDefault();

    console.log("🟧 [DEBUG] handleSubmit iniciado…");

    if (!user) {
      console.log("❌ [DEBUG] user es null");
      return setMessage("❌ Usuario no autenticado.");
    }

    if (!userProfileId) {
      console.log("❌ [DEBUG] userProfileId null → no puedo registrar");
      return setMessage("❌ Error obteniendo ID del usuario.");
    }

    if (!file) {
      console.log("⚠️ [DEBUG] No hay archivo seleccionado");
      return setMessage("⚠️ Selecciona un archivo.");
    }

    try {
      setUploading(true);
      setMessage("Subiendo archivo…");

      console.log("📤 [DEBUG] Enviando archivo al storage:", file.name);

      // 1️⃣ SUBIR ARCHIVO
      const file_path = await uploadExamFile(file);

      console.log("📁 [DEBUG] Storage devolvió file_path:", file_path);

      if (!file_path) {
        console.log("❌ [DEBUG] ERROR: file_path viene vacío");
        setMessage("❌ Error subiendo archivo al storage.");
        return;
      }

      // 2️⃣ REGISTRAR RESULTADO EN BACKEND
      console.log("📝 [DEBUG] Llamando a registerExamResult con:");
      console.log({
        item_id: Number(item_id),
        file_path,
        uploaded_by: userProfileId
      });

      const result = await registerExamResult(
        Number(item_id),
        file_path,
        userProfileId
      );

      console.log("🟢 [DEBUG] Respuesta de registerExamResult:", result);

      setMessage("✅ Resultado subido exitosamente");

      // 3️⃣ Redirigir después de éxito
      console.log("➡️ [DEBUG] Redirigiendo a detalle del item en 1.2s…");

      setTimeout(() => {
        navigate(`/laboratorio/item/${item_id}`);
      }, 1200);

    } catch (err: any) {
      console.error("🔥 [DEBUG] ERROR FINAL EN handleSubmit:", err);
      setMessage("❌ Error subiendo resultado: " + err.message);
    } finally {
      setUploading(false);
      console.log("🟩 [DEBUG] handleSubmit finalizado.");
    }
  }

  return (
    <div className="container mt-4">
      <Button variant="link" onClick={() => navigate(-1)}>
        ← Volver
      </Button>

      <Card className="shadow p-4">
        <h3>📤 Subir Resultado del Examen</h3>

        {message && (
          <Alert variant={message.startsWith("✅") ? "success" : "danger"}>
            {message}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>

          <Form.Group className="mb-3">
            <Form.Label><strong>Seleccionar archivo</strong></Form.Label>
            <Form.Control
              type="file"
              accept="application/pdf,image/*"
              onChange={handleFileChange}
            />
          </Form.Group>

          {file && (
            <p className="text-muted">📄 Archivo: <strong>{file.name}</strong></p>
          )}

          <Button type="submit" variant="primary" disabled={uploading}>
            {uploading ? (
              <>
                <Spinner size="sm" /> Subiendo…
              </>
            ) : (
              "Guardar Resultado"
            )}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
