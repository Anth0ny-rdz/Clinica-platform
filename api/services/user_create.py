# api/services/user_creator.py

from supabase import create_client
from fastapi import HTTPException
from datetime import datetime
import bcrypt
import re
import os
from dotenv import load_dotenv
from utils.validaciones import validar_cedula_ecuador
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def crear_usuario_real(user: dict):
    try:
        # 🔐 Validación documento
        if user["tipo_documento"] == "cedula":
            if not validar_cedula_ecuador(user["id_number"]):
                raise HTTPException(status_code=400, detail="Cédula inválida")

        elif user["tipo_documento"] == "pasaporte":
            if not re.match(r"^[A-Za-z0-9]{6,12}$", user["id_number"]):
                raise HTTPException(status_code=400, detail="Pasaporte inválido")

        # 🧍‍♂️ Crear usuario Auth
        auth_resp = supabase.auth.admin.create_user({
            "email": user["email"],
            "password": user["password"],
            "email_confirm": True
        })

        auth_user = auth_resp.user
        if not auth_user:
            raise HTTPException(status_code=400, detail="Error creando usuario Auth")

        auth_id = auth_user.id

        # 👤 Tabla users
        password_hash = bcrypt.hashpw(
            user["password"].encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        user_insert = supabase.table("users").insert({
            "username": user["email"].split("@")[0],
            "email": user["email"],
            "password_hash": password_hash,
            "is_active": True,
            "is_staff": False,
            "is_superuser": False,
        }).execute()

        user_id = user_insert.data[0]["userid"]

        # 📋 Perfil
        supabase.table("user_profile").insert({
            "auth_id": auth_id,
            "user_id": user_id,
            "rol_id": user["rol_id"],
            "id_number": user["id_number"],
            "name": user["name"],
            "lastname": user["lastname"],
            "telephone": user["telephone"],
            "address": user["address"],
            "birth_date": user["birth_date"],
            "tipo_documento": user["tipo_documento"],
            "consentimiento_datos": True,
            "consentimiento_fecha": datetime.utcnow().isoformat()
        }).execute()

        # 🏥 Si es paciente
        if user["rol_id"] == 6:
            supabase.table("patients").insert({
                "doc_id": user["id_number"],
                "tipo_documento": user["tipo_documento"],
                "names": user["name"],
                "lastname": user["lastname"],
                "birth_date": user["birth_date"],
                "address": user["address"],
                "telephone": user["telephone"],
                "email": user["email"],
                "seguro_medico": user.get("seguro_medico"),
                "genre": user.get("genre"),
            }).execute()

        return {"message": "Usuario creado correctamente", "auth_id": auth_id}

    except Exception as e:
        print("❌ Error en crear_usuario_real:", e)
        raise
