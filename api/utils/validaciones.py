import re
from fastapi import HTTPException

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


def validar_documento(tipo_documento: str, id_number: str):
    if tipo_documento == "cedula":
        if not validar_cedula_ecuador(id_number):
            raise HTTPException(
                status_code=400,
                detail="❌ Cédula ecuatoriana no válida."
            )

    elif tipo_documento == "pasaporte":
        if not re.match(r"^[A-Za-z0-9]{6,12}$", id_number):
            raise HTTPException(
                status_code=400,
                detail="❌ Pasaporte inválido. Debe tener 6–12 caracteres alfanuméricos."
            )

    else:
        raise HTTPException(
            status_code=400,
            detail="❌ Tipo de documento no reconocido."
        )
