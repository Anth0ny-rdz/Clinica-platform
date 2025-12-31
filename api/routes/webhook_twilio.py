from fastapi import APIRouter, Request
from datetime import datetime
from supabase import create_client
import os
from utils.phone import normalizar_telefono_ec

from services.user_create import crear_usuario_real

# =========================
# CONFIGURACIÓN
# =========================

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

router = APIRouter(
    prefix="/webhook",
    tags=["Twilio"]
)

# =========================
# WEBHOOK TWILIO
# =========================

@router.post("/twilio")
async def webhook_twilio(request: Request):
    """
    Webhook que recibe respuestas de WhatsApp (Quick Reply / texto)
    """
    print("📦 SUPABASE URL (create_user_request):", SUPABASE_URL)
    print("\n" + "=" * 70)
    print("📩 WEBHOOK TWILIO RECIBIDO")
    print("⏰ Hora (UTC):", datetime.utcnow().isoformat())

    # -------------------------
    # 1️⃣ HEADERS
    # -------------------------
    print("\n🔹 HEADERS:")
    for k, v in request.headers.items():
        print(f"   {k}: {v}")

    # -------------------------
    # 2️⃣ FORM DATA
    # -------------------------
    form = await request.form()

    print("\n🔹 FORM DATA COMPLETA:")
    for k, v in form.items():
        print(f"   {k}: {v}")

    remitente = form.get("From", "")
    body = form.get("Body", "")
    button_payload = form.get("ButtonPayload")
    profile_name = form.get("ProfileName", "Desconocido")

    print("\n🔹 DATOS CLAVE:")
    print(f"   📱 FROM: {remitente}")
    print(f"   👤 NOMBRE PERFIL: {profile_name}")
    print(f"   💬 BODY: {body}")
    print(f"   🔘 BUTTON PAYLOAD: {button_payload}")

    # -------------------------
    # 3️⃣ NORMALIZAR RESPUESTA
    # -------------------------
    respuesta_raw = (button_payload or body or "").strip().lower()

    print(f"\n🧠 RESPUESTA NORMALIZADA: '{respuesta_raw}'")

    acepta = respuesta_raw in [
        "acepto_de_uso",
        "acepto",
        "si",
        "sí",
        "yes",
        "SI"
    ]

    rechaza = respuesta_raw in [
        "rechazo_de_uso",
        "rechazo",
        "no",
        "NO"
    ]

    if acepta:
        print("✅ CONSENTIMIENTO DETECTADO: ACEPTADO")
    elif rechaza:
        print("❌ CONSENTIMIENTO DETECTADO: RECHAZADO")
    else:
        print("⚠️ RESPUESTA NO RECONOCIDA — NO SE PROCESA")
        print("=" * 70)
        return {"ok": True}

    # -------------------------
    # 4️⃣ NORMALIZAR TELÉFONO
    # -------------------------
    try:
        waid = form.get("WaId", "")
        telefono = normalizar_telefono_ec(waid)
    except Exception:
        print("❌ Error obteniendo teléfono")
        print("=" * 70)
        return {"ok": True}

    print(f"\n📞 TELÉFONO NORMALIZADO: {telefono}")

    # -------------------------
    # 5️⃣ BUSCAR PENDING
    # -------------------------
    pending = supabase.table("pending_users") \
    .select("*") \
    .eq("phone", telefono) \
    .eq("status", "pending") \
    .order("created_at", desc=True) \
    .limit(1) \
    .execute()


    print("\n🔎 RESULTADO pending_users:")
    print(pending.data)

    if not pending.data:
        print("⚠️ NO EXISTE SOLICITUD PENDIENTE PARA ESTE NÚMERO")
        print("=" * 70)
        return {"ok": True}

    registro = pending.data[0]

    # -------------------------
    # 6️⃣ PROCESAR RESPUESTA
    # -------------------------
    if acepta:
        try:
            print("\n🚀 CREANDO USUARIO REAL...")
            crear_usuario_real(registro["payload"])
            print("🎉 USUARIO CREADO CON ÉXITO")

            supabase.table("pending_users").update({
                "status": "accepted",
                "responded_at": datetime.utcnow().isoformat()
            }).eq("id", registro["id"]).execute()

        except Exception as e:
            print("❌ ERROR CREANDO USUARIO:", str(e))

    elif rechaza:
        print("🛑 CONSENTIMIENTO RECHAZADO → SE DETIENE EL FLUJO")

        supabase.table("pending_users").update({
            "status": "rejected",
            "responded_at": datetime.utcnow().isoformat()
        }).eq("id", registro["id"]).execute()

        return {
            "ok": True,
            "status": "rejected",
            "message": "El paciente rechazó el consentimiento. No se creó el usuario."
        }
    
    else:
        return {"status": "ignored"}