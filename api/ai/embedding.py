# ai/embedding.py
import os
from datetime import datetime
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
EMBED_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL")

def build_embedding_text(encounter: dict) -> str:
    parts = [
        f"Motivo: {encounter.get('reason_for_consultation','')}",
        f"Síntomas principales: {encounter.get('main_symptoms','')}",
        f"Síntomas secundarios: {encounter.get('secondary_symptoms','')}",
        f"Revisión de órganos: {encounter.get('revision_organos','')}",
        f"Examen físico: {encounter.get('examen_fisico','')}",
        f"Diagnóstico: {encounter.get('diagnostico','')}",
        f"Tratamiento: {encounter.get('treatment','')}",
        f"Observaciones: {encounter.get('observations','')}",
    ]
    return "\n".join([p for p in parts if p.strip()])

def create_embedding(text: str) -> list[float]:
    res = client.embeddings.create(
        model=EMBED_MODEL,
        input=text
    )
    return res.data[0].embedding

def now_iso():
    return datetime.now().isoformat()
