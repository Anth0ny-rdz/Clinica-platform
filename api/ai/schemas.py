# ai/schemas.py
AI_RECOMMENDATION_JSON_SCHEMA = {
  "name": "clinical_recommendation",
  "strict": True,
  "schema": {
    "type": "object",
    "additionalProperties": False,
    "required": [
      "diagnostic_hypotheses",
      "recommended_tests",
      "treatment_suggestions",
      "red_flags",
      "rationale_brief",
      "evidence_cases_used",
      "confidence",
      "disclaimer"
    ],
    "properties": {
      "diagnostic_hypotheses": {
        "type": "array",
        "items": {"type": "string"},
        "minItems": 1,
        "maxItems": 5
      },
      "recommended_tests": {
        "type": "array",
        "items": {"type": "string"}
      },
      "treatment_suggestions": {
        "type": "array",
        "items": {"type": "string"}
      },
      "red_flags": {
        "type": "array",
        "items": {"type": "string"}
      },
      "rationale_brief": {"type": "string"},
      "evidence_cases_used": {
            "type": "array",
            "minItems": 1,
            "maxItems": 5,
            "items": {
                "type": "object",
                "additionalProperties": False,   # 👈 ESTO ES LO QUE FALTABA
                "required": ["encounter_id", "similarity"],
                "properties": {
                "encounter_id": {
                    "type": "integer"
                },
                "similarity": {
                    "type": "number"
                }
                }
            }
        },
      "confidence": {
        "type": "string",
        "enum": ["low", "medium", "high"]
      },
      "disclaimer": {"type": "string"}
    }
  }
}
