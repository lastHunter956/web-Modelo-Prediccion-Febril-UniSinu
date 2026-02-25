"""Pydantic schemas para la API de predicción."""
from pydantic import BaseModel, Field
from typing import Optional


class PatientInput(BaseModel):
    """18 variables clínicas de entrada del modelo V3."""

    # Categóricas (9)
    grupo_edad: str = Field(
        ...,
        description="Grupo edad años: 'Menor de 2', '2-5', '6-12', '13-17'",
    )
    sexo: str = Field(..., description="'Femenino' o 'Masculino'")
    area: str = Field(..., description="'Rural' o 'Urban'")
    vacunacion: str = Field(..., description="'Completo' o 'Incompleto'")
    antecedentes: str = Field(
        ..., description="Antecedentes personales de patologías"
    )
    contacto_epidemiologico: str = Field(
        ...,
        description="Contacto epidemiológico con enfermedades infecciosas",
    )
    exposicion_ambiental: str = Field(
        ..., description="Exposición ambiental"
    )
    estado_nutricional: str = Field(..., description="Estado nutricional")
    hallazgo_examen_fisico: str = Field(
        ...,
        description=(
            "Hallazgo relevante al examen físico: 'Ninguno', 'Eritema orofaríngeo', "
            "'Exudado purulento retrofaríngeo', 'Hipertrofia de amigdalas con placas purulentas', "
            "'Signos inflamatorios membrana timpánica', 'Taquipnea', 'Tirajes subcostales', 'Otro'"
        ),
    )

    # Numéricas (9)
    tiempo_fiebre: int = Field(
        ..., ge=0, le=60, description="Días desde inicio de fiebre"
    )
    glasgow: int = Field(..., ge=3, le=15, description="Escala de Glasgow")
    cayados: Optional[float] = Field(
        None, ge=0, description="Cayados absolutos cel/mm³"
    )
    plaquetas: Optional[float] = Field(
        None, ge=0, description="Plaquetas cel/mm³"
    )
    albumina: Optional[float] = Field(
        None, ge=0, description="Albúmina sérica g/dl"
    )
    globulina: Optional[float] = Field(
        None, ge=0, description="Globulina sérica g/dl"
    )
    procalcitonina: Optional[float] = Field(
        None, ge=0, description="Procalcitonina ng/mL"
    )
    leucocitos: Optional[float] = Field(
        None, ge=0, description="Leucocitos cel/mm³"
    )
    pcr: Optional[float] = Field(
        None, ge=0, description="Proteína C reactiva mg/dL"
    )


class PredictionOutput(BaseModel):
    """Resultado de la predicción del modelo."""

    prediccion: str  # "Leve", "Moderada", "Severa"
    codigo: int  # 0, 1, 2
    probabilidades: dict  # {"leve": 0.85, "moderada": 0.10, "severa": 0.05}
    factores: list[str]  # Factores contribuyentes
    confianza: float  # Probabilidad máxima
    disclaimer: str  # Disclaimer legal obligatorio


class ModelInfo(BaseModel):
    """Metadata del modelo."""

    version: str
    modelo_nombre: str
    modelo_tipo: str
    n_features_originales: int
    n_features_post_ohe: int
    clases: dict
    calibrado: bool


class ModelMetrics(BaseModel):
    """Métricas de rendimiento del modelo."""

    metricas_holdout: dict
    metricas_nested_cv: dict
    train_size: int
    test_size: int


class HealthResponse(BaseModel):
    """Respuesta del health check."""

    status: str
    model_loaded: bool
    version: str
