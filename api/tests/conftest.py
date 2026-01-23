"""
Configuración global de pytest y fixtures reutilizables
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, MagicMock
import os
import sys
from datetime import datetime
from pathlib import Path

# ✅ AGREGAR RAÍZ DEL PROYECTO AL PYTHONPATH
# Esto permite que Python encuentre los módulos utils, services, etc.
project_root = Path(__file__).parent.parent  # Sube dos niveles: tests/ -> api/
sys.path.insert(0, str(project_root))

# Configurar variables de entorno para testing
from dotenv import load_dotenv
load_dotenv()

# Obtener variables de entorno (usa las reales de tu .env)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL")
OPENAI_CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL")


@pytest.fixture
def mock_supabase():
    """Mock del cliente de Supabase"""
    mock = MagicMock()
    
    # Mock para auth.admin.create_user
    mock.auth.admin.create_user.return_value = MagicMock(
        user=MagicMock(id="test-auth-id-123", email="test@example.com")
    )
    
    # Mock para operaciones de tabla
    def create_table_mock(table_name):
        table_mock = MagicMock()
        table_mock.insert.return_value.execute.return_value = MagicMock(
            data=[{"userid": 1, "patient_id": 1, "encounter_id": 1}]
        )
        table_mock.select.return_value = table_mock
        table_mock.eq.return_value = table_mock
        table_mock.order.return_value = table_mock
        table_mock.execute.return_value = MagicMock(data=[], count=0)
        table_mock.update.return_value = table_mock
        table_mock.delete.return_value = table_mock
        return table_mock
    
    mock.table = create_table_mock
    
    return mock


@pytest.fixture
def mock_twilio_client():
    """Mock del cliente de Twilio"""
    mock = MagicMock()
    mock.messages.create.return_value = MagicMock(
        sid="test-message-sid-123"
    )
    return mock


@pytest.fixture
def valid_user_data():
    """Datos válidos de usuario para testing"""
    return {
        "tipo_documento": "cedula",
        "id_number": "1234567890",
        "name": "Juan",
        "lastname": "Pérez",
        "email": "juan.perez@example.com",
        "password": "securepass123",
        "telephone": "0987654321",
        "address": "Av. Principal 123",
        "birth_date": "1990-01-01",
        "rol_id": 6,
        "genre": "Masculino",
        "seguro_medico": "IESS",
        "consentimiento_tipo": "digital"
    }


@pytest.fixture
def valid_encounter_data():
    """Datos válidos de historia médica para testing"""
    return {
        "patient_id": 1,
        "doctor_id": 1,
        "reason_for_consultation": "Dolor de cabeza persistente",
        "main_symptoms": "Cefalea intensa",
        "secondary_symptoms": "Náuseas leves",
        "treatment": "Ibuprofeno 400mg cada 8 horas",
        "observations": "Control en 7 días",
        "diagnostico": "Migraña",
        "revision_organos": "Normal",
        "examen_fisico": "Signos vitales estables",
        "fecha_para_control": "2026-01-26",
        "vitals": {
            "presion_arterial": "120/80",
            "pulso_xmin": "72",
            "temperatura": "36.5"
        }
    }


@pytest.fixture
def client(monkeypatch):
    """Cliente de prueba de FastAPI con mocks configurados"""
    # Mockear Supabase antes de importar la app
    mock_supabase = MagicMock()
    
    # Configurar respuestas del mock
    mock_supabase.auth.admin.create_user.return_value = MagicMock(
        user=MagicMock(id="test-auth-id", email="test@example.com")
    )
    
    def table_mock(table_name):
        table = MagicMock()
        table.insert.return_value.execute.return_value = MagicMock(
            data=[{"userid": 1, "encounter_id": 1, "patient_id": 1}]
        )
        table.select.return_value = table
        table.eq.return_value = table
        table.execute.return_value = MagicMock(data=[], count=0)
        return table
    
    mock_supabase.table = table_mock
    
    # Aplicar el mock
    monkeypatch.setattr("main.supabase", mock_supabase)
    
    # Importar la app después de configurar los mocks
    from main import app
    
    return TestClient(app)


@pytest.fixture
def mock_create_embedding(monkeypatch):
    """Mock para la función create_embedding"""
    def _mock_embedding(text):
        return [0.1] * 1536  # Vector de embeddings simulado
    
    monkeypatch.setattr("ai.embedding.create_embedding", _mock_embedding)
    return _mock_embedding


@pytest.fixture
def mock_validar_cedula(monkeypatch):
    """Mock para validación de cédula"""
    def _mock(cedula):
        return len(cedula) == 10 and cedula.isdigit()
    
    monkeypatch.setattr("utils.validaciones.validar_cedula_ecuador", _mock)
    return _mock