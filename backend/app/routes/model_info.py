"""Rutas de información del modelo — /api/model/*."""
from fastapi import APIRouter, HTTPException
from ..services.ml_service import ml_service
from ..models.schemas import ModelInfo, ModelMetrics

router = APIRouter(prefix="/api/model", tags=["Modelo"])


@router.get("/info", response_model=ModelInfo)
async def model_info():
    """Retorna metadata general del modelo."""
    if not ml_service.is_loaded:
        raise HTTPException(status_code=503, detail="Modelo no cargado")
    meta = ml_service.metadata
    return ModelInfo(
        version=meta.get("version", ""),
        modelo_nombre=meta.get("modelo_nombre", ""),
        modelo_tipo=meta.get("modelo_tipo", ""),
        n_features_originales=meta.get("n_features_originales", 0),
        n_features_post_ohe=meta.get("n_features_post_ohe", 0),
        clases=meta.get("clases", {}),
        calibrado=meta.get("calibrado", False),
    )


@router.get("/metrics", response_model=ModelMetrics)
async def model_metrics():
    """Retorna métricas de rendimiento del modelo."""
    if not ml_service.is_loaded:
        raise HTTPException(status_code=503, detail="Modelo no cargado")
    meta = ml_service.metadata
    return ModelMetrics(
        metricas_holdout=meta.get("metricas_holdout", {}),
        metricas_nested_cv=meta.get("metricas_nested_cv", {}),
        train_size=meta.get("train_size", 0),
        test_size=meta.get("test_size", 0),
    )
