# ai/rag.py
import os
from openai import OpenAI
from .schemas import AI_RECOMMENDATION_JSON_SCHEMA
import json


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL")

SYSTEM_PROMPT = """
Eres un asistente clínico de apoyo a la toma de decisiones.
Tu función es ayudar al profesional de la salud proporcionando
hipótesis clínicas, sugerencias de estudios complementarios y
posibles líneas de manejo, basadas únicamente en la información
proporcionada y en casos clínicos históricos similares.

Reglas obligatorias:
- No reemplazas el criterio del médico.
- No emites diagnósticos definitivos.
- No inventes datos ni supongas información no proporcionada.
- Si la evidencia es limitada o no existen casos comparables,
  debes indicarlo explícitamente y reducir el nivel de confianza.
- Las recomendaciones deben ser prudentes, no prescriptivas.
- No sugieras tratamientos invasivos ni decisiones críticas.

Devuelve únicamente el JSON solicitado, sin texto adicional.
"""


def call_agent(payload: dict) -> dict:
    response = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": str(payload)}
        ],
        response_format={
            "type": "json_schema",
            "json_schema": AI_RECOMMENDATION_JSON_SCHEMA
        },
        temperature=0.2
    )

    # ✅ SIEMPRE viene JSON válido gracias al schema
    content = response.choices[0].message.content

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        # fallback defensivo (no debería pasar)
        return {
            "error": "Invalid JSON from AI",
            "raw": content
        }

