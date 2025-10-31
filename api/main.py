from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from supabase import create_client
import os
from dotenv import load_dotenv
from typing import Annotated
import bcrypt
from fastapi import Body
from datetime import datetime

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
