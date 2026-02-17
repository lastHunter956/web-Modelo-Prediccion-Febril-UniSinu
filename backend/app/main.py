"""FastAPI application — Predicción de Severidad Febril Pediátrica."""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .config import get_settings
from .services.ml_service import ml_service
from .routes import predict, model_info

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Carga los artefactos ML al iniciar la aplicación."""
    settings = get_settings()
    logger.info("=" * 60)
    logger.info("Iniciando servidor — Predicción Febril Pediátrica")
    logger.info("=" * 60)

    ml_service.load(
        pipeline_path=settings.pipeline_path,
        metadata_path=settings.metadata_path,
        features_path=settings.features_path,
    )
    logger.info("Servidor listo ✓")
    yield
    logger.info("Servidor detenido")


app = FastAPI(
    title="API Predicción Febril Pediátrica",
    description=(
        "Sistema de predicción de severidad febril en pacientes pediátricos. "
        "Modelo Extra Trees Calibrado — Universidad del Sinú, Cartagena."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
settings = get_settings()
origins = [o.strip() for o in settings.allowed_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(predict.router)
app.include_router(model_info.router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Manejo global de excepciones no capturadas."""
    logger.error("Error no manejado: %s — %s", type(exc).__name__, exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor. Intente nuevamente."},
    )


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check del servicio."""
    return {
        "status": "ok",
        "model_loaded": ml_service.is_loaded,
        "version": ml_service.metadata.get("version", "unknown")
        if ml_service.is_loaded
        else "not loaded",
    }
