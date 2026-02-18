"""Verificación de JWT de Supabase — HS256."""
import base64
import logging
import jwt as pyjwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..config import get_settings

logger = logging.getLogger(__name__)
security = HTTPBearer()


async def verify_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Verifica el JWT de Supabase y retorna el payload."""
    settings = get_settings()
    token = credentials.credentials

    if not settings.supabase_url:
        logger.warning("SUPABASE_URL no configurado — omitiendo verificación")
        return {"sub": "dev-user", "email": "dev@local"}

    secret = settings.supabase_jwt_secret

    # Intentar con el secret como string directo (forma más común)
    # y como base64-decoded (algunos proyectos Supabase lo entregan así)
    secrets_to_try = [
        ("raw", secret),
    ]
    try:
        decoded = base64.b64decode(secret)
        secrets_to_try.append(("base64", decoded))
    except Exception:
        pass

    last_error = None
    for label, key in secrets_to_try:
        try:
            payload = pyjwt.decode(
                token,
                key,
                algorithms=["HS256"],
                audience="authenticated",
            )
            logger.info("JWT verificado ✓ [%s] — user: %s", label, payload.get("sub", "?"))
            return payload
        except pyjwt.ExpiredSignatureError:
            logger.error("JWT expirado")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expirado, inicie sesión nuevamente",
            )
        except pyjwt.InvalidSignatureError as e:
            # Firma inválida con esta clave, probar la siguiente
            last_error = e
            logger.info("JWT firma inválida con [%s], probando siguiente...", label)
            continue
        except pyjwt.InvalidTokenError as e:
            last_error = e
            continue

    # Ningún secret funcionó
    logger.error("JWT inválido con todas las claves: %s", last_error)
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token de autenticación inválido",
    )


def get_user_id(payload: dict = Depends(verify_jwt)) -> str:
    """Extrae el user_id del JWT."""
    return payload.get("sub", "")
