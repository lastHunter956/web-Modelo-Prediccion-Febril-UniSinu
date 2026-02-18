"""Verificación de JWT de Supabase — soporta ES256 (JWKS) y HS256 (legacy)."""
import logging
import jwt as pyjwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..config import get_settings

logger = logging.getLogger(__name__)
security = HTTPBearer()

# Cache del JWKS client (singleton)
_jwks_client = None


def _get_jwks_client():
    """Obtiene (o crea) el cliente JWKS de Supabase."""
    global _jwks_client
    if _jwks_client is None:
        settings = get_settings()
        jwks_url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
        logger.info("Inicializando JWKS client: %s", jwks_url)
        _jwks_client = PyJWKClient(
            jwks_url,
            headers={"apikey": settings.supabase_anon_key},
        )
    return _jwks_client


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
        # Leer header para determinar algoritmo
        header = pyjwt.get_unverified_header(token)
        alg = header.get("alg", "HS256")
        logger.info("JWT alg=%s, kid=%s", alg, header.get("kid"))

        payload = None

        if alg == "ES256":
            # Token ES256 → verificar con JWKS (clave pública)
            try:
                jwks_client = _get_jwks_client()
                signing_key = jwks_client.get_signing_key_from_jwt(token)
                payload = pyjwt.decode(
                    token,
                    signing_key.key,
                    algorithms=["ES256"],
                    audience="authenticated",
                )
            except Exception as jwks_err:
                # Fallback: intentar con HS256 si JWKS falla (red interna Docker)
                logger.warning("JWKS falló (%s), intentando HS256 fallback", jwks_err)
                if settings.supabase_jwt_secret:
                    payload = pyjwt.decode(
                        token,
                        settings.supabase_jwt_secret,
                        algorithms=["HS256"],
                        audience="authenticated",
                    )
                else:
                    raise jwks_err

        if payload is None:
            # Token HS256 (legacy) → verificar con secreto
            payload = pyjwt.decode(
                token,
                settings.supabase_jwt_secret,
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
