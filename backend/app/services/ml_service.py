"""Servicio de Machine Learning — carga pipeline y ejecuta predicciones."""
import json
import logging
import joblib
import numpy as np
import pandas as pd
from pathlib import Path

logger = logging.getLogger(__name__)

# Nombres de columnas exactos que espera el pipeline
COLUMN_NAMES = [
    "Grupo edad años",
    "Sexo",
    "Area",
    "Tiempo dias de inicio de la fiebre en fecha de consulta",
    "Vacunación",
    "Antecedentes personales de patologías",
    "Contacto epidemiologico con enfermedades infecciosas",
    "Exposicion ambiental",
    "Estado nutricional",
    "Glasgow",
    "Nivel de Triage por el TEP",
    "Cayados absolutos",
    "Plaquetas cel/mm3",
    "Albúmina sérica g/dl",
    "Globulina sérica g/dl",
]

CLASS_LABELS = {0: "Leve", 1: "Moderada", 2: "Severa"}

DISCLAIMER = (
    "Esta herramienta es de apoyo a la decisión clínica y no reemplaza "
    "el juicio médico profesional. Los resultados deben ser interpretados "
    "por personal médico calificado en el contexto clínico del paciente."
)


class MLService:
    """Singleton que carga y ejecuta el pipeline de predicción."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def load(self, pipeline_path: str, metadata_path: str, features_path: str):
        """Carga pipeline (joblib) y metadata al iniciar la app."""
        logger.info("Cargando pipeline desde %s...", pipeline_path)

        # Cargar artefactos con joblib (no pickle!)
        pipeline_dict = joblib.load(pipeline_path)

        # Extraer componentes del pipeline
        self.modelo = pipeline_dict["modelo"]          # CalibratedClassifierCV
        self.scaler = pipeline_dict["scaler"]          # StandardScaler
        self.ohe = pipeline_dict["ohe"]                # OneHotEncoder
        self.imputer_num = pipeline_dict["imputer_num"]  # SimpleImputer
        self.imputer_cat = pipeline_dict["imputer_cat"]  # SimpleImputer
        self.cols_num = pipeline_dict["cols_num"]        # 6 columnas numéricas
        self.cols_cat = pipeline_dict["cols_cat"]        # 9 columnas categóricas
        self.cols_escalar = pipeline_dict["cols_escalar"]
        self.feature_names_post_ohe = pipeline_dict["feature_names_post_ohe"]
        self.features_originales = pipeline_dict["features_originales"]
        self.categorias_raras = pipeline_dict["categorias_raras"]
        self.class_names = pipeline_dict["class_names"]

        # Cargar metadata
        with open(metadata_path, "r", encoding="utf-8") as f:
            self.metadata = json.load(f)

        with open(features_path, "r", encoding="utf-8") as f:
            self.feature_names = json.load(f)

        self._initialized = True
        logger.info(
            "Pipeline cargado — modelo: %s, features originales: %d, post-OHE: %d",
            type(self.modelo).__name__,
            len(self.features_originales),
            len(self.feature_names_post_ohe),
        )

    @property
    def is_loaded(self) -> bool:
        return self._initialized

    def _group_rare_categories(self, data: dict) -> dict:
        """Agrupa categorías raras como 'Otro' según el mapeo guardado."""
        grouped = data.copy()
        # Map API field names → column names
        field_to_col = {
            "grupo_edad": "Grupo edad años",
            "antecedentes": "Antecedentes personales de patologías",
            "contacto_epidemiologico": "Contacto epidemiologico con enfermedades infecciosas",
            "estado_nutricional": "Estado nutricional",
        }
        for field, col in field_to_col.items():
            if col in self.categorias_raras and field in grouped:
                if grouped[field] in self.categorias_raras[col]:
                    grouped[field] = "Otro"
        return grouped

    def _build_dataframe(self, data: dict) -> pd.DataFrame:
        """Construye DataFrame con nombres exactos de columnas."""
        grouped = self._group_rare_categories(data)

        row = {
            "Grupo edad años": grouped["grupo_edad"],
            "Sexo": grouped["sexo"],
            "Area": grouped["area"],
            "Tiempo dias de inicio de la fiebre en fecha de consulta": grouped["tiempo_fiebre"],
            "Vacunación": grouped["vacunacion"],
            "Antecedentes personales de patologías": grouped["antecedentes"],
            "Contacto epidemiologico con enfermedades infecciosas": grouped["contacto_epidemiologico"],
            "Exposicion ambiental": grouped["exposicion_ambiental"],
            "Estado nutricional": grouped["estado_nutricional"],
            "Glasgow": grouped["glasgow"],
            "Nivel de Triage por el TEP": grouped["triage"],
            "Cayados absolutos": grouped.get("cayados"),
            "Plaquetas cel/mm3": grouped.get("plaquetas"),
            "Albúmina sérica g/dl": grouped.get("albumina"),
            "Globulina sérica g/dl": grouped.get("globulina"),
        }

        df = pd.DataFrame([row], columns=self.features_originales)
        return df

    def _apply_pipeline(self, df: pd.DataFrame) -> tuple:
        """
        Aplica el pipeline paso a paso:
        1. Impute numéricos
        2. Impute categóricos
        3. OHE categóricos
        4. Scale numéricos
        5. Concatenar
        6. Predict
        """
        # Separar columnas
        X_num = df[self.cols_num].copy()
        X_cat = df[self.cols_cat].copy()

        # 1. Imputar
        X_num_imputed = pd.DataFrame(
            self.imputer_num.transform(X_num),
            columns=self.cols_num,
        )
        X_cat_imputed = pd.DataFrame(
            self.imputer_cat.transform(X_cat),
            columns=self.cols_cat,
        )

        # 2. OHE categóricos
        X_cat_ohe = self.ohe.transform(X_cat_imputed)
        if hasattr(X_cat_ohe, "toarray"):
            X_cat_ohe = X_cat_ohe.toarray()

        # 3. Escalar numéricos
        X_num_scaled = self.scaler.transform(X_num_imputed[self.cols_escalar])

        # 4. Concatenar: numéricos escalados + categóricos OHE
        X_final = np.hstack([X_num_scaled, X_cat_ohe])

        # 5. Predecir
        prediction = self.modelo.predict(X_final)[0]
        probabilities = self.modelo.predict_proba(X_final)[0]

        return prediction, probabilities

    def _identify_factors(self, data: dict) -> list:
        """Identifica factores clínicos contribuyentes."""
        factors = []

        glasgow = data.get("glasgow", 15)
        if glasgow is not None and glasgow < 13:
            factors.append(f"Glasgow alterado ({glasgow})")

        plaquetas = data.get("plaquetas")
        if plaquetas is not None:
            if plaquetas < 150000:
                factors.append(f"Trombocitopenia ({plaquetas:,.0f} cel/mm³)")
            elif plaquetas > 400000:
                factors.append(f"Trombocitosis ({plaquetas:,.0f} cel/mm³)")

        albumina = data.get("albumina")
        if albumina is not None and albumina < 3.5:
            factors.append(f"Hipoalbuminemia ({albumina} g/dl)")

        cayados = data.get("cayados")
        if cayados is not None and cayados > 500:
            factors.append(f"Cayados elevados ({cayados:,.0f} cel/mm³)")

        globulina = data.get("globulina")
        if globulina is not None and globulina > 4.0:
            factors.append(f"Globulina elevada ({globulina} g/dl)")

        triage = data.get("triage", "")
        if triage in ("Nivel I", "Nivel II"):
            factors.append(f"Triage alto ({triage})")

        tiempo = data.get("tiempo_fiebre", 0)
        if tiempo > 5:
            factors.append(f"Fiebre prolongada ({tiempo} días)")

        vacunacion = data.get("vacunacion", "")
        if vacunacion == "Incompleto":
            factors.append("Esquema de vacunación incompleto")

        estado_nut = data.get("estado_nutricional", "")
        if estado_nut == "Riesgo de desnutrición":
            factors.append("Riesgo de desnutrición")

        if not factors:
            factors.append("Parámetros clínicos dentro de rangos esperados")

        return factors

    def predict(self, data: dict) -> dict:
        """Ejecuta predicción completa."""
        if not self._initialized:
            raise RuntimeError("Pipeline no cargado. Llame a load() primero.")

        df = self._build_dataframe(data)
        prediction, probabilities = self._apply_pipeline(df)

        # Construir resultado
        pred_label = CLASS_LABELS[int(prediction)]
        probs = {
            "leve": round(float(probabilities[0]) * 100, 1),
            "moderada": round(float(probabilities[1]) * 100, 1),
            "severa": round(float(probabilities[2]) * 100, 1),
        }
        confianza = round(float(np.max(probabilities)) * 100, 1)
        factors = self._identify_factors(data)

        return {
            "prediccion": pred_label,
            "codigo": int(prediction),
            "probabilidades": probs,
            "factores": factors,
            "confianza": confianza,
            "disclaimer": DISCLAIMER,
        }


# Singleton global
ml_service = MLService()
