"""Verificación de JWT de Supabase — HS256 y RS256."""
import base64
import json
import logging
import httpx
import jwt as pyjwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..config import get_settings
from functools import lru_cache

logger = logging.getLogger(__name__)
security = HTTPBearer()


@lru_cache(maxsize=1)
def _get_jwks(supabase_url: str) -> dict:
    """Obtiene las claves públicas JWKS de Supabase (cacheado)."""
    jwks_url = f"{supabase_url}/auth/v1/.well-known/jwks.json"
    try:
        response = httpx.get(jwks_url, timeout=10)
        response.raise_for_status()
        logger.info("JWKS obtenido desde %s", jwks_url)
        return response.json()
    except Exception as e:
        logger.error("No se pudo obtener JWKS: %s", e)
        return {}


def _get_token_alg(token: str) -> str:
    """Extrae el algoritmo del header del JWT sin validarlo."""
    try:
        header = pyjwt.get_unverified_header(token)
        return header.get("alg", "HS256")
    except Exception as e:
        logger.error("Error al leer header del token: %s", e)
        return "HS256"


async def verify_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Verifica el JWT de Supabase — soporta HS256 y RS256."""
    settings = get_settings()
    token = credentials.credentials

    # Modo dev
    if not settings.supabase_url:
        logger.warning("SUPABASE_URL no configurado — modo dev")
        return {"sub": "dev-user", "email": "dev@local"}

    alg = _get_token_alg(token)
    logger.info("JWT algorithm detectado: %s", alg)

    try:
        if alg in ["RS256", "ES256"]:
            # ── RS256/ES256: verificar con clave pública JWKS de Supabase ──
            jwks = _get_jwks(settings.supabase_url)
            if not jwks:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="No se pudo obtener las claves públicas de Supabase",
                )
            
            # Intentar obtener llave por kid
            try:
                header = pyjwt.get_unverified_header(token)
                kid = header.get("kid")
            except Exception:
                kid = None

            key_data = None
            if kid:
                key_data = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)
            
            # Fallback: usar la primera llave de firma si no se encuentra por kid
            if not key_data:
                key_data = next(
                    (k for k in jwks.get("keys", []) 
                     if k.get("use") == "sig" or k.get("alg") in ["RS256", "ES256"]),
                    None
                )
            
            if not key_data:
                logger.error("No se encontró clave pública válida en JWKS para el token")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Clave de firma no encontrada",
                )

            signing_key = pyjwt.PyJWK.from_dict(key_data)
            payload = pyjwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256", "ES256"],
                options={"verify_aud": False},
            )

        else:
            # ── HS256: verificar con el Legacy JWT Secret ──
            secret = settings.supabase_jwt_secret
            if not secret:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="SUPABASE_JWT_SECRET no configurado",
                )
            payload = pyjwt.decode(
                token,
                secret,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )

        logger.info(
            "JWT verificado ✓ [%s] — user: %s | role: %s",
            alg,
            payload.get("sub", "?"),
            payload.get("role", "?"),
        )
        return payload

    except pyjwt.ExpiredSignatureError:
        logger.warning("JWT expirado")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado, inicie sesión nuevamente",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except pyjwt.InvalidSignatureError:
        logger.error("Firma JWT inválida — verifica SUPABASE_JWT_SECRET")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (pyjwt.InvalidTokenError, StopIteration) as e:
        logger.warning("JWT inválido: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_user_id(payload: dict = Depends(verify_jwt)) -> str:
    """Extrae el user_id del JWT."""
    return payload.get("sub", "")
