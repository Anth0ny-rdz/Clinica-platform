# ai/rag.py
import os
from openai import OpenAI
from .schemas import AI_RECOMMENDATION_JSON_SCHEMA
import json


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL")

SYSTEM_PROMPT = (
    "Eres un asistente clínico de apoyo. "
    "No reemplazas al médico. "
    "No inventes datos. "
    "Devuelve únicamente el JSON solicitado."
)

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

