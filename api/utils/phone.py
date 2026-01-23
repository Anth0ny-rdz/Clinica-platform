def normalizar_telefono_ec(numero: str) -> str:
    """
    Devuelve SIEMPRE teléfono Ecuador en formato 09XXXXXXXX
    """
    if not numero:
        return ""

    n = (
        numero.replace("whatsapp:", "")
        .replace("+", "")
        .strip()
    )

    # Caso Twilio WaId / From: 593XXXXXXXXX -> 09XXXXXXXX
    if n.startswith("593") and len(n) == 12:
        return "0" + n[3:]

    # Caso ya correcto: 09XXXXXXXX
    if n.startswith("0") and len(n) == 10:
        return n

    # Fallback seguro: últimos 10 dígitos con 0
    last10 = n[-10:]
    if last10[0] != "0":
        last10 = "0" + last10[1:]
    return last10
