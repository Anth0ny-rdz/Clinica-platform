from fastapi import APIRouter
from services.twilio_service import send_reservation_whatsapp

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/send")
def send_whatsapp(to: str, body: str):
    return send_reservation_whatsapp(to, body)
