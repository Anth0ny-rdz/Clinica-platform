from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from supabase import create_client
import os
from dotenv import load_dotenv
from typing import Annotated
import bcrypt

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
        # ✅ Validar cédula
        if not validar_cedula_ecuador(user.id_number):
            raise HTTPException(status_code=400, detail="❌ Cédula ecuatoriana no válida.")

        # 🔍 Verificar duplicado
        existente = supabase.table("user_profile").select("id_number").eq("id_number", user.id_number).execute()
        if existente.data:
            raise HTTPException(status_code=400, detail="⚠️ Esta cédula ya está registrada.")

        # 1️⃣ Crear usuario en Auth
        auth_resp = supabase.auth.admin.create_user({
            "email": user.email,
            "password": user.password,
            "email_confirm": True
        })
        auth_user = auth_resp.user
        if not auth_user:
            raise HTTPException(status_code=400, detail="Error creando usuario en Auth")

        auth_id = auth_user.id

        # 2️⃣ Insertar en users
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

        # 3️⃣ Insertar en user_profile
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

        # 4️⃣ Si es paciente, insertar en patients
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
