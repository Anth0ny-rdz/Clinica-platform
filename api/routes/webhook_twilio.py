from fastapi import APIRouter, Request
from datetime import datetime
from supabase import create_client
import os
from utils.phone import normalizar_telefono_ec
from twilio.rest import Client


from services.user_create import crear_usuario_real

# =========================
# CONFIGURACIÓN
# =========================

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")

TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

router = APIRouter(
    prefix="/webhook",
    tags=["Twilio"]
)

def enviar_mensaje_whatsapp(telefono: str, mensaje: str):
    """Envía mensaje de WhatsApp usando Twilio"""
    try:
        # Asegurar que el número tenga el formato correcto
        # Si ya viene con whatsapp:, usarlo tal cual, sino agregarlo
        numero_destino = telefono if telefono.startswith('whatsapp:') else f'whatsapp:{telefono}'
        
        mensaje_enviado = twilio_client.messages.create(
            from_=f'whatsapp:{TWILIO_WHATSAPP_NUMBER}',
            body=mensaje,
            to=numero_destino
        )
        print(f"📤 MENSAJE ENVIADO: {mensaje_enviado.sid}")
        print(f"   Destino: {numero_destino}")
        print(f"   Contenido: {mensaje[:100]}...")
        return True
    except Exception as e:
        print(f"❌ ERROR AL ENVIAR MENSAJE: {e}")
        return False

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
            print("\n🚀 VALIDANDO DATOS ANTES DE CREAR USUARIO...")
            
            # VALIDAR EMAIL DUPLICADO
            payload = registro["payload"]
            email_existente = supabase.table("users") \
                .select("userid") \
                .eq("email", payload["email"]) \
                .execute()

            if email_existente.data:
                print("❌ EMAIL YA REGISTRADO - MARCANDO COMO RECHAZADO")
                supabase.table("pending_users").update({
                    "status": "rejected",
                    "responded_at": datetime.utcnow().isoformat()
                }).eq("id", registro["id"]).execute()
                
                # 📤 ENVIAR MENSAJE DE ERROR
                enviar_mensaje_whatsapp(
                    remitente,
                    "⚠️ Lo sentimos, el correo electrónico que proporcionó ya está registrado en nuestro sistema. Por favor contacte a recepción para más información."
                )
                
                print("=" * 70)
                return {
                    "ok": True,
                    "status": "rejected",
                    "message": "⚠️ El correo electrónico ya está registrado en el sistema."
                }
            
            # VALIDAR DOCUMENTO DUPLICADO
            doc_existente = supabase.table("user_profile") \
                .select("user_profile_id") \
                .eq("id_number", payload["id_number"]) \
                .execute()

            if doc_existente.data:
                print("❌ DOCUMENTO YA REGISTRADO - MARCANDO COMO RECHAZADO")
                supabase.table("pending_users").update({
                    "status": "rejected",
                    "responded_at": datetime.utcnow().isoformat()
                }).eq("id", registro["id"]).execute()
                
                # 📤 ENVIAR MENSAJE DE ERROR
                enviar_mensaje_whatsapp(
                    remitente,
                    "⚠️ Lo sentimos, el documento de identidad que proporcionó ya se encuentra registrado. Por favor contacte a recepción para más información."
                )
                
                print("=" * 70)
                return {
                    "ok": True,
                    "status": "rejected",
                    "message": "⚠️ El documento ya se encuentra registrado."
                }
            
            print("✅ VALIDACIONES PASADAS - CREANDO USUARIO...")
            crear_usuario_real(payload)
            print("🎉 USUARIO CREADO CON ÉXITO")

            supabase.table("pending_users").update({
                "status": "accepted",
                "responded_at": datetime.utcnow().isoformat()
            }).eq("id", registro["id"]).execute()
            
            # 📤 ENVIAR MENSAJE DE CONFIRMACIÓN EXITOSA
            enviar_mensaje_whatsapp(
                remitente,
                f"¡Gracias por confiar en Clínica Latacunga! ✅\n\nSu usuario ha sido creado exitosamente."
            )

        except Exception as e:
            print("❌ ERROR CREANDO USUARIO:", str(e))
            
            # Marcar como rechazado en caso de error
            supabase.table("pending_users").update({
                "status": "rejected",
                "responded_at": datetime.utcnow().isoformat()
            }).eq("id", registro["id"]).execute()
            
            # 📤 ENVIAR MENSAJE DE ERROR TÉCNICO
            enviar_mensaje_whatsapp(
                remitente,
                "❌ Lo sentimos, ocurrió un error al crear su usuario. Por favor contacte a recepción o intente nuevamente más tarde."
            )

    elif rechaza:
        print("🛑 CONSENTIMIENTO RECHAZADO → SE DETIENE EL FLUJO")

        supabase.table("pending_users").update({
            "status": "rejected",
            "responded_at": datetime.utcnow().isoformat()
        }).eq("id", registro["id"]).execute()
        
        # 📤 ENVIAR MENSAJE DE RECHAZO
        enviar_mensaje_whatsapp(
            remitente,
            "Entendemos su decisión. Sin su consentimiento no podemos proceder con la creación de su usuario."
        )

        return {
            "ok": True,
            "status": "rejected",
            "message": "El paciente rechazó el consentimiento. No se creó el usuario."
        }
    
    else:
        return {"status": "ignored"}
    
    print("=" * 70)
    return {"ok": True, "status": "processed"}