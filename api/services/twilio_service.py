from twilio.rest import Client
import os
import json
from dotenv import load_dotenv

load_dotenv()


ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")

client = Client(ACCOUNT_SID, AUTH_TOKEN)

TWILIO_WHATSAPP = "whatsapp:+18046043610"  # tu WA Business o sandbox

def send_reservation_whatsapp(patient_phone: str, variables: dict):
    """
    Envía WhatsApp usando plantilla de Twilio con variables dinámicas.
    """
    try:
        mes = client.messages.create(
            from_=TWILIO_WHATSAPP,
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
            from_=TWILIO_WHATSAPP,
            to=f"whatsapp:{patient_phone}",
            content_sid="HX71fba67b24932c8e6aa92088acc52166",  # 👉 agrega aquí tu Content SID de plantilla
            content_variables=json.dumps(variables)
        )
        return {"ok": True, "sid": mes.sid}

    except Exception as e:
        return {"ok": False, "error": str(e)}