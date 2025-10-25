from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, constr, Field
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

# 📦 Modelo con validaciones
class UserCreate(BaseModel):
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

        # 2️⃣ Crear en tabla users con hash de la contraseña
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

        if not user_id:
            raise HTTPException(status_code=500, detail="No se pudo crear el registro en users")

        # 3️⃣ Crear perfil
        profile_data = {
            "auth_id": auth_id,
            "user_id": user_id,
            "rol_id": user.rol_id,
            "name": user.name,
            "lastname": user.lastname,
            "telephone": user.telephone,
            "address": user.address,
            "birth_date": user.birth_date
        }
        supabase.table("user_profile").insert(profile_data).execute()

        return {"message": "✅ Usuario creado correctamente", "auth_id": auth_id, "user_id": user_id}

    except Exception as e:
        print("❌ Error:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")