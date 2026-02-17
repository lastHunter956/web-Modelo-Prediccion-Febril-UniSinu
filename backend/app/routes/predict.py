"""Ruta de predicción — /api/predict."""
import logging
from fastapi import APIRouter, Depends
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
    Recibe 15 variables clínicas y retorna la predicción de severidad.

    El pipeline completo (imputers + OHE + scaler + modelo) se ejecuta
    internamente. El resultado incluye la clase predicha, probabilidades
    de las 3 clases, factores contribuyentes y un disclaimer legal.
    """
    data = patient.model_dump()

    logger.info(
        "Predicción solicitada — usuario: %s, triage: %s, glasgow: %s",
        _user.get("email", "?"),
        data.get("triage"),
        data.get("glasgow"),
    )

    result = ml_service.predict(data)

    logger.info(
        "Predicción completada — resultado: %s (confianza: %s%%)",
        result["prediccion"],
        result["confianza"],
    )

    return result
