from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from supabase import create_client
import os
from dotenv import load_dotenv
from typing import Annotated
import bcrypt
from fastapi import Body
from datetime import datetime, timedelta

from fastapi.responses import JSONResponse

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

app = FastAPI()

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
    id_number: Annotated[str, Field(min_length=10, max_length=10, pattern=r'^\d{10}$')]
    name: Annotated[str, Field(min_length=2)]
    lastname: Annotated[str, Field(min_length=2)]
    email: EmailStr
    password: Annotated[str, Field(min_length=6)]
    telephone: Annotated[str, Field(pattern=r'^\d{10}$')]
    address: Annotated[str, Field(min_length=5)]
    birth_date: Annotated[str, Field(pattern=r'^\d{4}-\d{2}-\d{2}$')]
    rol_id: int


@app.post("/create_user")
def create_user(user: UserCreate):
    try:
        #  Validar cédula
        if not validar_cedula_ecuador(user.id_number):
            raise HTTPException(status_code=400, detail="❌ Cédula ecuatoriana no válida.")

        #  Verificar duplicado
        existente = supabase.table("user_profile").select("id_number").eq("id_number", user.id_number).execute()
        if existente.data:
            raise HTTPException(status_code=400, detail="⚠️ Esta cédula ya está registrada.")

        # Crear usuario en Auth
        auth_resp = supabase.auth.admin.create_user({
            "email": user.email,
            "password": user.password,
            "email_confirm": True
        })
        auth_user = auth_resp.user
        if not auth_user:
            raise HTTPException(status_code=400, detail="Error creando usuario en Auth")

        auth_id = auth_user.id

        #  Insertar en users
        password_hash = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user_data = {
            "username": user.email.split("@")[0],
            "email": user.email,
            "password_hash": password_hash,
            "is_active": True,
            "is_staff": False,
            "is_superuser": False,
        }
        user_insert = supabase.table("users").insert(user_data).execute()
        user_id = user_insert.data[0]["userid"] if user_insert.data else None

        # Insertar en user_profile
        profile_data = {
            "auth_id": auth_id,
            "user_id": user_id,
            "rol_id": user.rol_id,
            "id_number": user.id_number,
            "name": user.name,
            "lastname": user.lastname,
            "telephone": user.telephone,
            "address": user.address,
            "birth_date": user.birth_date
        }
        profile_insert = supabase.table("user_profile").insert(profile_data).execute()

        #  Si es paciente, insertar en patients
        if user.rol_id == 6:  # Paciente
            patient_data = {
                "doc_id": user.id_number,  # cédula
                "names": user.name,
                "lastname": user.lastname,
                "birth_date": user.birth_date,
                "address": user.address,
                "telephone": user.telephone,
                "email": user.email,
                # Campos clínicos aún vacíos
                "entry_date": None,
                "entry_hour": None,
                "discharge_date": None,
                "discharge_hour": None,
                "personal_history": None,
                "family_history": None,
                "allergy": None,
                "common_medicines": None,
                "blood_type": None,
                "parroquia": None,
                "ciudad": None,
                "provincia": None,
                "genre": None,
            }
            supabase.table("patients").insert(patient_data).execute()

        return {"message": "✅ Usuario y paciente creados correctamente", "auth_id": auth_id, "user_id": user_id}

    except HTTPException as he:
        raise he
    except Exception as e:
        print("❌ Error:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
    
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
    

@app.post("/encounters")
def create_encounter(data: dict):
    """
    Crea una nueva historia médica (encounter) junto a signos vitales vinculados.
    """
    try:
        print(" Datos recibidos:", data)

        #  Crear la historia sin vital_sign_id aún
        encounter_data = {
            "patient_id": int(data["patient_id"]),
            "doctor_profile_id": int(data["doctor_profile_id"]),
            "reason_for_consultation": data.get("reason_for_consultation"),
            "main_symptoms": data.get("main_symptoms"),
            "secondary_symptoms": data.get("secondary_symptoms"),
            "treatment": data.get("treatment"),
            "observations": data.get("observations"),

            # 🩺 Campos clínicos nuevos
            "diagnostico": data.get("diagnostico"),
            "revision_organos": data.get("revision_organos"),
            "fecha_para_control": data.get("fecha_para_control"),

            #  Metadatos automáticos
            "date": datetime.now().date().isoformat(),
            "hour": datetime.now().time().strftime("%H:%M:%S"),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }

        result_encounter = supabase.table("encounters").insert(encounter_data).execute()

        if not result_encounter.data:
            raise HTTPException(status_code=400, detail="Error creando historia médica.")

        encounter_id = result_encounter.data[0]["encounter_id"]

        # Si se mandan signos vitales, crearlos y vincularlos
        vitals_data = data.get("vitals")
        if vitals_data:
            vital_record = {
                "encounter_id": encounter_id,
                "fecha": datetime.now().date().isoformat(),
                "presion_arterial": vitals_data.get("presion_arterial"),
                "pulso_xmin": vitals_data.get("pulso_xmin"),
                "temperatura": vitals_data.get("temperatura"),
            }

            result_vital = supabase.table("signus_vitalis").insert(vital_record).execute()

            if not result_vital.data:
                raise HTTPException(status_code=400, detail="Error creando signos vitales.")

            vital_sign_id = result_vital.data[0]["vital_sign_id"]

            #  Actualizar la historia con la FK de signos vitales
            supabase.table("encounters").update({"vital_sign_id": vital_sign_id}).eq("encounter_id", encounter_id).execute()

        return {"message": "✅ Historia y signos vitales creados correctamente", "encounter_id": encounter_id}

    except Exception as e:
        print("❌ Error creando historia médica:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


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

@app.get("/encounters/{patient_id}")
def get_encounters_by_patient(patient_id: int):
    """
    Devuelve todas las historias médicas asociadas a un paciente.
    Incluye datos básicos del médico y de los signos vitales si existen.
    """
    try:
        # Consultar todas las historias del paciente
        encounters = (
            supabase.table("encounters")
            .select(
                "encounter_id, date, hour, reason_for_consultation, main_symptoms, treatment, observations, doctor_profile_id, vital_sign_id"
            )
            .eq("patient_id", patient_id)
            .order("date", desc=True)
            .execute()
        )

        if not encounters.data:
            return []

        #  Si cada historia tiene un doctor_profile_id, obtener sus nombres
        doctors_cache = {}
        for e in encounters.data:
            doc_id = e.get("doctor_profile_id")
            if doc_id and doc_id not in doctors_cache:
                doctor = (
                    supabase.table("user_profile")
                    .select("name, lastname")
                    .eq("user_profile_id", doc_id)
                    .execute()
                )
                if doctor.data:
                    doctors_cache[doc_id] = f"{doctor.data[0]['name']} {doctor.data[0]['lastname']}"
                else:
                    doctors_cache[doc_id] = "Desconocido"
            e["doctor_name"] = doctors_cache.get(doc_id, "Desconocido")

        #  Si tiene vital_sign_id, traer signos vitales
        for e in encounters.data:
            vital_id = e.get("vital_sign_id")
            if vital_id:
                vitals = (
                    supabase.table("signus_vitalis")
                    .select("presion_arterial, pulso_xmin, temperatura, fecha")
                    .eq("vital_sign_id", vital_id)
                    .execute()
                )
                if vitals.data:
                    e["vitals"] = vitals.data[0]

        return encounters.data

    except Exception as e:
        print("❌ Error al obtener historias:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
    
@app.get("/encounters/detail/{encounter_id}")
def get_encounter_detail(encounter_id: int):
    """
    Devuelve el detalle completo de una historia médica específica (encounter),
    incluyendo diagnóstico, revisión de órganos, próxima fecha de control,
    signos vitales y la información del médico tratante.
    """
    try:
        #  Obtener todos los campos, incluyendo los nuevos
        encounter = (
            supabase.table("encounters")
            .select(
                "encounter_id, date, hour, reason_for_consultation, main_symptoms, secondary_symptoms, "
                "revision_organos, diagnostico, treatment, observations, fecha_para_control, "
                "doctor_profile_id, vital_sign_id"
            )
            .eq("encounter_id", encounter_id)
            .single()
            .execute()
        )

        if not encounter.data:
            raise HTTPException(status_code=404, detail="Historia no encontrada")

        data = encounter.data

        #  Obtener nombre del médico tratante
        doctor = (
            supabase.table("user_profile")
            .select("name, lastname")
            .eq("user_profile_id", data["doctor_profile_id"])
            .execute()
        )
        if doctor.data:
            data["doctor_name"] = f"{doctor.data[0]['name']} {doctor.data[0]['lastname']}"
        else:
            data["doctor_name"] = "Desconocido"

        #  Obtener signos vitales si existen
        if data.get("vital_sign_id"):
            vitals = (
                supabase.table("signus_vitalis")
                .select("presion_arterial, pulso_xmin, temperatura, fecha")
                .eq("vital_sign_id", data["vital_sign_id"])
                .execute()
            )
            if vitals.data:
                data["vitals"] = vitals.data[0]
            else:
                data["vitals"] = None
        else:
            data["vitals"] = None

        return data

    except Exception as e:
        print("❌ Error al obtener detalle de historia:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.post("/appointments")
def create_appointment(data: dict):
    """
    Crea una nueva cita verificando disponibilidad del médico.
    """
    try:
        patient_id = int(data["patient_id"])
        doctor_profile_id = int(data["doctor_profile_id"])
        created_by = int(data["created_by"])
        date = data["date"]
        time = data["time"]
        reason = data.get("reason", "")

        # 🔍 Verificar si ya existe una cita del mismo médico en la misma fecha y hora
        existing = (
            supabase.table("appointments")
            .select("appointment_id")
            .eq("doctor_profile_id", doctor_profile_id)
            .eq("date", date)
            .eq("time", time)
            .execute()
        )

        if existing.data:
            raise HTTPException(
                status_code=400,
                detail="⚠️ El médico ya tiene una cita programada en esa fecha y hora."
            )

        # ✅ Crear la nueva cita
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

        result = supabase.table("appointments").insert(appointment_data).execute()

        if not result.data:
            raise HTTPException(status_code=400, detail="Error creando cita médica.")

        return {"message": "✅ Cita creada correctamente", "appointment_id": result.data[0]["appointment_id"]}

    except HTTPException as he:
        raise he
    except Exception as e:
        print("❌ Error creando cita:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


# 📋 Obtener todas las citas (vista recepcionista)
@app.get("/appointments")
def get_all_appointments():
    """
    Devuelve todas las citas con nombres de paciente y médico
    combinando datos desde las tablas patients, user_profile y users.
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

        # 4️⃣ Traer perfiles de médicos
        doctors_data = {}
        user_ids = []
        if doctor_ids:
            doctors_result = (
                supabase.table("user_profile")
                .select("user_profile_id, name, lastname, telephone, user_id")
                .in_("user_profile_id", doctor_ids)
                .execute()
            )
            if doctors_result.data:
                doctors_data = {d["user_profile_id"]: d for d in doctors_result.data}
                user_ids = [d["user_id"] for d in doctors_result.data if d.get("user_id")]

        # 5️⃣ Traer correos de médicos desde users
        doctor_emails = {}
        if user_ids:
            users_result = (
                supabase.table("users")
                .select("userid, email")
                .in_("userid", user_ids)
                .execute()
            )
            if users_result.data:
                doctor_emails = {u["userid"]: u["email"] for u in users_result.data}

        # 6️⃣ Armar resultado final
        final_list = []
        for a in appointments:
            patient_info = patients_data.get(a["patient_id"], {})
            doctor_info = doctors_data.get(a["doctor_profile_id"], {})
            email_doc = doctor_emails.get(doctor_info.get("user_id"), "—")

            final_list.append({
                "appointment_id": a["appointment_id"],
                "date": a["date"],
                "time": a["time"],
                "reason": a.get("reason"),
                "status": a.get("status", "Pendiente"),
                "patient_name": f"{patient_info.get('names', '—')} {patient_info.get('lastname', '')}".strip(),
                "patient_email": patient_info.get("email", "—"),
                "doctor_name": f"{doctor_info.get('name', '—')} {doctor_info.get('lastname', '')}".strip(),
                "doctor_email": email_doc,
            })

        return final_list

    except Exception as e:
        print("❌ Error obteniendo citas:", str(e))
        raise HTTPException(status_code=500, detail=f"Error obteniendo citas: {str(e)}")

# 👨‍⚕️ Obtener citas por médico (vista del médico)
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


# 🔄 Actualizar estado de cita
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
                supabase.table("user_profile")
                .select("name, lastname")
                .eq("user_profile_id", a["doctor_profile_id"])
                .execute()
            )

            doctor_name = (
                f"{doctor.data[0]['name']} {doctor.data[0]['lastname']}"
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
