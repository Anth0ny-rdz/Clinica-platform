from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from supabase import create_client
import os
from dotenv import load_dotenv
from typing import Annotated, Optional, Literal
import bcrypt
from fastapi import Body
from datetime import datetime, timedelta, date
import json
from services.user_create import crear_usuario_real
from services.twilio_service import enviar_consentimiento_simple
from utils.validaciones import validar_documento

from routes.webhook_twilio import router as webhook_router


from fastapi import HTTPException
from datetime import datetime
import bcrypt
import json

from fastapi.responses import JSONResponse


load_dotenv()

from ai.embedding import build_embedding_text, create_embedding, now_iso
from ai.rag import call_agent

def empty_to_none(value):
    return value if value not in ("", None) else None

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


app = FastAPI()
app.include_router(webhook_router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Validación de cédula ecuatoriana
def validar_cedula_ecuador(cedula: str) -> bool:
    if len(cedula) != 10 or not cedula.isdigit():
        return False
    provincia = int(cedula[:2])
    if provincia < 1 or provincia > 24:
        return False
    digitos = list(map(int, cedula))
    verificador = digitos.pop()
    for i in range(0, 9, 2):
        digitos[i] *= 2
        if digitos[i] > 9:
            digitos[i] -= 9
    total = sum(digitos)
    decena_superior = (total + 9) // 10 * 10
    calculado = decena_superior - total if decena_superior != total else 0
    return calculado == verificador


# 📦 Modelo del usuario
class UserCreate(BaseModel):
    tipo_documento: Literal["cedula", "pasaporte"]
    id_number: Annotated[str, Field(min_length=10, max_length=10)]
    name: Annotated[str, Field(min_length=2)]
    lastname: Annotated[str, Field(min_length=2)]
    email: EmailStr
    password: Annotated[str, Field(min_length=6)]
    telephone: Annotated[str, Field(pattern=r'^\d{10}$')]
    address: Annotated[str, Field(min_length=5)]
    birth_date: Annotated[str, Field(pattern=r'^\d{4}-\d{2}-\d{2}$')]
    rol_id: int
    genre: Optional[str] = None
    seguro_medico: Optional[str] = None

#1
@app.post("/create_user")
def create_user(user: UserCreate):
    return crear_usuario_real(user.dict())

#2   
@app.get("/patients")
def get_all_patients():
    """
    Retorna la lista completa de pacientes registrados.
    """
    try:
        query = supabase.table("patients").select("*").order("names").execute()
        return JSONResponse(content=query.data, status_code=200)
    except Exception as e:
        print("❌ Error obteniendo pacientes:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

#3
@app.get("/patients/{cedula}")
def get_patient_by_cedula(cedula: str):
    """
    Busca un paciente por su número de cédula (doc_id).
    """
    try:
        query = supabase.table("patients").select("*").eq("doc_id", cedula).execute()
        if not query.data:
            raise HTTPException(status_code=404, detail="Paciente no encontrado.")
        return JSONResponse(content=query.data[0], status_code=200)
    except HTTPException as he:
        raise he
    except Exception as e:
        print("❌ Error buscando paciente:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

#4
@app.put("/patients/{cedula}")
def update_patient(cedula: str, data: dict = Body(...)):
    """
    Actualiza los campos clínicos o administrativos de un paciente.
    """
    try:
        # Verificar existencia
        existing = supabase.table("patients").select("doc_id").eq("doc_id", cedula).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Paciente no encontrado.")

        # Actualizar
        update_result = supabase.table("patients").update(data).eq("doc_id", cedula).execute()
        return {"message": "✅ Paciente actualizado correctamente", "updated": update_result.data}
    except HTTPException as he:
        raise he
    except Exception as e:
        print("❌ Error actualizando paciente:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
    
#5
@app.post("/encounters")
def create_encounter(data: dict):
    """
    Crea una nueva historia médica (encounter) junto a signos vitales,
    vinculando directamente al médico desde la tabla 'doctors' (doctor_id).
    """
    try:
        print("📥 Datos recibidos:", data)

        patient_id = int(data["patient_id"])
        doctor_id = int(data["doctor_id"])

        # Crear la historia médica
        encounter_data = {
            "patient_id": patient_id,
            "doctor_id": doctor_id,  # ✅ ahora apunta a doctors.doctors_id
            "reason_for_consultation": data.get("reason_for_consultation"),
            "main_symptoms": data.get("main_symptoms"),
            "secondary_symptoms": data.get("secondary_symptoms"),
            "treatment": data.get("treatment"),
            "observations": data.get("observations"),
            "diagnostico": data.get("diagnostico"),
            "revision_organos": data.get("revision_organos"),
            "examen_fisico" : data.get("examen_fisico"),
            "fecha_para_control": data.get("fecha_para_control"),
            "date": datetime.now().date().isoformat(),
            "hour": datetime.now().time().strftime("%H:%M:%S"),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }

        result_encounter = supabase.table("encounters").insert(encounter_data).execute()

        if not result_encounter.data:
            raise HTTPException(status_code=400, detail="Error creando historia médica.")

        encounter_id = result_encounter.data[0]["encounter_id"]

        # 🧠 Generar embedding automáticamente (NO recomendación IA)
        embedding_text = build_embedding_text(encounter_data)

        if len(embedding_text) >= 30:
            try:
                embedding = create_embedding(embedding_text)

                supabase.table("encounters").update({
                    "embedding": embedding,
                    "embedding_text": embedding_text,
                    "embedding_model": os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"),
                    "embedded_at": now_iso()
                }).eq("encounter_id", encounter_id).execute()

            except Exception as e:
                # ⚠️ IMPORTANTE: el embedding NO debe romper el guardado del encounter
                print("⚠️ Error generando embedding (se continúa sin IA):", str(e))



        # 🩺 Signos vitales (si vienen)
        vitals_data = data.get("vitals")

        if vitals_data:
            presion = empty_to_none(vitals_data.get("presion_arterial"))
            pulso = empty_to_none(vitals_data.get("pulso_xmin"))
            temp = empty_to_none(vitals_data.get("temperatura"))

            # 🧠 Insertar SOLO si al menos uno tiene valor
            if presion is not None or pulso is not None or temp is not None:
                vital_record = {
                    "encounter_id": encounter_id,
                    "fecha": datetime.now().date().isoformat(),
                    "presion_arterial": presion,
                    "pulso_xmin": pulso,
                    "temperatura": temp,
                }

                result_vital = supabase.table("signus_vitalis").insert(vital_record).execute()

                if result_vital.data:
                    vital_sign_id = result_vital.data[0]["vital_sign_id"]
                    supabase.table("encounters").update(
                        {"vital_sign_id": vital_sign_id}
                    ).eq("encounter_id", encounter_id).execute()


                return {"message": "✅ Historia y signos vitales creados correctamente", "encounter_id": encounter_id}

    except Exception as e:
        print("❌ Error creando historia médica:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

#6
@app.post("/vital_signs")
def create_vital_signs(data: dict):
    """
    Crea los signos vitales asociados a una historia
    """
    try:
        vital_data = {
            "encounter_id": int(data["encounter_id"]),
            "fecha": datetime.now().date().isoformat(),
            "presion_arterial": data.get("presion_arterial"),
            "pulso_xmin": data.get("pulso_xmin"),
            "temperatura": data.get("temperatura"),
        }
        result = supabase.table("signus_vitalis").insert(vital_data).execute()
        return result.data[0]
    except Exception as e:
        print("❌ Error creando signos vitales:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

#7    
@app.get("/doctor/{auth_id}")
def get_doctor_profile(auth_id: str):
    """
    Devuelve el user_profile_id del médico logueado
    """
    try:
        query = (
            supabase.table("user_profile")
            .select("user_profile_id")
            .eq("auth_id", auth_id)
            .execute()
        )
        if not query.data:
            raise HTTPException(status_code=404, detail="Perfil no encontrado")
        return query.data[0]
    except Exception as e:
        print("❌ Error obteniendo perfil del médico:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

#8    
@app.get("/doctor/id/{auth_id}")
def get_doctor_id_by_auth(auth_id: str):
    """
    Devuelve el doctors_id de la tabla 'doctors' asociado al auth_id del médico logueado.
    """
    try:
        # Buscar el user_id del auth_id
        user_query = supabase.table("user_profile").select("user_id").eq("auth_id", auth_id).single().execute()
        if not user_query.data:
            raise HTTPException(status_code=404, detail="Perfil de usuario no encontrado.")

        user_id = user_query.data["user_id"]

        # Buscar el doctor que tenga ese user_id
        doctor_query = supabase.table("doctors").select("doctors_id").eq("user_id", user_id).single().execute()
        if not doctor_query.data:
            raise HTTPException(status_code=404, detail="Médico no encontrado en tabla doctors.")

        return {"doctor_id": doctor_query.data["doctors_id"]}

    except HTTPException as he:
        raise he
    except Exception as e:
        print("❌ Error obteniendo doctor_id:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

from routers.notifications import router as notifications_router
from services.twilio_service import send_reservation_whatsapp

#9
@app.post("/appointments")
def create_appointment(data: dict):
    """
    Crea una nueva cita verificando disponibilidad del médico
    y envía automáticamente un mensaje de WhatsApp al paciente.
    """

    try:
        print("\n================= 🟦 INICIO CREACIÓN DE CITA 🟦 =================")
        print("📥 Datos recibidos en el backend:", data)

        patient_id = int(data["patient_id"])
        doctor_profile_id = int(data["doctor_profile_id"])   # este valor es doctors_id
        created_by = int(data["created_by"])
        date = data["date"]
        time = data["time"]
        reason = data.get("reason", "")

        print("🧩 patient_id:", patient_id)
        print("🧩 doctor_profile_id (doctors_id):", doctor_profile_id)
        print("🧩 created_by:", created_by)
        print("🧩 date:", date)
        print("🧩 time:", time)
        print("🧩 reason:", reason)

        # 🔍 1. Verificar disponibilidad del médico
        print("\n🔍 Verificando disponibilidad del médico...")
        existing = (
            supabase.table("appointments")
            .select("appointment_id")
            .eq("doctor_profile_id", doctor_profile_id)
            .eq("date", date)
            .eq("time", time)
            .execute()
        )
        print("📌 Resultado disponibilidad:", existing.data)

        if existing.data:
            print("❌ Médico ocupado en ese horario")
            raise HTTPException(
                status_code=400,
                detail="⚠️ El médico ya tiene una cita programada en esa fecha y hora."
            )

        # 📝 2. Crear la nueva cita
        print("\n📝 Creando cita...")
        appointment_data = {
            "patient_id": patient_id,
            "doctor_profile_id": doctor_profile_id,
            "created_by": created_by,
            "date": date,
            "time": time,
            "reason": reason,
            "status": "Pendiente",
            "created_at": datetime.now().isoformat(),
        }

        print("📦 Datos a insertar:", appointment_data)

        result = supabase.table("appointments").insert(appointment_data).execute()
        print("📌 Resultado insert:", result.data)

        if not result.data:
            raise HTTPException(status_code=400, detail="Error creando cita médica.")

        appointment_id = result.data[0]["appointment_id"]
        print("🆔 ID cita creada:", appointment_id)

        # ----------------------------------------------------------------------
        # 📡 3. ENVIAR WHATSAPP AUTOMÁTICAMENTE
        # ----------------------------------------------------------------------
        print("\n================= 🟩 INICIO ENVÍO WHATSAPP 🟩 =================")

        # 3.1 Obtener datos del paciente
        print("🔎 Buscando paciente con patient_id =", patient_id)
        patient = (
            supabase.table("patients")
            .select("names, lastname, telephone")
            .eq("patient_id", patient_id)
            .single()
            .execute()
        ).data
        print("👤 Paciente encontrado:", patient)

        # 3.2 Obtener datos del doctor
        print("🔎 Buscando doctor con doctors_id =", doctor_profile_id)
        doctor = (
            supabase.table("doctors")
            .select("nombres, apellidos, especialidad_id")
            .eq("doctors_id", doctor_profile_id)
            .single()
            .execute()
        ).data
        print("👨‍⚕️ Doctor encontrado:", doctor)

        # 3.3 Obtener nombre de la especialidad
        print("🔎 Buscando especialidad con specialty_id =", doctor["especialidad_id"])
        specialty = (
            supabase.table("specialties")
            .select("name")
            .eq("especialidad_id", doctor["especialidad_id"])
            .single()
            .execute()
        ).data
        print("🏥 Especialidad encontrada:", specialty)

        specialty_name = specialty["name"]

        # 3.4 Construir variables Twilio
        variables = {
            "1": f"{patient['names']} {patient['lastname']}",
            "2": date,
            "3": time,
            "4": f"{doctor['nombres']} {doctor['apellidos']}",
            "5": specialty_name
        }

        print("📨 Variables WhatsApp:", variables)

        # 3.5 Formatear número
        patient_phone = f"+593{patient['telephone'].lstrip('0')}"
        print("📞 Número final del paciente:", patient_phone)

        # 3.6 Enviar WhatsApp
        print("\n📤 Enviando WhatsApp...")
        whatsapp_status = send_reservation_whatsapp(patient_phone, variables)
        print("📬 Resultado envío WhatsApp:", whatsapp_status)

        print("\n================= 🟦 FIN CREACIÓN DE CITA 🟦 =================\n")

        return {
            "message": "✅ Cita creada correctamente",
            "appointment_id": appointment_id,
            "whatsapp_status": whatsapp_status
        }

    except HTTPException as he:
        print("❗ HTTPException atrapada:", str(he.detail))
        raise he

    except Exception as e:
        print("🔥 EXCEPCIÓN NO CONTROLADA:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


#10
# 📋 Obtener todas las citas (vista recepcionista)
@app.get("/appointments")
def get_all_appointments():
    """
    Devuelve todas las citas con nombres de paciente y médico,
    combinando datos desde patients y doctors.
    """
    try:
        # 1️⃣ Obtener todas las citas
        result = (
            supabase.table("appointments")
            .select("appointment_id, patient_id, doctor_profile_id, date, time, reason, status, created_by")
            .order("date", desc=True)
            .execute()
        )

        if not result.data:
            return []

        appointments = result.data

        # 2️⃣ Obtener todos los IDs de pacientes y médicos
        patient_ids = [a["patient_id"] for a in appointments if a.get("patient_id")]
        doctor_ids = [a["doctor_profile_id"] for a in appointments if a.get("doctor_profile_id")]

        # 3️⃣ Traer pacientes
        patients_data = {}
        if patient_ids:
            patients_result = (
                supabase.table("patients")
                .select("patient_id, names, lastname, email, telephone")
                .in_("patient_id", patient_ids)
                .execute()
            )
            if patients_result.data:
                patients_data = {p["patient_id"]: p for p in patients_result.data}

        # 4️⃣ Traer médicos (tabla doctors)
        doctors_data = {}
        if doctor_ids:
            doctors_result = (
                supabase.table("doctors")
                .select("doctors_id, nombres, apellidos, correo_institucional, subespecialidad")
                .in_("doctors_id", doctor_ids)
                .execute()
            )
            if doctors_result.data:
                doctors_data = {d["doctors_id"]: d for d in doctors_result.data}

        # 5️⃣ Armar resultado final
        final_list = []
        for a in appointments:
            patient_info = patients_data.get(a["patient_id"], {})
            doctor_info = doctors_data.get(a["doctor_profile_id"], {})

            final_list.append({
                "appointment_id": a["appointment_id"],
                "date": a["date"],
                "time": a["time"],
                "reason": a.get("reason"),
                "status": a.get("status", "Pendiente"),
                "patient_name": f"{patient_info.get('names', '—')} {patient_info.get('lastname', '')}".strip(),
                "patient_email": patient_info.get("email", "—"),
                "doctor_name": f"{doctor_info.get('nombres', '(Médico no asignado)')} {doctor_info.get('apellidos', '')}".strip(),
                "doctor_email": doctor_info.get("correo_institucional", "—"),
                "doctor_subespecialidad": doctor_info.get("subespecialidad", "—"),
            })

        return final_list

    except Exception as e:
        print("❌ Error obteniendo citas:", str(e))
        raise HTTPException(status_code=500, detail=f"Error obteniendo citas: {str(e)}")


#11 👨‍⚕️ Obtener citas por médico (vista del médico)
@app.get("/appointments/doctor/{doctor_id}")
def get_appointments_by_doctor(doctor_id: int):
    try:
        result = (
            supabase.table("appointments")
            .select("appointment_id, date, time, reason, status, patient_id")
            .eq("doctor_profile_id", doctor_id)
            .order("date", desc=False)
            .execute()
        )
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo citas del médico: {str(e)}")


#12 🔄 Actualizar estado de cita
@app.put("/appointments/{appointment_id}")
def update_appointment_status(appointment_id: int, data: dict):
    try:
        updates = {
            "status": data.get("status", "pendiente"),
            "updated_at": datetime.now().isoformat(),
        }
        supabase.table("appointments").update(updates).eq("appointment_id", appointment_id).execute()
        return {"message": "✅ Cita actualizada correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error actualizando cita: {str(e)}")

#13    
@app.get("/patients/by-cedula/{doc_id}")
def get_patient_by_cedula(doc_id: str):
    try:
        result = (
            supabase.table("patients")
            .select("patient_id, names, lastname, email, telephone, doc_id")
            .eq("doc_id", doc_id)
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Paciente no encontrado.")
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al buscar paciente: {str(e)}")

#14
@app.get("/doctors")
def get_all_doctors():
    """
    Devuelve la lista de médicos (rol_id = 2) incluyendo su correo
    desde la tabla 'users', enlazando por user_profile.user_id = users.userid.
    """
    try:
        # 1️⃣ Obtener todos los perfiles de médicos
        doctors = (
            supabase.table("user_profile")
            .select("user_profile_id, name, lastname, telephone, user_id")
            .eq("rol_id", 2)
            .order("lastname", desc=False)
            .execute()
        )

        if not doctors.data:
            return []

        # 2️⃣ Obtener todos los user_id de esos médicos
        user_ids = [d["user_id"] for d in doctors.data if d.get("user_id")]

        # 3️⃣ Obtener los correos desde la tabla 'users'
        emails = {}
        if user_ids:
            users_data = (
                supabase.table("users")
                .select("userid, email")
                .in_("userid", user_ids)
                .execute()
            )
            if users_data.data:
                emails = {u["userid"]: u["email"] for u in users_data.data}

        # 4️⃣ Combinar ambos resultados
        doctors_with_email = []
        for d in doctors.data:
            doctors_with_email.append({
                "user_profile_id": d["user_profile_id"],
                "name": d["name"],
                "lastname": d["lastname"],
                "telephone": d.get("telephone"),
                "email": emails.get(d["user_id"], "—")
            })

        return doctors_with_email

    except Exception as e:
        print("❌ Error obteniendo médicos:", str(e))
        raise HTTPException(status_code=500, detail=f"Error obteniendo médicos: {str(e)}")

#15
@app.get("/user_profile/{auth_id}")
def get_user_profile_by_auth(auth_id: str):
    """
    Retorna el perfil del usuario (recepcionista, médico, etc.)
    a partir de su auth_id.
    """
    try:
        result = (
            supabase.table("user_profile")
            .select("user_profile_id, name, lastname, rol_id")
            .eq("auth_id", auth_id)
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Perfil no encontrado")
        return result.data
    except Exception as e:
        print("❌ Error obteniendo perfil:", str(e))
        raise HTTPException(status_code=500, detail=f"Error obteniendo perfil: {str(e)}")

#16
@app.get("/appointments/calendar")
def get_appointments_calendar():
    """
    Devuelve todas las citas con la información del paciente y médico (para el calendario).
    Cada evento incluye fecha, hora, nombres, estado y cédula (doc_id) del paciente.
    """
    try:
        # 1️⃣ Obtener todas las citas ordenadas por fecha
        appointments = (
            supabase.table("appointments")
            .select("appointment_id, date, time, reason, status, patient_id, doctor_profile_id")
            .order("date", desc=False)
            .execute()
        )

        if not appointments.data:
            return []

        events = []

        # 2️⃣ Procesar cada cita
        for a in appointments.data:
            # 🔹 Buscar datos del paciente
            patient = (
                supabase.table("patients")
                .select("names, lastname, doc_id")
                .eq("patient_id", a["patient_id"])
                .execute()
            )

            patient_name = (
                f"{patient.data[0]['names']} {patient.data[0]['lastname']}"
                if patient.data else "Paciente desconocido"
            )
            patient_doc = patient.data[0]["doc_id"] if patient.data else None

            # 🔹 Buscar datos del médico
            doctor = (
                supabase.table("doctors")
                .select("nombres, apellidos")
                .eq("doctors_id", a["doctor_profile_id"])
                .execute()
            )

            doctor_name = (
                f"{doctor.data[0]['nombres']} {doctor.data[0]['apellidos']}"
                if doctor.data else "Médico no asignado"
            )

            # 🔹 Limpiar la hora y construir un formato ISO válido
            date_str = str(a["date"]).split("T")[0]  # solo la fecha
            time_str = str(a["time"]).split("T")[-1].split(".")[0]  # limpia posibles errores
            if len(time_str) == 5:  # ej: "16:30"
                time_str += ":00"

            start_datetime = f"{date_str}T{time_str}"

            # 🔹 Calcular hora final (+30 minutos)
            try:
                start_dt = datetime.fromisoformat(start_datetime)
                end_dt = start_dt + timedelta(minutes=30)
                end_datetime = end_dt.isoformat()
            except Exception:
                end_datetime = start_datetime  # fallback si algo sale mal

            # 🔹 Crear evento compatible con FullCalendar
            events.append({
                "id": a["appointment_id"],
                "title": f"{patient_name} ({doctor_name})",
                "start": start_datetime,
                "end": end_datetime,
                "status": a.get("status", "Pendiente"),
                "reason": a.get("reason", ""),
                "patient_id": a["patient_id"],
                "doc_id": patient_doc,
            })

        return events

    except Exception as e:
        print("❌ Error obteniendo citas para calendario:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

#17
@app.post("/create_doctor_full")
def create_doctor_full(data: dict):
    """
    Crea un usuario con rol médico y su registro completo en la tabla 'doctors'.
    Maneja el horario de atención como JSONB.
    """
    try:
        cedula = data["cedula_profesional"]

        # 1️⃣ Validar cédula
        if not validar_cedula_ecuador(cedula):
            raise HTTPException(status_code=400, detail="❌ Cédula no válida.")

        # 2️⃣ Verificar duplicado
        existente = supabase.table("doctors").select("cedula_profesional").eq("cedula_profesional", cedula).execute()
        if existente.data:
            raise HTTPException(status_code=400, detail="⚠️ Ya existe un doctor con esta cédula profesional.")

        # 3️⃣ Crear usuario en Auth
        auth_resp = supabase.auth.admin.create_user({
            "email": data["correo_institucional"],
            "password": data["password"],
            "email_confirm": True
        })
        auth_user = auth_resp.user
        if not auth_user:
            raise HTTPException(status_code=400, detail="Error creando usuario en Auth")
        auth_id = auth_user.id

        # 4️⃣ Insertar en users
        password_hash = bcrypt.hashpw(data["password"].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user_data = {
            "username": data["correo_institucional"].split("@")[0],
            "email": data["correo_institucional"],
            "password_hash": password_hash,
            "is_active": True,
            "is_staff": False,
            "is_superuser": False,
        }
        user_insert = supabase.table("users").insert(user_data).execute()
        user_id = user_insert.data[0]["userid"]

        # 5️⃣ Crear perfil en user_profile
        profile_data = {
            "auth_id": auth_id,
            "user_id": user_id,
            "rol_id": 2,
            "id_number": cedula,
            "name": data["nombres"],
            "lastname": data["apellidos"],
            "telephone": data.get("telefono"),
            "address": data.get("direccion", "Sin dirección"),
            "birth_date": data.get("birth_date", "1900-01-01"),
        }
        supabase.table("user_profile").insert(profile_data).execute()

        # 6️⃣ Insertar en doctors
        horario_json = data.get("horario_atencion")
        if isinstance(horario_json, str):
            try:
                horario_json = json.loads(horario_json)
            except json.JSONDecodeError:
                horario_json = {}

        doctor_data = {
            "user_id": user_id,
            "cedula_profesional": cedula,
            "nombres": data["nombres"],
            "apellidos": data["apellidos"],
            "especialidad_id": data.get("especialidad_id"),
            "subespecialidad": data.get("subespecialidad"),
            "titulo_academico": data.get("titulo_academico"),
            "experiencia_anios": data.get("experiencia_anios"),
            "telefono": data.get("telefono"),
            "correo_institucional": data.get("correo_institucional"),
            "horario_atencion": horario_json,
            "firma_digital": data.get("firma_digital"),
            "direccion": data.get("direccion"),  # ✅ corregido aquí
            "created_at": datetime.now().isoformat(),
        }
        doctor_insert = supabase.table("doctors").insert(doctor_data).execute()

        return {
            "message": "✅ Doctor creado correctamente",
            "doctor_id": doctor_insert.data[0]["doctors_id"],
            "user_id": user_id
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        print("❌ Error creando doctor:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

#18
@app.get("/specialties")
def get_specialties():
    """Devuelve todas las especialidades médicas."""
    try:
        result = supabase.table("specialties").select("*").execute()
        return result.data
    except Exception as e:
        print("❌ Error obteniendo especialidades:", str(e))
        raise HTTPException(status_code=500, detail="Error al obtener especialidades")

#19
@app.get("/doctors/by_specialty/{especialidad_id}")
def get_doctors_by_specialty(especialidad_id: int):
    """
    Devuelve todos los doctores de una especialidad específica,
    incluyendo sus nombres y correos.
    """
    try:
        result = (
            supabase.table("doctors")
            .select("doctors_id, nombres, apellidos, correo_institucional, especialidad_id", "subespecialidad")
            .eq("especialidad_id", especialidad_id)
            .execute()
        )
        return result.data
    except Exception as e:
        print("❌ Error obteniendo doctores por especialidad:", str(e))
        raise HTTPException(status_code=500, detail="Error al obtener doctores por especialidad")

#20
@app.get("/patients/{patient_id}/encounters")
def get_encounters_by_patient(patient_id: int):
    """
    Devuelve todas las historias médicas (encounters) de un paciente específico,
    incluyendo datos del médico (doctors + specialties) y signos vitales.
    """
    try:
        # 1️⃣ Obtener encounters
        res = (
            supabase.table("encounters")
            .select("""
                encounter_id,
                patient_id,
                doctor_id,
                date,
                hour,
                reason_for_consultation,
                main_symptoms,
                secondary_symptoms,
                revision_organos,
                examen_fisico,
                diagnostico,
                treatment,
                observations,
                fecha_para_control,
                vital_sign_id
            """)
            .eq("patient_id", patient_id)
            .order("date", desc=True)
            .execute()
        )

        encounters = res.data or []

        if not encounters:
            return []

        # 2️⃣ Obtener doctores asociados
        doctor_ids = list({e.get("doctor_id") for e in encounters if e.get("doctor_id")})

        doctors = []
        if doctor_ids:
            dr_res = (
                supabase.table("doctors")
                .select("doctors_id, nombres, apellidos, especialidad_id, subespecialidad")
                .in_("doctors_id", doctor_ids)
                .execute()
            )
            doctors = dr_res.data or []

        doctor_dict = {d["doctors_id"]: d for d in doctors}

        # 3️⃣ Obtener especialidades
        specialty_ids = [d["especialidad_id"] for d in doctors if d.get("especialidad_id")]

        specialties = []
        if specialty_ids:
            sp_res = (
                supabase.table("specialties")
                .select("especialidad_id, name")
                .in_("especialidad_id", specialty_ids)
                .execute()
            )
            specialties = sp_res.data or []

        specialty_dict = {s["especialidad_id"]: s["name"] for s in specialties}

        # 4️⃣ Obtener signos vitales
        vital_ids = [e["vital_sign_id"] for e in encounters if e.get("vital_sign_id")]

        vitals = []
        if vital_ids:
            vt_res = (
                supabase.table("signus_vitalis")
                .select("vital_sign_id, presion_arterial, pulso_xmin, temperatura, fecha")
                .in_("vital_sign_id", vital_ids)
                .execute()
            )
            vitals = vt_res.data or []

        vital_dict = {v["vital_sign_id"]: v for v in vitals}

        # 5️⃣ Construir respuesta
        full_data = []
        for e in encounters:
            doc = doctor_dict.get(e.get("doctor_id"), {})
            vit = vital_dict.get(e.get("vital_sign_id"), {})

            especialidad_nombre = specialty_dict.get(doc.get("especialidad_id"), "—")

            full_data.append({
                "encounter_id": e["encounter_id"],
                "date": e.get("date"),
                "hour": e.get("hour"),
                "reason_for_consultation": e.get("reason_for_consultation"),
                "main_symptoms": e.get("main_symptoms"),
                "secondary_symptoms": e.get("secondary_symptoms"),
                "revision_organos": e.get("revision_organos"),
                "examen_fisico": e.get("examen_fisico"),
                "diagnostico": e.get("diagnostico"),
                "treatment": e.get("treatment"),
                "observations": e.get("observations"),
                "fecha_para_control": e.get("fecha_para_control"),

                "doctor_name": f"{doc.get('nombres','(Médico no asignado)')} {doc.get('apellidos','')}".strip(),
                "especialidad": especialidad_nombre,
                "subespecialidad": doc.get("subespecialidad","—"),

                "vital_signs": {
                    "presion_arterial": vit.get("presion_arterial", "—"),
                    "pulso_xmin": vit.get("pulso_xmin", "—"),
                    "temperatura": vit.get("temperatura", "—"),
                    "fecha": vit.get("fecha", "—"),
                }
            })

        return full_data

    except Exception as e:
        print("❌ Error obteniendo historias del paciente:", str(e))
        raise HTTPException(status_code=500, detail="Error al obtener historias del paciente")


#21
@app.get("/encounters/detail/{encounter_id}")
def get_encounter_detail(encounter_id: int):
    """
    Devuelve el detalle completo de una historia médica específica (encounter),
    incluyendo información del paciente, médico (desde doctors + specialties)
    y signos vitales.
    """
    try:
        # 1️⃣ Obtener la historia médica base
        encounter = (
            supabase.table("encounters")
            .select(
                """
                encounter_id,
                patient_id,
                doctor_id,
                date,
                hour,
                reason_for_consultation,
                main_symptoms,
                secondary_symptoms,
                revision_organos,
                examen_fisico,
                diagnostico,
                treatment,
                observations,
                fecha_para_control,
                vital_sign_id
                """
            )
            .eq("encounter_id", encounter_id)
            .single()
            .execute()
            .data
        )

        if not encounter:
            raise HTTPException(status_code=404, detail="Historia médica no encontrada")

        # 2️⃣ Obtener el médico asociado
        doctor_id = encounter.get("doctor_id")
        doctor_data = None
        specialty_name = "—"

        if doctor_id:
            doctor_result = (
                supabase.table("doctors")
                .select("doctors_id, nombres, apellidos, especialidad_id, subespecialidad")
                .eq("doctors_id", doctor_id)
                .single()
                .execute()
                .data
            )
            doctor_data = doctor_result

            # 3️⃣ Obtener nombre de la especialidad
            if doctor_data and doctor_data.get("especialidad_id"):
                specialty_result = (
                    supabase.table("specialties")
                    .select("especialidad_id, name")
                    .eq("especialidad_id", doctor_data["especialidad_id"])
                    .single()
                    .execute()
                    .data
                )
                specialty_name = specialty_result["name"]

        # 4️⃣ Obtener signos vitales (si existen)
        vital_signs = {}
        vital_id = encounter.get("vital_sign_id")
        if vital_id:
            vitals_result = (
                supabase.table("signus_vitalis")
                .select("vital_sign_id, presion_arterial, pulso_xmin, temperatura, fecha")
                .eq("vital_sign_id", vital_id)
                .single()
                .execute()
                .data
            )
            vital_signs = vitals_result or {}

        # 5️⃣ Armar respuesta consolidada
        response = {
            "encounter_id": encounter["encounter_id"],
            "date": encounter["date"],
            "hour": encounter.get("hour"),
            "reason_for_consultation": encounter.get("reason_for_consultation"),
            "main_symptoms": encounter.get("main_symptoms"),
            "secondary_symptoms": encounter.get("secondary_symptoms"),
            "revision_organos": encounter.get("revision_organos"),
            "examen_fisico": encounter.get("examen_fisico"),
            "diagnostico": encounter.get("diagnostico"),
            "treatment": encounter.get("treatment"),
            "observations": encounter.get("observations"),
            "fecha_para_control": encounter.get("fecha_para_control"),
            "doctor_name": f"{doctor_data.get('nombres', '(Médico no asignado)')} {doctor_data.get('apellidos', '')}".strip() if doctor_data else "(Médico no asignado)",
            "especialidad": specialty_name,
            "subespecialidad": doctor_data.get("subespecialidad", "—") if doctor_data else "—",
            "vital_signs": vital_signs,
        }

        return response

    except Exception as e:
        print("❌ Error obteniendo detalle de historia médica:", str(e))
        raise HTTPException(status_code=500, detail="Error al obtener detalle de historia médica")

#22
@app.get("/encounters/{patient_id}")
def get_encounters_by_patient(patient_id: int):
    """
    Devuelve todas las historias médicas asociadas a un paciente,
    incluyendo datos del médico (desde doctors + specialties)
    y de los signos vitales (desde signus_vitalis).
    """
    try:
        # 🔹 Consultar todas las historias del paciente
        encounters = (
            supabase.table("encounters")
            .select(
                "encounter_id, date, hour, reason_for_consultation, main_symptoms, treatment, observations, doctor_id, vital_sign_id"
            )
            .eq("patient_id", patient_id)
            .order("date", desc=True)
            .execute()
        )

        if not encounters.data:
            return []

        # 🔹 Obtener información de los médicos asociados
        doctors_cache = {}
        specialty_cache = {}

        # Reunir todos los doctor_id únicos
        doctor_ids = [e["doctor_id"] for e in encounters.data if e.get("doctor_id")]

        if doctor_ids:
            doctors = (
                supabase.table("doctors")
                .select("doctors_id, nombres, apellidos, especialidad_id")
                .in_("doctors_id", doctor_ids)
                .execute()
            ).data

            # Crear cache por doctors_id
            doctors_cache = {d["doctors_id"]: d for d in doctors}

            # Obtener todas las especialidades de esos doctores
            specialty_ids = [d["especialidad_id"] for d in doctors if d.get("especialidad_id")]

            if specialty_ids:
                specialties = (
                    supabase.table("specialties")
                    .select("especialidad_id, name")
                    .in_("especialidad_id", specialty_ids)
                    .execute()
                ).data

                specialty_cache = {s["especialidad_id"]: s["name"] for s in specialties}

        # 🔹 Si tiene vital_sign_id, traer signos vitales
        vital_ids = [e["vital_sign_id"] for e in encounters.data if e.get("vital_sign_id")]
        vitals_cache = {}

        if vital_ids:
            vitals = (
                supabase.table("signus_vitalis")
                .select("vital_sign_id, presion_arterial, pulso_xmin, temperatura, fecha")
                .in_("vital_sign_id", vital_ids)
                .execute()
            ).data

            vitals_cache = {v["vital_sign_id"]: v for v in vitals}

        # 🔹 Combinar todo
        for e in encounters.data:
            doc = doctors_cache.get(e.get("doctor_id"))
            if doc:
                especialidad = specialty_cache.get(doc.get("especialidad_id"), "—")
                e["doctor_name"] = f"{doc['nombres']} {doc['apellidos']}"
                e["especialidad"] = especialidad
            else:
                e["doctor_name"] = "(Médico no asignado)"
                e["especialidad"] = "—"

            if e.get("vital_sign_id"):
                e["vitals"] = vitals_cache.get(e["vital_sign_id"], {})

        return encounters.data

    except Exception as e:
        print("❌ Error al obtener historias:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

#23    
@app.get("/doctors/{doctor_id}/available-hours")
def get_available_hours(doctor_id: int, date: str):
    """
    Devuelve las horas disponibles de un médico según su horario y citas.
    Corrige formato distinto entre horas del horario ("14:30")
    y horas ocupadas ("14:30:00").
    """
    import datetime

    try:
        # 1️⃣ Obtener horario del doctor
        doctor = (
            supabase.table("doctors")
            .select("horario_atencion")
            .eq("doctors_id", doctor_id)
            .single()
            .execute()
            .data
        )

        if not doctor or not doctor.get("horario_atencion"):
            raise HTTPException(status_code=404, detail="No se encontró horario para este médico.")

        horario_json = doctor["horario_atencion"]

        # 2️⃣ Obtener día de la semana
        dias_es = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
        fecha_obj = datetime.datetime.strptime(date, "%Y-%m-%d")
        dia_semana = dias_es[fecha_obj.weekday()]

        dia_data = horario_json.get(dia_semana)
        if not dia_data or not dia_data.get("activo"):
            return {"disponible": False, "dia": dia_semana, "horas": []}

        inicio = dia_data.get("inicio")
        fin = dia_data.get("fin")

        # 3️⃣ Generar horas del día
        def generar_horas(inicio, fin):
            horas = []
            actual = datetime.datetime.strptime(inicio, "%H:%M")
            limite = datetime.datetime.strptime(fin, "%H:%M")
            while actual < limite:
                horas.append(actual.strftime("%H:%M"))
                actual += datetime.timedelta(minutes=30)
            return horas

        horas_dia = generar_horas(inicio, fin)

        # 4️⃣ Obtener citas ocupadas
        citas = (
            supabase.table("appointments")
            .select("time")
            .eq("doctor_profile_id", doctor_id)
            .eq("date", date)
            .execute()
            .data
        )

        # 🔥 CORRECCIÓN: Normaliza formatos
        horas_ocupadas = [c["time"][:5] for c in citas] if citas else []

        # 5️⃣ Filtrar disponibles
        horas_disponibles = [h for h in horas_dia if h not in horas_ocupadas]

        return {
            "disponible": len(horas_disponibles) > 0,
            "dia": dia_semana,
            "horas": horas_disponibles
        }

    except Exception as e:
        print("❌ Error obteniendo horas disponibles:", str(e))
        raise HTTPException(status_code=500, detail=f"Error obteniendo horas disponibles: {str(e)}")

#24
@app.get("/dashboard/patients/count")
def count_patients(today: bool = False):
    """
    Devuelve el número total de pacientes o solo los registrados hoy.
    GET /dashboard/patients/count?today=true
    """
    try:
        if today:
            today_start = datetime.combine(date.today(), datetime.min.time())
            tomorrow_start = today_start + timedelta(days=1)

            # ⚙️ Filtramos por rango del día
            response = (
                supabase.table("patients")
                .select("patient_id", count="exact")
                .gte("created_at", today_start.isoformat())
                .lt("created_at", tomorrow_start.isoformat())
                .execute()
            )
        else:
            response = supabase.table("patients").select("patient_id", count="exact").execute()

        return {"count": response.count or 0}

    except Exception as e:
        print("❌ Error en /dashboard/patients/count:", e)
        raise HTTPException(status_code=500, detail=f"Error al contar pacientes: {str(e)}")

#25
@app.get("/dashboard/appointments/today")
def count_appointments_today():
    """
    Devuelve la cantidad de citas programadas para la fecha actual.
    GET /dashboard/appointments/today
    """
    try:
        today_str = date.today().isoformat()

        response = (
            supabase.table("appointments")
            .select("appointment_id", count="exact")
            .eq("date", today_str)
            .execute()
        )

        return {"count": response.count or 0}

    except Exception as e:
        print("❌ Error en /dashboard/appointments/today:", e)
        raise HTTPException(status_code=500, detail=f"Error al contar citas: {str(e)}")

#26 🧩 Obtener todas las habitaciones
@app.get("/rooms")
def get_all_rooms():
    """
    Devuelve todas las habitaciones registradas.
    """
    try:
        response = supabase.table("rooms").select("*").order("room_id", desc=False).execute()
        return response.data
    except Exception as e:
        print("❌ Error al obtener habitaciones:", e)
        raise HTTPException(status_code=500, detail=f"Error al obtener habitaciones: {str(e)}")


#27 🧩 Obtener una habitación específica
@app.get("/rooms/{room_id}")
def get_room_by_id(room_id: int):
    """
    Devuelve los datos de una habitación específica.
    """
    try:
        response = supabase.table("rooms").select("*").eq("room_id", room_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Habitación no encontrada")
        return response.data[0]
    except Exception as e:
        print("❌ Error al obtener habitación:", e)
        raise HTTPException(status_code=500, detail=f"Error al obtener habitación: {str(e)}")


#28 🧩 Actualizar estado de una habitación
@app.put("/rooms/{room_id}/state")
def update_room_state(room_id: int, body: dict):
    """
    Actualiza el estado y subestado (present_state) de una habitación.
    Ejemplo body:
    {
        "state": "Ocupada",
        "present_state": "En uso"
    }
    """
    try:
        update_data = {
            "state": body.get("state"),
            "present_state": body.get("present_state"),
            "updated_at": datetime.utcnow().isoformat(),
        }
        response = supabase.table("rooms").update(update_data).eq("room_id", room_id).execute()
        return {"message": "Estado actualizado correctamente", "data": response.data}
    except Exception as e:
        print("❌ Error al actualizar habitación:", e)
        raise HTTPException(status_code=500, detail=f"Error al actualizar habitación: {str(e)}")
    
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime

#29
@app.post("/admissions")
def create_admission(body: dict):
    try:
        # ===============================
        # 1. Obtener auth_id que viene del frontend
        # ===============================
        auth_id = body.get("created_by")

        if not auth_id:
            raise HTTPException(status_code=400, detail="created_by es requerido (auth_id).")

        # ===============================
        # 2. Obtener user_id (BIGINT) desde user_profile
        # ===============================
        profile = (
            supabase.table("user_profile")
            .select("user_id")
            .eq("auth_id", auth_id)
            .single()
            .execute()
        )

        if not profile.data:
            raise HTTPException(
                status_code=404,
                detail="No existe un perfil asociado al usuario autenticado."
            )

        creator_user_id = profile.data["user_id"]

        # ===============================
        # 3. Obtener room_id desde el body
        # ===============================
        room_id = body.get("habitacion_asignada")

        if not room_id:
            raise HTTPException(status_code=400, detail="habitacion_asignada es requerida.")

        # ===============================
        # 4. Preparar datos de admisión
        # ===============================
        admission_data = {
            **body,
            "created_by": creator_user_id,  # BIGINT correcto
            "estado_ingreso": "activo",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

        # ===============================
        # 5. Insertar admisión
        # ===============================
        admission_res = (
            supabase.table("admissions")
            .insert(admission_data)
            .execute()
        )

        # ===============================
        # 6. Marcar habitación como OCUPADA
        # ===============================
        supabase.table("rooms").update({
            "state": "Ocupada",
            "present_state": "En uso",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("room_id", room_id).execute()

        return {
            "message": "Admisión creada correctamente.",
            "data": admission_res.data
        }

    except Exception as e:
        print("❌ Error al crear admisión:", e)
        raise HTTPException(status_code=500, detail=str(e))

#30
@app.get("/admissions/active")
def get_active_admissions():
    try:
        response = supabase.table("admissions").select("*").eq("estado_ingreso", "Activo").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#31
@app.put("/admissions/{admission_id}/diagnostico")
def update_diagnostico(admission_id: int, body: dict):
    try:
        res = supabase.table("admissions").update(
            {
                "diagnostico_ingreso": body.get("diagnostico_ingreso"),
                "updated_at": datetime.utcnow().isoformat()
            }
        ).eq("admission_id", admission_id).execute()

        return {"message": "Diagnóstico registrado.", "data": res.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


from fastapi import HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime


#32
@app.get("/doctors/all")
def get_all_doctors():
    """
    Retorna la lista completa de doctores registrados.
    """
    try:
        query = supabase.table("doctors").select("*").order("nombres").execute()
        return JSONResponse(content=query.data, status_code=200)
    except Exception as e:
        print("❌ Error obteniendo doctores:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

#33
@app.get("/admissions/medico/{doctor_profile_id}")
def get_admissions_by_doctor(doctor_profile_id: int):
    try:
        admissions = (
            supabase.table("admissions")
            .select("""
                admission_id,
                patient_id,
                fecha_ingreso,
                hora_ingreso,
                razon_ingreso,
                estado_ingreso,
                habitacion_asignada,
                cama_asignada,
                diagnostico_ingreso,
                patients(*)
            """)
            .eq("doctor_profile_id", doctor_profile_id)
            .eq("estado_ingreso", "activo")
            .order("fecha_ingreso")
            .execute()
        )

        return admissions.data

    except Exception as e:
        print("❌ Error hospitalizaciones:", e)
        raise HTTPException(status_code=500, detail=str(e))

#34
@app.get("/doctor/by_auth/{auth_id}")
def get_doctor_by_auth(auth_id: str):
    try:
        # 1️⃣ Obtener user_id desde user_profile
        profile = (
            supabase.table("user_profile")
            .select("user_id")
            .eq("auth_id", auth_id)
            .limit(1)
            .execute()
        )

        # Aquí profile.data es SIEMPRE una lista (vacía o con 1 elemento)
        if not profile.data:
            raise HTTPException(status_code=404, detail="Perfil no encontrado.")

        user_id = profile.data[0]["user_id"]   # ✔ CORRECTO

        # 2️⃣ Buscar doctor en la tabla REAL (doctors)
        doctor = (
            supabase.table("doctors")
            .select("doctors_id, especialidad_id")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )

        if not doctor.data:
            raise HTTPException(status_code=404, detail="Doctor no encontrado.")

        doctor_row = doctor.data[0]  # ✔ CORRECTO

        return {
            "user_id": user_id,
            "doctor_profile_id": doctor_row["doctors_id"],
            "specialty_id": doctor_row["especialidad_id"]
        }

    except HTTPException:
        raise
    except Exception as e:
        print("❌ Error doctor por auth:", e)
        raise HTTPException(status_code=500, detail="Error interno en el servidor")

#35
@app.get("/admissions/{admission_id}")
def get_admission_by_id(admission_id: int):
    try:
        adm = (
            supabase.table("admissions")
            .select("""
                *,
                patients(names, lastname, doc_id)
            """)
            .eq("admission_id", admission_id)
            .single()
            .execute()
        )

        return adm.data

    except Exception as e:
        print("❌ Error:", e)
        raise HTTPException(status_code=500, detail=str(e))
    
#36    
@app.put("/admissions/{admission_id}/alta")
def dar_alta_medica(admission_id: int, body: dict):

    motivo_alta = body.get("motivo_alta")
    if not motivo_alta:
        raise HTTPException(status_code=400, detail="motivo_alta es requerido")

    fecha = datetime.utcnow().date()
    hora = datetime.utcnow().time().replace(microsecond=0)

    try:
        # 1️⃣ Obtener datos de la admisión (especialmente la habitación)
        adm = (
            supabase.table("admissions")
            .select("habitacion_asignada")
            .eq("admission_id", admission_id)
            .single()
            .execute()
        )

        if not adm.data:
            raise HTTPException(status_code=404, detail="Admisión no encontrada.")

        room_id = adm.data["habitacion_asignada"]

        # 2️⃣ Actualizar admisión con alta médica
        supabase.table("admissions").update({
            "estado_ingreso": "alta_medica",
            "fecha_alta": str(fecha),
            "hora_alta": str(hora),
            "motivo_alta": motivo_alta
        }).eq("admission_id", admission_id).execute()

        # 3️⃣ Cambiar estado de habitación → Limpieza
        supabase.table("rooms").update({
            "state": "Limpieza",
            "present_state": "Limpieza",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("room_id", room_id).execute()

        return {"message": "Alta médica registrada y habitación marcada para limpieza."}

    except Exception as e:
        print("❌ Error en alta:", e)
        raise HTTPException(status_code=500, detail=str(e))

#37
@app.get("/admissions/by_patient/{patient_id}")
def get_admissions_by_patient(patient_id: int):
    try:
        admissions = (
            supabase.table("admissions")
            .select("""
                admission_id,
                fecha_ingreso,
                hora_ingreso,
                razon_ingreso,
                diagnostico_ingreso,
                estado_ingreso,
                habitacion_asignada,
                fecha_alta,
                hora_alta,
                motivo_alta
            """)
            .eq("patient_id", patient_id)
            .order("fecha_ingreso")
            .execute()
        )

        return admissions.data

    except Exception as e:
        print("❌ Error hospitalizaciones:", e)
        raise HTTPException(status_code=500, detail=str(e))

#38
@app.get("/encounters/patient/{patient_id}/brief")
def get_encounters_brief(patient_id: int):
    try:
        data = (
            supabase.table("encounters")
            .select("""
                encounter_id,
                date,
                doctors:doctor_id(
                    nombres,
                    apellidos,
                    especialidad_id,
                    specialties:specialties(especialidad_id, name)
                )
            """)
            .eq("patient_id", patient_id)
            .order("date", desc=True)
            .execute()
        )

        result = []

        for e in data.data:
            doctor = e.get("doctors", {})
            specialty = doctor.get("specialties", {})

            result.append({
                "encounter_id": e["encounter_id"],
                "date": e["date"],
                "doctor_name": f"{doctor.get('nombres', '')} {doctor.get('apellidos', '')}",
                "specialty": specialty.get("name", "No definida")
            })

        return result

    except Exception as e:
        print("❌ Error historial breve:", e)
        raise HTTPException(status_code=500, detail=str(e))

#39
@app.get("/appointments/calendar/{doctor_id}")
def get_calendar_by_doctor(doctor_id: int):
    """
    Retorna las citas del calendario SOLO del médico indicado.
    """
    try:
        query = (
            supabase.table("appointments")
            .select("""
                appointment_id,
                date,
                time,
                status,
                reason,
                patients(doc_id, names, lastname),
                doctors(nombres, apellidos)
            """)
            .eq("doctor_profile_id", doctor_id)
            .order("date")
            .execute()
        )

        events = []

        for a in query.data:

            # --------------------------
            # Patiente y doctor seguros
            # --------------------------
            patient = a.get("patients") or {}
            doctor = a.get("doctors") or {}

            patient_name = f"{patient.get('names', 'Paciente')} {patient.get('lastname', '')}"
            doctor_name = f"Dr. {doctor.get('nombres', '')} {doctor.get('apellidos', '')}"

            # --------------------------
            # Fecha segura
            # --------------------------
            date_val = a.get("date") or "1970-01-01"
            time_val = a.get("time") or "00:00:00"

            try:
                date_only = date_val.split("T")[0]
            except:
                date_only = "1970-01-01"

            start_iso = f"{date_only}T{time_val}"

            # --------------------------
            # Evento seguro
            # --------------------------
            events.append({
                "id": a["appointment_id"],
                "title": f"{patient_name} con {doctor_name}",
                "start": start_iso,
                "status": a.get("status"),
                "reason": a.get("reason"),
                "doc_id": patient.get("doc_id"),
                "patient_id": patient.get("doc_id"),
            })

        return events

    except Exception as e:
        print("❌ Error en calendario:", e)
        raise HTTPException(status_code=500, detail="Error interno en el servidor")


#40
##Endpoint para Examenes medicos
@app.post("/exam-orders")
def create_exam_order(body: dict):
    """
    Crea una nueva orden de exámenes vinculada a un encounter.
    """
    try:
        res = (
            supabase.table("exam_orders")
            .insert({
                "encounter_id": body["encounter_id"],
                "patient_id": body["patient_id"],
                "doctor_id": body["doctor_id"],   # ✅ CORRECTO
                "priority": body.get("prioridad", "normal"),
                "observations": body.get("observations", None),
                "created_at": datetime.utcnow().isoformat()
            })
            .execute()
        )
        return res.data[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#41
@app.get("/exam-orders/patient/{patient_id}")
def get_orders_by_patient(patient_id: int):
    try:
        res = (
            supabase.table("exam_orders")
            .select("""
                order_id,
                encounter_id,
                prioridad,
                observaciones,
                created_at,
                order_exam_items (
                    item_id,
                    status,
                    exam_type(name, description)
                )
            """)
            .eq("patient_id", patient_id)
            .order("created_at", desc=True)
            .execute()
        )
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#42
@app.get("/exam-orders/encounter/{encounter_id}")
def get_orders_by_encounter(encounter_id: int):
    try:
        res = (
            supabase.table("exam_orders")
            .select("""
                *,
                order_exam_items (
                    *,
                    exam_type(name)
                )
            """)
            .eq("encounter_id", encounter_id)
            .execute()
        )
        return res.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#43
@app.post("/exam-orders/{order_id}/items")
def add_exam_items(order_id: int, body: dict):
    """
    body = { "examtype_ids": [1, 2, 3] }
    """
    try:
        items = [
            {
                "order_id": order_id,
                "examtype_id": examtype_id,
                "status": "pendiente"
            }
            for examtype_id in body["examtype_ids"]
        ]

        res = supabase.table("order_exam_items").insert(items).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#44
@app.put("/exam-items/{item_id}/status")
def update_exam_item_status(item_id: int, body: dict):
    """
    body = { "status": "en_proceso" }
    """
    try:
        res = (
            supabase.table("order_exam_items")
            .update({"status": body["status"]})
            .eq("item_id", item_id)
            .execute()
        )
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#45
from services.twilio_service import send_lab_result_whatsapp
# o si tienes otra función, me dices el nombre exacto

@app.post("/exam-items/{item_id}/results")
def upload_exam_result(
    item_id: int,
    body: dict = Body(...)
):
    try:
        print("\n================= 🟦 INICIO SUBIDA DE RESULTADO 🟦 =================")
        print("📥 Body recibido:", body)

        # -------------------------------------------------------------------
        # 1️⃣ VALIDAR CAMPOS
        # -------------------------------------------------------------------
        if "file_url" not in body or "uploaded_by" not in body:
            raise HTTPException(
                status_code=400,
                detail="Faltan campos: file_url o uploaded_by"
            )

        file_url = body["file_url"]
        uploaded_by = int(body["uploaded_by"])

        print("🧩 item_id:", item_id)
        print("🧩 file_url:", file_url)
        print("🧩 uploaded_by:", uploaded_by)

        # -------------------------------------------------------------------
        # 2️⃣ GUARDAR RESULTADO EN SUPABASE
        # -------------------------------------------------------------------
        print("\n📝 Insertando resultado...")
        res = (
            supabase.table("exam_results")
            .insert({
                "item_id": item_id,
                "file_url": file_url,
                "uploaded_by": uploaded_by,
                "uploaded_at": datetime.utcnow().isoformat()
            })
            .execute()
        )
        print("📌 Resultado insert:", res.data)

        # -------------------------------------------------------------------
        # 3️⃣ MARCAR EL ITEM COMO COMPLETADO
        # -------------------------------------------------------------------
        print("\n🔄 Actualizando estado del item...")
        supabase.table("order_exam_items") \
            .update({"status": "completado"}) \
            .eq("item_id", item_id) \
            .execute()

        # -------------------------------------------------------------------
        # 4️⃣ OBTENER order_id
        # -------------------------------------------------------------------
        print("\n🔍 Buscando order_id...")
        query_item = (
            supabase.table("order_exam_items")
            .select("order_id")
            .eq("item_id", item_id)
            .single()
            .execute()
        )
        order_id = query_item.data["order_id"]
        print("📌 order_id encontrado:", order_id)

        # -------------------------------------------------------------------
        # 5️⃣ MARCAR LA ORDEN COMO COMPLETADA
        # -------------------------------------------------------------------
        print("\n🔄 Marcando exam_orders como completado...")
        supabase.table("exam_orders") \
            .update({"state": "completado"}) \
            .eq("order_id", order_id) \
            .execute()

        # -------------------------------------------------------------------
        # 6️⃣ OBTENER INFO PARA WHATSAPP — Paciente + Tipo examen
        # -------------------------------------------------------------------
        print("\n================= 🔍 BUSCANDO INFORMACIÓN PARA WHATSAPP =================")

       # 1️⃣ Obtener order_id + examtype_id desde item
        item_info = (
            supabase.table("order_exam_items")
            .select("order_id, examtype_id")
            .eq("item_id", item_id)
            .single()
            .execute()
        ).data

        order_id = item_info["order_id"]
        examtype_id = item_info["examtype_id"]

        # 2️⃣ Obtener NOMBRE del examen
        examtype = (
            supabase.table("exam_type")
            .select("name")
            .eq("examtype_id", examtype_id)
            .single()
            .execute()
        ).data

        exam_name = examtype["name"]

        # 3️⃣ Obtener INFO DEL PACIENTE desde exam_orders
        order_info = (
            supabase.table("exam_orders")
            .select("patients(names, lastname, telephone), patient_id")
            .eq("order_id", order_id)
            .single()
            .execute()
        ).data

        patient = order_info["patients"]
        patient_full_name = f"{patient['names']} {patient['lastname']}"
        patient_phone = patient["telephone"]

        print("👤 Paciente:", patient_full_name)
        print("📞 Teléfono:", patient_phone)
        print("🧪 Examen:", exam_name)

        # -------------------------------------------------------------------
        # 7️⃣ PREPARAR VARIABLES PARA TWILIO
        # -------------------------------------------------------------------
        variables = {
            "1": patient_full_name,
            "2": exam_name
        }

        print("📨 Variables WhatsApp:", variables)

        # Formato internacional
        phone_final = f"+593{patient_phone.lstrip('0')}"
        print("📞 Número final para Twilio:", phone_final)

        # -------------------------------------------------------------------
        # 8️⃣ ENVIAR WHATSAPP
        # -------------------------------------------------------------------
        print("\n📤 Enviando WhatsApp...")
        whatsapp_status = send_lab_result_whatsapp(phone_final, variables)
        print("📬 Resultado WhatsApp:", whatsapp_status)

        print("\n================= 🟩 FIN SUBIDA DE RESULTADO 🟩 =================\n")

        return {
            "message": "✅ Resultado registrado correctamente",
            "whatsapp_status": whatsapp_status,
            "saved_result": res.data[0]
        }

    except HTTPException as he:
        print("❗ Error HTTP:", he.detail)
        raise he

    except Exception as e:
        print("🔥 ERROR NO CONTROLADO:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

#46
@app.get("/exam-results/signed-url/{item_id}")
def get_exam_signed_url(item_id: int):
    try:
        result = (
            supabase.table("exam_results")
            .select("file_url")
            .eq("item_id", item_id)
            .single()
            .execute()
            .data
        )

        if not result:
            raise HTTPException(404, "Resultado no encontrado")

        file_url = result["file_url"]

        signed = supabase.storage\
            .from_("exam-results")\
            .create_signed_url(file_url, 60)  # 1 minuto

        return {"url": signed["signedURL"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#47
@app.get("/exam-items/{item_id}/results")
def get_exam_results(item_id: int):
    try:
        res = (
            supabase.table("exam_results")
            .select("*")
            .eq("item_id", item_id)
            .execute()
        )
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#48
@app.get("/patient/{patient_id}/exam-summary")
def get_patient_exam_summary(patient_id: int):
    try:
        res = (
            supabase.table("exam_orders")
            .select("""
                *,
                order_exam_items(
                    *,
                    exam_type(name, description),
                    exam_results(*)
                )
            """)
            .eq("patient_id", patient_id)
            .order("created_at", desc=True)
            .execute()
        )
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#49
@app.get("/lab/pendientes")
def get_pending_exams():
    try:
        res = (
            supabase.table("order_exam_items")
            .select("""
                item_id,
                status,
                exam_type(name),
                exam_orders(
                    order_id,
                    patient_id,
                    doctor_id,
                    observations,
                    patients:patient_id (
                        doc_id,
                        names,
                        lastname
                    ),
                    doctors:doctor_id (
                        doctors_id,
                        nombres,
                        apellidos
                    )
                )
            """)
            .eq("status", "pendiente")
            .execute()
        )
        return res.data

    except Exception as e:
        print("❌ Error pendientes:", e)
        raise HTTPException(status_code=500, detail=str(e))

#50
@app.get("/exam-orders/{order_id}")
def get_order_detail(order_id: int):
    try:
        res = (
            supabase.table("exam_orders")
            .select("""
                *,
                order_exam_items(
                    *,
                    exam_type(name, description),
                    exam_results(*)
                )
            """)
            .eq("order_id", order_id)
            .single()
            .execute()
        )
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#51
@app.get("/exam-types")
def get_exam_types():
    """
    Retorna todos los tipos de exámenes disponibles.
    """
    try:
        res = (
            supabase.table("exam_type")
            .select("*")
            .order("examtype_id")
            .execute()
        )
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#52
@app.get("/exam-types/{examtype_id}")
def get_exam_type(examtype_id: int):
    """
    Retorna un tipo de examen específico por ID.
    """
    try:
        res = (
            supabase.table("exam_type")
            .select("*")
            .eq("examtype_id", examtype_id)
            .single()
            .execute()
        )
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#53
@app.post("/exam-types")
def create_exam_type(body: dict):
    """
    Crear un nuevo tipo de examen (solo admin).
    body = { name, description }
    """
    try:
        res = (
            supabase.table("exam_type")
            .insert({
                "name": body["name"],
                "description": body.get("description"),
            })
            .execute()
        )
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#54
@app.put("/exam-types/{examtype_id}")
def update_exam_type(examtype_id: int, body: dict):
    """
    Actualizar un tipo de examen existente.
    """
    try:
        res = (
            supabase.table("exam_type")
            .update({
                "name": body.get("name"),
                "description": body.get("description")
            })
            .eq("examtype_id", examtype_id)
            .execute()
        )
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#55
@app.delete("/exam-types/{examtype_id}")
def delete_exam_type(examtype_id: int):
    """
    Eliminar un tipo de examen.
    """
    try:
        supabase.table("exam_type").delete().eq("examtype_id", examtype_id).execute()
        return {"message": "Tipo de examen eliminado"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
#56
@app.get("/encounters/{encounter_id}/exam-context")
def get_exam_context(encounter_id: int):
    """
    Devuelve datos necesarios para crear una orden de examen:
    - paciente
    - doctor
    - encounter básico
    """
    try:
        data = (
            supabase.table("encounters")
            .select("""
                encounter_id,
                date,
                hour,
                reason_for_consultation,

                patient_id,
                doctor_id,

                patients(
                    patient_id,
                    doc_id,
                    names,
                    lastname
                ),

                doctors(
                    doctors_id,
                    nombres,
                    apellidos,
                    user_id
                )
            """)
            .eq("encounter_id", encounter_id)
            .single()
            .execute()
            .data
        )

        if not data:
            raise HTTPException(status_code=404, detail="Encounter no encontrado")

        patient = data.get("patients", {})
        doctor = data.get("doctors", {})

        return {
            "encounter_id": data["encounter_id"],
            "date": data.get("date"),
            "hour": data.get("hour"),
            "reason_for_consultation": data.get("reason_for_consultation"),

            # Paciente
            "patient_id": patient.get("patient_id"),
            "patient_name": f"{patient.get('names','')} {patient.get('lastname','')}",

            # Doctor
            "doctor_id": data.get("doctor_id"),
            "doctor_name": f"{doctor.get('nombres','')} {doctor.get('apellidos','')}",
            "user_id": doctor.get("user_id"),   # por si lo usas luego
        }

    except Exception as e:
        print("❌ Error en exam-context:", str(e))
        raise HTTPException(status_code=500, detail="Error obteniendo datos para orden de examen")

#57
@app.get("/exam-orders/{order_id}")
def get_single_order(order_id: int):
    try:
        res = (
            supabase.table("exam_orders")
            .select("""
                order_id,
                encounter_id,
                patient_id,
                doctor_id,
                priority,
                observations,
                application_date,
                created_at,
                patients (names, lastname),
                doctors (nombres, apellidos),
                order_exam_items (
                    item_id,
                    status,
                    exam_type(name),
                    exam_results(*)
                )
            """)
            .eq("order_id", order_id)
            .single()
            .execute()
        )

        data = res.data

        return {
            "order_id": data["order_id"],
            "encounter_id": data["encounter_id"],
            "priority": data.get("priority"),
            "observations": data.get("observations"),
            "application_date": data.get("application_date"),

            "patient_name": f"{data['patients']['names']} {data['patients']['lastname']}"
                if data.get("patients") else "—",

            "doctor_name": f"{data['doctors']['nombres']} {data['doctors']['apellidos']}"
                if data.get("doctors") else "—",

            "items": [
                {
                    "item_id": item["item_id"],
                    "status": item["status"],
                    "exam_type_name": item["exam_type"]["name"],
                    "results": item.get("exam_results", [])
                }
                for item in data["order_exam_items"]
            ]
        }

    except Exception as e:
        print("❌ Error get_single_order:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
    
#58
@app.get("/exam-orders/detail/{order_id}")
def get_exam_order_detail(order_id: int):
    """
    Devuelve toda la información completa de una orden de examen:
    - Paciente
    - Doctor
    - Especialidad
    - Ítems y tipo de examen
    """
    try:
        # 1️⃣ Obtener la orden con paciente + doctor + items
        raw = (
            supabase.table("exam_orders")
            .select("""
                order_id,
                encounter_id,
                patient_id,
                doctor_id,
                priority,
                observations,
                created_at,

                patients:patient_id (
                    patient_id,
                    doc_id,
                    names,
                    lastname
                ),

                doctors:doctor_id (
                    doctors_id,
                    nombres,
                    apellidos,
                    especialidad_id,
                    subespecialidad
                ),

                order_exam_items (
                    item_id,
                    status,
                    exam_type (
                        name,
                        description
                    )
                )
            """)
            .eq("order_id", order_id)
            .single()
            .execute()
            .data
        )

        if not raw:
            raise HTTPException(status_code=404, detail="Orden no encontrada")

        # 2️⃣ Obtener la ESPECIALIDAD del doctor (consulta aparte)
        specialty_name = "—"
        doctor = raw.get("doctors", {})

        especialidad_id = doctor.get("especialidad_id")
        if especialidad_id:
            spec = (
                supabase.table("specialties")
                .select("name")
                .eq("especialidad_id", especialidad_id)
                .single()
                .execute()
                .data
            )
            if spec:
                specialty_name = spec["name"]

        # 3️⃣ Preparar items
        items = []
        for item in raw.get("order_exam_items", []):
            items.append({
                "item_id": item["item_id"],
                "status": item["status"],
                "exam_type_name": item["exam_type"]["name"],
                "exam_type_description": item["exam_type"]["description"]
            })

        # 4️⃣ Respuesta armada
        patient = raw.get("patients", {})
        doctor = raw.get("doctors", {})

        return {
            "order_id": raw["order_id"],
            "encounter_id": raw["encounter_id"],
            "created_at": raw["created_at"],
            "priority": raw.get("priority"),
            "observations": raw.get("observations"),

            # Paciente
            "patient_id": patient.get("patient_id"),
            "patient_doc_id": patient.get("doc_id"),
            "patient_name": f"{patient.get('names','')} {patient.get('lastname','')}".strip(),

            # Doctor
            "doctor_id": doctor.get("doctors_id"),
            "doctor_name": f"{doctor.get('nombres','')} {doctor.get('apellidos','')}".strip(),
            "especialidad": specialty_name,
            "subespecialidad": doctor.get("subespecialidad", "—"),

            # Items
            "items": items
        }

    except Exception as e:
        print("❌ Error en get_exam_order_detail:", e)
        raise HTTPException(status_code=500, detail=str(e))

#59
@app.get("/lab/item/{item_id}")
def get_lab_item(item_id: int):
    try:
        # 1️⃣ Consulta base (sin specialties)
        raw = (
            supabase.table("order_exam_items")
            .select("""
                item_id,
                status,

                exam_type(name, description),

                exam_results(
                    file_url,
                    uploaded_at
                ),

                exam_orders(
                    order_id,
                    observations,
                    patient_id,
                    doctor_id,

                    patients:patient_id (
                        doc_id,
                        names,
                        lastname
                    ),

                    doctors:doctor_id (
                        doctors_id,
                        nombres,
                        apellidos,
                        especialidad_id,
                        subespecialidad
                    )
                )
            """)
            .eq("item_id", item_id)
            .single()
            .execute()
            .data
        )

        if not raw:
            raise HTTPException(status_code=404, detail="Item no encontrado")

        order = raw["exam_orders"]
        patient = order["patients"]
        doctor = order["doctors"]

        # 2️⃣ Obtener especialidad en una segunda consulta
        specialty_name = "—"
        if doctor.get("especialidad_id"):
            spec = (
                supabase.table("specialties")
                .select("name")
                .eq("especialidad_id", doctor["especialidad_id"])
                .single()
                .execute()
                .data
            )
            if spec:
                specialty_name = spec["name"]

        # 3️⃣ URL firmada para el archivo si existe
        result_url = None
        if raw.get("exam_results"):
            file_url = raw["exam_results"][0]["file_url"]

            signed = supabase.storage \
                .from_("exam-results") \
                .create_signed_url(file_url, 60)  # 1 minuto

            result_url = signed.get("signedURL")

        # 4️⃣ Armar respuesta final
        return {
            "item_id": raw["item_id"],
            "status": raw["status"],

            # examen
            "exam_type_name": raw["exam_type"]["name"],
            "exam_type_description": raw["exam_type"]["description"],

            # paciente
            "patient_name": f"{patient['names']} {patient['lastname']}",
            "patient_doc_id": patient["doc_id"],

            # doctor
            "doctor_name": f"{doctor['nombres']} {doctor['apellidos']}",
            "especialidad": specialty_name,
            "subespecialidad": doctor.get("subespecialidad", "—"),

            # resultado
            "result_url": result_url
        }

    except Exception as e:
        print("❌ Error get_lab_item:", e)
        raise HTTPException(status_code=500, detail=str(e))

#60
@app.get("/lab/completados")
def get_completed_exams(
    date: str | None = None,
    examtype: str | None = None,
    patient: str | None = None,
    doctor: str | None = None
):
    try:
        # --------------------------
        # 1️⃣ Buscar examtype_id por nombre
        # --------------------------
        examtype_ids = None
        if examtype:
            types_res = (
                supabase.table("exam_type")
                .select("examtype_id")
                .ilike("name", f"%{examtype}%")
                .execute()
            )
            examtype_ids = [t["examtype_id"] for t in types_res.data]

        # --------------------------
        # 2️⃣ Filtrar por paciente → obtener order_id reales
        # --------------------------
        order_ids_from_patient = None
        if patient:
            patients_res = (
                supabase.table("patients")
                .select("patient_id")
                .ilike("names", f"%{patient}%")
                .execute()
            )
            patient_ids = [p["patient_id"] for p in patients_res.data]

            if patient_ids:
                orders_res = (
                    supabase.table("exam_orders")
                    .select("order_id")
                    .in_("patient_id", patient_ids)
                    .execute()
                )
                order_ids_from_patient = [o["order_id"] for o in orders_res.data]
            else:
                return []

        # --------------------------
        # 3️⃣ Filtrar por doctor → obtener order_id reales
        # --------------------------
        order_ids_from_doctor = None
        if doctor:
            doctors_res = (
                supabase.table("doctors")
                .select("doctors_id")
                .ilike("nombres", f"%{doctor}%")
                .execute()
            )
            doctor_ids = [d["doctors_id"] for d in doctors_res.data]

            if doctor_ids:
                orders_res = (
                    supabase.table("exam_orders")
                    .select("order_id")
                    .in_("doctor_id", doctor_ids)
                    .execute()
                )
                order_ids_from_doctor = [o["order_id"] for o in orders_res.data]
            else:
                return []

        # --------------------------
        # 4️⃣ Consulta base
        # --------------------------
        query = (
            supabase.table("order_exam_items")
            .select(
                """
                item_id,
                examtype_id,
                exam_type(name),
                exam_results(file_url, uploaded_at),
                exam_orders:order_id(
                    doctors(nombres, apellidos),
                    patients(names, lastname)
                )
            """
            )
            .eq("status", "completado")
        )

        # --------------------------
        # 5️⃣ APLICAR FILTROS
        # --------------------------
        if date:
            query = query.filter("exam_results.uploaded_at", "ilike", f"%{date}%")

        if examtype and examtype_ids:
            query = query.in_("examtype_id", examtype_ids)

        if order_ids_from_patient:
            query = query.in_("order_id", order_ids_from_patient)

        if order_ids_from_doctor:
            query = query.in_("order_id", order_ids_from_doctor)

        res = query.execute()

        return res.data

    except Exception as e:
        print("❌ Error completados:", e)
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/exam-categories")
def get_exam_categories():
    try:
        res = (
            supabase
            .table("exam_category")
            .select("category_id, name")
            .order("name")
            .execute()
        )

        # 🔥 Convertir APIResponse → dict
        res = res.model_dump()

        # Manejo de error
        if res.get("error"):
            raise HTTPException(status_code=400, detail=res["error"]["message"])

        return res.get("data", [])

    except Exception as e:
        print("❌ Error cargando categorías:", e)
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/lab/pendientes/filtrar")
def get_pending_filtered(
    examtype: str | None = None,
    patient: str | None = None,
    doctor: str | None = None,
):
    try:
        # --------------------------
        # 1️⃣ Buscar examtype_id
        # --------------------------
        examtype_ids = None
        if examtype:
            types_res = supabase.table("exam_type")\
                .select("examtype_id")\
                .ilike("name", f"%{examtype}%")\
                .execute()
            examtype_ids = [t["examtype_id"] for t in types_res.data]

        # --------------------------
        # 2️⃣ Buscar patient_id → order_id
        # --------------------------
        order_ids_from_patient = None
        if patient:
            patients_res = supabase.table("patients")\
                .select("patient_id")\
                .ilike("names", f"%{patient}%")\
                .execute()
            patient_ids = [p["patient_id"] for p in patients_res.data]

            if patient_ids:
                orders_res = supabase.table("exam_orders")\
                    .select("order_id, patient_id")\
                    .in_("patient_id", patient_ids)\
                    .execute()
                order_ids_from_patient = [o["order_id"] for o in orders_res.data]
            else:
                return []

        # --------------------------
        # 3️⃣ Buscar doctor_id → order_id
        # --------------------------
        order_ids_from_doctor = None
        if doctor:
            doctors_res = supabase.table("doctors")\
                .select("doctors_id")\
                .ilike("nombres", f"%{doctor}%")\
                .execute()
            doctor_ids = [d["doctors_id"] for d in doctors_res.data]

            if doctor_ids:
                orders_res = supabase.table("exam_orders")\
                    .select("order_id, doctor_id")\
                    .in_("doctor_id", doctor_ids)\
                    .execute()
                order_ids_from_doctor = [o["order_id"] for o in orders_res.data]
            else:
                return []

        # --------------------------
        # 4️⃣ Consulta base
        # --------------------------
        query = supabase.table("order_exam_items").select("""
            item_id,
            exam_type(name),
            exam_orders(
                order_id,
                observations,
                doctors(nombres, apellidos),
                patients(names, lastname, doc_id)
            )
        """).eq("status", "pendiente")

        # --------------------------
        # 5️⃣ Aplicar filtros reales
        # --------------------------
        if examtype and examtype_ids:
            query = query.in_("examtype_id", examtype_ids)

        if order_ids_from_patient:
            query = query.in_("order_id", order_ids_from_patient)

        if order_ids_from_doctor:
            query = query.in_("order_id", order_ids_from_doctor)

        res = query.execute()
        return res.data

    except Exception as e:
        print("❌ Error:", e)
        raise HTTPException(status_code=500, detail=str(e))

#Endpoint IA
@app.post("/ai/suggest/{encounter_id}")
def ai_suggest(encounter_id: int):
    encounter = supabase.table("encounters").select("*") \
        .eq("encounter_id", encounter_id).single().execute().data

    if not encounter:
        raise HTTPException(404, "Encounter no encontrado")

    if not encounter.get("embedding"):
        raise HTTPException(400, "Encounter sin embedding")

    matches = supabase.rpc("match_encounters", {
        "query_embedding": encounter["embedding"],
        "match_count": 5,
        "min_similarity": 0.35
    }).execute().data

    similar_ids = [m["encounter_id"] for m in matches]
    similar_cases = supabase.table("encounters").select(
        "encounter_id, diagnostico, treatment, observations"
    ).in_("encounter_id", similar_ids).execute().data

    payload = {
        "current_case": encounter["embedding_text"],
        "similar_cases": similar_cases
    }

    recommendation = call_agent(payload)

    return {"recommendation": recommendation}


#endpoint para ayuda durante la creacion
@app.post("/ai/analyze-draft")
def ai_analyze_draft(data: dict):
    """
    Analiza un borrador de historia clínica (NO persistido)
    para apoyar al médico durante la redacción.
    """

    # 1️⃣ Construir texto clínico del borrador
    draft_text_parts = [
        f"Motivo de consulta: {data.get('reason_for_consultation','')}",
        f"Síntomas principales: {data.get('main_symptoms','')}",
        f"Síntomas secundarios: {data.get('secondary_symptoms','')}",
        f"Revisión de órganos: {data.get('revision_organos','')}",
        f"Examen físico: {data.get('examen_fisico','')}",
        f"Diagnóstico preliminar: {data.get('diagnostico','')}",
    ]

    draft_text = "\n".join([p for p in draft_text_parts if p.strip()])

    if len(draft_text) < 30:
        raise HTTPException(
            status_code=400,
            detail="Información clínica insuficiente para análisis IA"
        )

    # 2️⃣ Crear embedding del borrador
    draft_embedding = create_embedding(draft_text)

    # 3️⃣ Buscar casos similares históricos
    matches = supabase.rpc("match_encounters", {
        "query_embedding": draft_embedding,
        "match_count": 5,
        "min_similarity": 0.35
    }).execute().data or []

    similar_cases = []
    if matches:
        ids = [m["encounter_id"] for m in matches]
        rows = supabase.table("encounters").select(
            "encounter_id, diagnostico, treatment, observations"
        ).in_("encounter_id", ids).execute().data or []

        sim_map = {m["encounter_id"]: m["similarity"] for m in matches}
        for r in rows:
            r["similarity"] = sim_map.get(r["encounter_id"])
            similar_cases.append(r)

    # 4️⃣ Construir payload para el agente IA
    payload = {
        "current_case": draft_text,
        "similar_cases": similar_cases
    }

    # 5️⃣ Llamar al agente (Structured Outputs)
    recommendation = call_agent(payload)

    return {
        "draft_analysis": recommendation,
        "similar_cases_found": len(similar_cases)
    }


#Espera a twilio para creacion
from utils.phone import normalizar_telefono_ec
from utils.validaciones import validar_documento

@app.post("/create_user_request")
def create_user_request(user: UserCreate):
    print("📦 SUPABASE URL (create_user_request):", SUPABASE_URL)

    # 1️⃣ VALIDACIÓN PREVIA
    validar_documento(user.tipo_documento, user.id_number)

    # 2️⃣ NORMALIZAR TELÉFONO
    telefono = normalizar_telefono_ec(user.telephone)

    # 3️⃣ EXPIRAR PENDINGS ANTERIORES (CLAVE)
    supabase.table("pending_users").update({
        "status": "expired"
    }).eq("phone", telefono).eq("status", "pending").execute()

    # 4️⃣ CREAR NUEVO PENDING
    pending = supabase.table("pending_users").insert({
        "phone": telefono,
        "payload": user.dict(),
        "status": "pending",
        "consentimiento_tipo": "digital"
    }).execute()

    pending_id = pending.data[0]["id"]

    # 5️⃣ ENVIAR WHATSAPP
    enviado = enviar_consentimiento_simple(
        numero=telefono,
        pending_id=pending_id
    )

    if not enviado:
        raise HTTPException(
            status_code=500,
            detail="No se pudo enviar WhatsApp"
        )

    return {
        "message": "Solicitud enviada. Esperando aceptación del paciente.",
        "pending_id": pending_id
    }

@app.get("/pending_status/{pending_id}")
def get_pending_status(pending_id: str):
    res = supabase.table("pending_users") \
        .select("status") \
        .eq("id", pending_id) \
        .single() \
        .execute()

    return {"status": res.data["status"]}
