"""Servicio de Machine Learning — carga pipeline y ejecuta predicciones."""
import json
import logging
import joblib
import numpy as np
import pandas as pd
from pathlib import Path

logger = logging.getLogger(__name__)

# Nombres de columnas exactos que espera el pipeline V3
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
    "Hallazgo relevante al examen fisico",
    "Glasgow",
    "Cayados absolutos",
    "Plaquetas cel/mm3",
    "Albúmina sérica g/dl",
    "Globulina sérica g/dl",
    "Procalcitonina ng/mL",
    "Leucocitos cel/mm3",
    "Proteina C reactiva mg/Dl",
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
            cls._instance.metadata = {}
            cls._instance.feature_names = {}
        return cls._instance

    def load(self, pipeline_path: str, metadata_path: str, features_path: str):
        """Carga pipeline (joblib) y metadata al iniciar la app."""
        try:
            logger.info("Cargando pipeline desde %s...", pipeline_path)

            # Verificar que los archivos existen
            for fpath, desc in [
                (pipeline_path, "Pipeline"),
                (metadata_path, "Metadata"),
                (features_path, "Features"),
            ]:
                if not Path(fpath).exists():
                    raise FileNotFoundError(f"{desc} no encontrado: {fpath}")

            # Cargar artefactos con joblib
            pipeline_dict = joblib.load(pipeline_path)

            # Extraer componentes del pipeline
            self.modelo = pipeline_dict["modelo"]
            self.scaler = pipeline_dict["scaler"]
            self.ohe = pipeline_dict["ohe"]
            self.imputer_num = pipeline_dict["imputer_num"]
            self.imputer_cat = pipeline_dict["imputer_cat"]
            self.cols_num = pipeline_dict["cols_num"]
            self.cols_cat = pipeline_dict["cols_cat"]
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
        except Exception as e:
            self._initialized = False
            logger.error("Error cargando pipeline: %s", e, exc_info=True)
            raise

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
            "hallazgo_examen_fisico": "Hallazgo relevante al examen fisico",
        }
        for field, col in field_to_col.items():
            if col in self.categorias_raras and field in grouped:
                if grouped[field] in self.categorias_raras[col]:
                    grouped[field] = "Otro"
        return grouped

    def _build_dataframe(self, data: dict) -> pd.DataFrame:
        """Construye DataFrame con nombres exactos de columnas para el modelo V3.

        El pipeline V3 incluye indicadores de missingness para albúmina y
        globulina dentro de cols_num. Se generan antes de imputar.
        """
        grouped = self._group_rare_categories(data)

        albumina_val = grouped.get("albumina")
        globulina_val = grouped.get("globulina")

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
            "Hallazgo relevante al examen fisico": grouped["hallazgo_examen_fisico"],
            "Glasgow": grouped["glasgow"],
            "Cayados absolutos": grouped.get("cayados"),
            "Plaquetas cel/mm3": grouped.get("plaquetas"),
            "Albúmina sérica g/dl": albumina_val,
            "Globulina sérica g/dl": globulina_val,
            "Procalcitonina ng/mL": grouped.get("procalcitonina"),
            "Leucocitos cel/mm3": grouped.get("leucocitos"),
            "Proteina C reactiva mg/Dl": grouped.get("pcr"),
            # Indicadores de missingness (esperados por el pipeline V3)
            "Albúmina_sérica_g_dl_missing": 1 if albumina_val is None else 0,
            "Globulina_sérica_g_dl_missing": 1 if globulina_val is None else 0,
        }

        # El DataFrame debe contener exactamente cols_num + cols_cat
        # features_originales solo tiene las columnas clínicas base (18);
        # creamos el DF con todas las columnas que el pipeline necesita.
        all_cols = self.features_originales + [
            "Albúmina_sérica_g_dl_missing",
            "Globulina_sérica_g_dl_missing",
        ]
        # Evitar duplicados si ya están incluidos en features_originales
        seen = set()
        unique_cols = [c for c in all_cols if not (c in seen or seen.add(c))]

        df = pd.DataFrame([row])
        # Conservar solo columnas conocidas para no romper el pipeline
        df = df[[c for c in unique_cols if c in df.columns]]
        return df

    def _apply_pipeline(self, df: pd.DataFrame) -> tuple:
        """
        Aplica el pipeline paso a paso (compatible con modelo V3):
        1. Separar indicadores de missingness de las columnas numéricas clínicas
        2. Impute numéricos clínicos (imputer_num no incluye missingness flags)
        3. Impute categóricos
        4. OHE categóricos
        5. Scale numéricos (cols_escalar)
        6. Concatenar: [numéricos escalados | missingness flags | categóricos OHE]
        7. Predict
        """
        # Columnas que el imputer_num conoce (sin missingness flags)
        cols_imputer = list(self.imputer_num.feature_names_in_)

        # Missingness flags — presentes en cols_num pero NO en el imputer
        missing_flag_cols = [c for c in self.cols_num if c not in cols_imputer]

        # Extraer valores de missingness antes de imputar
        if missing_flag_cols:
            X_missing_flags = df[missing_flag_cols].values
        else:
            X_missing_flags = None

        # Separar columnas para imputer y OHE
        X_num = df[cols_imputer].copy()
        X_cat = df[self.cols_cat].copy()

        # 1. Imputar numéricos
        X_num_imputed = pd.DataFrame(
            self.imputer_num.transform(X_num),
            columns=cols_imputer,
        )
        # 2. Imputar categóricos
        X_cat_imputed = pd.DataFrame(
            self.imputer_cat.transform(X_cat),
            columns=self.cols_cat,
        )

        # 3. OHE categóricos
        X_cat_ohe = self.ohe.transform(X_cat_imputed)
        if hasattr(X_cat_ohe, "toarray"):
            X_cat_ohe = X_cat_ohe.toarray()

        # 4. Escalar numéricos (sólo cols_escalar, sin flags)
        X_num_scaled = self.scaler.transform(X_num_imputed[self.cols_escalar])

        # 5. Concatenar respetando el orden de feature_names_post_ohe
        if X_missing_flags is not None:
            X_final = np.hstack([X_num_scaled, X_missing_flags, X_cat_ohe])
        else:
            X_final = np.hstack([X_num_scaled, X_cat_ohe])

        # 6. Predecir
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

        # Nuevos factores V3
        procalcitonina = data.get("procalcitonina")
        if procalcitonina is not None and procalcitonina > 0.5:
            factors.append(f"Procalcitonina elevada ({procalcitonina} ng/mL)")

        leucocitos = data.get("leucocitos")
        if leucocitos is not None:
            if leucocitos < 4000:
                factors.append(f"Leucopenia ({leucocitos:,.0f} cel/mm³)")
            elif leucocitos > 15000:
                factors.append(f"Leucocitosis ({leucocitos:,.0f} cel/mm³)")

        pcr = data.get("pcr")
        if pcr is not None and pcr > 10:
            factors.append(f"PCR elevada ({pcr} mg/dL)")

        hallazgo = data.get("hallazgo_examen_fisico", "Ninguno")
        if hallazgo and hallazgo not in ("Ninguno", ""):
            factors.append(f"Hallazgo al examen físico: {hallazgo}")

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
