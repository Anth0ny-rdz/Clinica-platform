from twilio.rest import Client
import os
import json
from dotenv import load_dotenv
from supabase import create_client
from datetime import datetime

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER")

WHATSAPP_NUMBER = TWILIO_WHATSAPP_NUMBER
ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")

client = Client(ACCOUNT_SID, AUTH_TOKEN)


def send_reservation_whatsapp(patient_phone: str, variables: dict):
    """
    Envía WhatsApp usando plantilla de Twilio con variables dinámicas.
    """
    try:
        mes = client.messages.create(
            from_=f"whatsapp:{TWILIO_WHATSAPP_NUMBER}",
            to=f"whatsapp:{patient_phone}",
            content_sid="HXb98da9382b0e103519670139d347e992",
            content_variables=json.dumps(variables)
        )
        return {"ok": True, "sid": mes.sid}

    except Exception as e:
        return {"ok": False, "error": str(e)}



def send_lab_result_whatsapp(patient_phone: str, variables: dict):
    """
    Envía WhatsApp para notificación de resultados de laboratorio.
    variables: dict con las variables de la plantilla (ej: nombre, tipo_examen)
    """
    try:
        mes = client.messages.create(
            from_=f"whatsapp:{TWILIO_WHATSAPP_NUMBER}",
            to=f"whatsapp:{patient_phone}",
            content_sid="HX71fba67b24932c8e6aa92088acc52166",  # 👉 agrega aquí tu Content SID de plantilla
            content_variables=json.dumps(variables)
        )
        return {"ok": True, "sid": mes.sid}

    except Exception as e:
        return {"ok": False, "error": str(e)}
    

def enviar_consentimiento_simple(numero: str, pending_id: str) -> bool:
    """
    Envía consentimiento WhatsApp y lo vincula a un pending_id
    """

    if numero.startswith('0'):
        numero = '+593' + numero[1:]
    elif not numero.startswith('+'):
        numero = '+593' + numero

    try:
        client = Client(ACCOUNT_SID, AUTH_TOKEN)

        mensaje = client.messages.create(
            from_=f'whatsapp:{WHATSAPP_NUMBER}',
            to=f'whatsapp:{numero}',
            content_sid="HX08aae0c7981edc0462fcde9b968de7df"
        )

        # Registrar envío
        supabase.table("pending_users").update({
            "whatsapp_sent": True,
            "whatsapp_sent_at": datetime.utcnow().isoformat()
        }).eq("id", pending_id).execute()

        print(f"✅ Consentimiento enviado a {numero}")
        print(f"   SID: {mensaje.sid}")
        return True

    except Exception as e:
        print(f"❌ Error enviando WhatsApp a {numero}: {e}")
        return False
