"""Verificación de JWT de Supabase — HS256 con jwt_secret (base64)."""
import base64
import logging
import jwt as pyjwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..config import get_settings

logger = logging.getLogger(__name__)
security = HTTPBearer()

# Cache de la clave decodificada
_decoded_secret = None


def _get_secret_key():
    """Decodifica el JWT secret de Supabase (base64) una sola vez."""
    global _decoded_secret
    if _decoded_secret is None:
        settings = get_settings()
        secret = settings.supabase_jwt_secret
        # Supabase entrega el secret en base64
        try:
            _decoded_secret = base64.b64decode(secret)
            logger.info("JWT secret decodificado (base64) ✓ — %d bytes", len(_decoded_secret))
        except Exception:
            # Si no es base64 válido, usar como string directo
            _decoded_secret = secret.encode("utf-8") if isinstance(secret, str) else secret
            logger.info("JWT secret usado como texto plano — %d bytes", len(_decoded_secret))
    return _decoded_secret


async def verify_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Verifica el JWT de Supabase y retorna el payload."""
    settings = get_settings()
    token = credentials.credentials

    if not settings.supabase_url:
        logger.warning("SUPABASE_URL no configurado — omitiendo verificación")
        return {"sub": "dev-user", "email": "dev@local"}

    try:
        secret_key = _get_secret_key()

        # Intentar HS256 primero (más confiable en Docker)
        payload = pyjwt.decode(
            token,
            secret_key,
            algorithms=["HS256"],
            audience="authenticated",
        )

        logger.info("JWT verificado ✓ — user: %s", payload.get("sub", "?"))
        return payload

    except pyjwt.ExpiredSignatureError:
        logger.error("JWT expirado")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado, inicie sesión nuevamente",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except pyjwt.InvalidTokenError as e:
        logger.error("JWT inválido (%s): %s", type(e).__name__, e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error("Error inesperado validando JWT: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Error de autenticación",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_user_id(payload: dict = Depends(verify_jwt)) -> str:
    """Extrae el user_id del JWT."""
    return payload.get("sub", "")
            detail="Token de autenticación inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error("Error inesperado validando JWT: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Error de autenticación",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_user_id(payload: dict = Depends(verify_jwt)) -> str:
    """Extrae el user_id del JWT."""
    return payload.get("sub", "")
