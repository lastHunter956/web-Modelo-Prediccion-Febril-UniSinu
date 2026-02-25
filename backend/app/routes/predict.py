"""Ruta de predicción — /api/predict."""
import logging
from fastapi import APIRouter, Depends, HTTPException
from ..models.schemas import PatientInput, PredictionOutput
from ..services.ml_service import ml_service
from ..services.auth import verify_jwt

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Predicción"])


@router.post("/predict", response_model=PredictionOutput)
async def predict(
    patient: PatientInput,
    _user: dict = Depends(verify_jwt),
):
    """
    Recibe 18 variables clínicas y retorna la predicción de severidad.

    El pipeline completo (imputers + OHE + scaler + modelo V3) se ejecuta
    internamente. El resultado incluye la clase predicha, probabilidades
    de las 3 clases, factores contribuyentes y un disclaimer legal.
    """
    if not ml_service.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="El modelo no está cargado. Reinicie el servidor.",
        )

    data = patient.model_dump()

    logger.info(
        "Predicción solicitada — usuario: %s, hallazgo: %s, glasgow: %s",
        _user.get("email", "?"),
        data.get("hallazgo_examen_fisico"),
        data.get("glasgow"),
    )

    try:
        result = ml_service.predict(data)
    except Exception as e:
        logger.error("Error ejecutando predicción: %s", e, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno al ejecutar la predicción. Revise los datos ingresados.",
        )

    logger.info(
        "Predicción completada — resultado: %s (confianza: %s%%)",
        result["prediccion"],
        result["confianza"],
    )

    return result
