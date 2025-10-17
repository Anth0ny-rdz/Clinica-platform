import bcrypt
from supabase import create_client, Client

# ⚠️ Usa la SERVICE ROLE KEY, no la anon
SUPABASE_URL = "https://imxikpezwsexavjtixhz.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "sb_secret_UUZ2esLFA_MnZtGyqn29nQ_tvPn96SD"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Datos del usuario
USERNAME = "AdminPrincipal"
EMAIL = "adminLatacunga@miapp.com"
PASSWORD = "AdminLata123"
IS_ACTIVE = True
IS_STAFF = True
IS_SUPERUSER = True

# Datos del perfil
NAME = "Admin"
LASTNAME = "Principal"
ID_NUMBER = "0000000000"
TELEPHONE = "0999999999"
ADDRESS = "Dirección principal"
BIRTH_DATE = "1990-01-01"
ROL_NAME = "Administrador"  # Debe existir en tabla roles


def create_user_full():
    print("Creando usuario y perfil completo...\n")

    # 1️⃣ Crear usuario en Auth
    auth_response = supabase.auth.admin.create_user(
        {
            "email": EMAIL,
            "password": PASSWORD,
            "email_confirm": True,
        }
    )

    if not auth_response.user:
        print("❌ Error creando usuario en Auth:", auth_response)
        return

    auth_id = auth_response.user.id
    print(f"✅ Usuario Auth creado con ID: {auth_id}")

    password_hash = bcrypt.hashpw(PASSWORD.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    user_data = {
        "username": USERNAME,
        "email": EMAIL,
        "password_hash": password_hash,
        "is_active": IS_ACTIVE,
        "is_staff": IS_STAFF,
        "is_superuser": IS_SUPERUSER,
    }

    # Ejecutar el upsert normalmente
    users_response = supabase.table("users").upsert(user_data, on_conflict="username").execute()

    # Verificar si realmente se insertó o actualizó algo
    if not users_response.data:
        # Algunos servidores no devuelven datos tras upsert, así que consultamos manualmente
        lookup = supabase.table("users").select("*").eq("username", USERNAME).execute()
        if not lookup.data:
            print("❌ No se pudo crear ni encontrar el usuario en la tabla users.")
            return
        user_row = lookup.data[0]
    else:
        user_row = users_response.data[0]

    user_id = user_row.get("userid") or user_row.get("user_id")
    print(f"✅ Usuario insertado en users con ID: {user_id}")

    # 3️⃣ Buscar rol
    roles_resp = supabase.table("roles").select("roleid").eq("name", ROL_NAME).execute()
    if not roles_resp.data:
        print(f"⚠️ Rol '{ROL_NAME}' no encontrado. Verifica tu tabla roles.")
        return
    rol_id = roles_resp.data[0]["roleid"]

    # 4️⃣ Crear perfil en user_profiles
    profile_data = {
        "user_id": user_id,
        "rol_id": rol_id,
        "name": NAME,
        "lastname": LASTNAME,
        "id_number": ID_NUMBER,
        "telephone": TELEPHONE,
        "address": ADDRESS,
        "birth_date": BIRTH_DATE,
    }

    profile_response = supabase.table("user_profile").upsert(profile_data, on_conflict="user_id").execute()
    if not profile_response.data:
        print("❌ Error insertando perfil:", profile_response)
        return

    print(f"✅ Perfil creado en user_profiles para user_id {user_id}")
    print("🎉 Usuario, Auth y perfil creados correctamente.")


if __name__ == "__main__":
    create_user_full()