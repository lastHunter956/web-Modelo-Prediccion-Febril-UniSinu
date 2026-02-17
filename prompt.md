# PROYECTO: Web App Médica — Predicción de Severidad Febril Pediátrica

## Universidad del Sinú, Cartagena

---

## CONTEXTO DEL PROYECTO

Tengo un modelo de Machine Learning **V2 Corregido** ya entrenado y exportado como archivos `.pkl` (scikit-learn) que clasifica la severidad de cuadros febriles en pacientes pediátricos en 3 clases: **Leve (0), Moderada (1), Severa (2)**.

El modelo usa **15 variables clínicas** seleccionadas por la Dra. Fontalvo (pediatra investigadora).

El modelo final es: **Extra Trees Calibrado (CalibratedClassifierCV)**

- Accuracy: 91.95%
- F1-macro: 92.56%
- Recall Severa: 90%
- 0 errores críticos (ningún paciente Severo clasificado como Leve)
- Gap de sobreajuste: 0.6% (excelente generalización)
- Nested CV: Accuracy 0.9219±0.0071

---

## ARTEFACTOS DE PRODUCCIÓN

Todos los artefactos del modelo V2 están en la carpeta `artefactos_modelo_v2/` de este mismo directorio, listos para copiar al backend:

| Archivo                     | Descripción                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| `modelo_v2c.pkl`            | Modelo Extra Trees Calibrado (CalibratedClassifierCV)                                                 |
| `scaler_v2c.pkl`            | StandardScaler (solo para las 6 variables numéricas)                                                  |
| `ohe_v2c.pkl`               | OneHotEncoder ya entrenado (drop='first', handle_unknown='ignore')                                    |
| `imputer_num_v2c.pkl`       | SimpleImputer(strategy='median') para las 6 numéricas                                                 |
| `imputer_cat_v2c.pkl`       | SimpleImputer(strategy='most_frequent') para las 9 categóricas                                        |
| `pipeline_completo_v2c.pkl` | Pipeline completo encadenado (alternativa a cargar cada pieza por separado)                           |
| `feature_names_v2c.json`    | JSON con features originales, post-OHE, columnas numéricas, categóricas, escaladas y categorías raras |
| `metadata_v2c.json`         | Metadata completa del modelo                                                                          |

> 💡 **Opción recomendada**: Usar `pipeline_completo_v2c.pkl` que encapsula todo el pipeline (imputers + OHE + scaler + modelo) en un solo objeto. Alternativa: cargar cada artefacto por separado para mayor control.

### Metadata del modelo (`metadata_v2c.json`)

```json
{
  "version": "V2_Corregido_1.0",
  "modelo_nombre": "Extra_Trees_Calibrado",
  "modelo_tipo": "CalibratedClassifierCV",
  "calibrado": true,
  "n_features_originales": 15,
  "n_features_post_ohe": 37,
  "encoding": "OneHotEncoder(drop=first, handle_unknown=ignore)",
  "escalado": "StandardScaler(solo continuas >2 unique)",
  "balanceo": "SMOTE",
  "pesos_clinicos": { "0": 1.0, "1": 2.0, "2": 5.0 },
  "random_seed": 42,
  "metricas_holdout": {
    "accuracy": 0.9195,
    "f1_macro": 0.9256,
    "f1_weighted": 0.9195,
    "recall_severa": 0.9,
    "precision_macro": 0.943,
    "scorer_clinico": 0.9328,
    "errores_sev_leve": 0,
    "gap_sobreajuste": 0.0062
  },
  "metricas_nested_cv": {
    "accuracy": "0.9219±0.0071",
    "f1_macro": "0.9219±0.0070",
    "scorer_clinico": "0.9575±0.0062",
    "recall_severa": "0.9886±0.0140",
    "errores_sev_leve_total": 0
  },
  "train_size": 525,
  "test_size": 87,
  "clases": { "0": "Leve", "1": "Moderada", "2": "Severa" }
}
```

---

## VARIABLES CLÍNICAS DE ENTRADA (15 variables originales)

### Variables Numéricas (6)

| #   | Variable                                                | Tipo  | Notas                       |
| --- | ------------------------------------------------------- | ----- | --------------------------- |
| 1   | Tiempo días de inicio de la fiebre en fecha de consulta | int   | Días desde inicio de fiebre |
| 2   | Glasgow                                                 | int   | Escala de coma, rango 3-15  |
| 3   | Cayados absolutos                                       | float | cel/mm³                     |
| 4   | Plaquetas cel/mm³                                       | float | cel/mm³                     |
| 5   | Albúmina sérica g/dl                                    | float | g/dl                        |
| 6   | Globulina sérica g/dl                                   | float | g/dl                        |

### Variables Categóricas (9)

| #   | Variable                                             | Opciones válidas                                                                                                                                                                   |
| --- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Grupo edad años                                      | `"Menor de 2"`, `"2-5"`, `"6-12"`, `"Otro"` (13-17 se agrupa aquí)                                                                                                                 |
| 2   | Sexo                                                 | `"Femenino"`, `"Masculino"`                                                                                                                                                        |
| 3   | Área                                                 | `"Rural"`, `"Urban"`                                                                                                                                                               |
| 4   | Vacunación                                           | `"Completo"`, `"Incompleto"`                                                                                                                                                       |
| 5   | Antecedentes personales de patologías                | `"Ninguno"`, `"Asma"`, `"Bronquiolitis"`, `"Anemia por déficit de hierro"`, `"Impétigo"`, `"Neumonía adquirida en la comunidad"`, `"Otitis media aguda"`, `"Pretérmino"`, `"Otro"` |
| 6   | Contacto epidemiológico con enfermedades infecciosas | `"Ninguno"`, `"Rinofaringitis"`, `"Neumonía adquirida en la comunidad"`, `"Sinusitis"`, `"Otro"`                                                                                   |
| 7   | Exposición ambiental                                 | `"Ninguno"`, `"Polución ambiental"`, `"Polvo casero"`, `"Preservativos químicos"`, `"Tabaquismo"`                                                                                  |
| 8   | Estado nutricional                                   | `"Normal"`, `"Riesgo de desnutrición"`, `"Otro"` (Obesidad se agrupa aquí)                                                                                                         |
| 9   | Nivel de Triage por el TEP                           | `"Nivel I"`, `"Nivel II"`, `"Nivel III"`, `"Nivel IV"`                                                                                                                             |

### Categorías Raras (se agrupan como "Otro")

```json
{
  "Grupo edad años": ["13-17"],
  "Antecedentes personales de patologías": [
    "Sinusitis",
    "Infección urinaria",
    "Secuelas enfermedad neurológica",
    "Rinitis",
    "Anemia de células falciformes",
    "Cardiopatía congénita",
    "Convulsión febril",
    "Desnutrición",
    "Hipertrofia de adenoides",
    "Dengue",
    "Sepsis neonatal",
    "Mucopolisacaridosis",
    "Meningitis",
    "Trisomía 21",
    "Fibrosis quística",
    "Rinofaringitis",
    "Dermatitis atópica",
    "Laringomalacia",
    "Riñón poliquístico",
    "Leucemia linfoide aguda"
  ],
  "Contacto epidemiológico con enfermedades infecciosas": [
    "Amigdalitis",
    "Impétigo",
    "Enfermedad diarreica aguda",
    "Dengue",
    "Tuberculosis pulmonar"
  ],
  "Estado nutricional": ["Obesidad"]
}
```

### Features post-OHE (37 columnas — el modelo espera exactamente estas en este orden)

```json
[
  "Tiempo dias de inicio de la fiebre en fecha de consulta",
  "Glasgow",
  "Cayados absolutos",
  "Plaquetas cel/mm3",
  "Albúmina sérica g/dl",
  "Globulina sérica g/dl",
  "Grupo edad años_2-5",
  "Grupo edad años_6-12",
  "Grupo edad años_Otro",
  "Sexo_Masculino",
  "Area_Urban",
  "Vacunación_Incompleto",
  "Antecedentes personales de patologías_Anemia por déficit de hierro",
  "Antecedentes personales de patologías_Asma",
  "Antecedentes personales de patologías_Bronquiolitis",
  "Antecedentes personales de patologías_Impétigo",
  "Antecedentes personales de patologías_Neumonía adquirida en la comunidad",
  "Antecedentes personales de patologías_Ninguno",
  "Antecedentes personales de patologías_Otitis media aguda",
  "Antecedentes personales de patologías_Otro",
  "Antecedentes personales de patologías_Pretérmino",
  "Contacto epidemiologico con enfermedades infecciosas_Neumonía adquirida en la comunidad",
  "Contacto epidemiologico con enfermedades infecciosas_Ninguno",
  "Contacto epidemiologico con enfermedades infecciosas_Otro",
  "Contacto epidemiologico con enfermedades infecciosas_Rinofaringitis",
  "Contacto epidemiologico con enfermedades infecciosas_Sinusitis",
  "Exposicion ambiental_Ninguno",
  "Exposicion ambiental_Polución ambiental",
  "Exposicion ambiental_Polvo casero",
  "Exposicion ambiental_Preservativos químicos",
  "Exposicion ambiental_Tabaquismo",
  "Estado nutricional_Normal",
  "Estado nutricional_Otro",
  "Estado nutricional_Riesgo de desnutrición",
  "Nivel de Triage por el TEP_Nivel II",
  "Nivel de Triage por el TEP_Nivel III",
  "Nivel de Triage por el TEP_Nivel IV"
]
```

---

## PIPELINE DE PREDICCIÓN EN EL BACKEND (ORDEN ESTRICTO)

**Todos los artefactos ya están exportados como `.pkl`** en `artefactos_modelo_v2/`.

### Opción A: Pipeline completo (RECOMENDADO)

```python
import pickle

# Cargar pipeline completo (incluye imputers + OHE + scaler + modelo)
with open('artifacts/pipeline_completo_v2c.pkl', 'rb') as f:
    pipeline = pickle.load(f)

# Usar directamente
prediccion = pipeline.predict(datos_paciente_dataframe)
probabilidades = pipeline.predict_proba(datos_paciente_dataframe)
```

### Opción B: Artefactos individuales (mayor control)

1. **Recibir** los 15 valores originales del formulario
2. **Agrupar categorías raras** según el mapping (ver sección de categorías raras):
   - `"Grupo edad años"`: si es `"13-17"` → `"Otro"`
   - `"Antecedentes personales de patologías"`: si el valor no está en las opciones principales → `"Otro"`
   - `"Contacto epidemiológico"`: si no está en las principales → `"Otro"`
   - `"Estado nutricional"`: si es `"Obesidad"` → `"Otro"`
3. **Imputar valores faltantes** usando los imputers exportados:
   - `imputer_num_v2c.pkl` → para las 6 numéricas (median)
   - `imputer_cat_v2c.pkl` → para las 9 categóricas (most_frequent)
4. **OneHotEncoder** usando `ohe_v2c.pkl` → sobre las 9 categóricas
5. **StandardScaler** usando `scaler_v2c.pkl` → SOLO sobre las 6 numéricas
6. **Concatenar** `[numéricas_escaladas, columnas_OHE]` → 37 features en el orden exacto
7. **Predecir** con `modelo_v2c.pkl`:
   - `modelo.predict()` → clase predicha
   - `modelo.predict_proba()` → probabilidades por clase

> ⚠️ **CRÍTICO**: Si un paso se ejecuta fuera de orden, las predicciones serán incorrectas.

---

## ARQUITECTURA REQUERIDA

### FRONTEND — Next.js 14+ (App Router)

Existe un frontend base de referencia en la carpeta `frontend_base/` con:

- Login page (actualmente con credenciales hardcoded — reemplazar con Supabase)
- Dashboard principal
- Evaluación de paciente (formulario con predicción simulada en JavaScript — reemplazar con llamada real a FastAPI)
- Historial de pacientes
- Rendimiento del modelo
- Sidebar con navegación (Dashboard, Evaluación, Rendimiento, Historial)
- Soporte dark/light mode (ThemeContext)
- Diseño responsive
- CSS puro con custom properties para theming (NO usa Tailwind)

**LO QUE SE NECESITA HACER:**

1. **Reemplazar** la autenticación hardcoded por **Supabase Auth** (email/password)
2. **Agregar** página de **registro** para médicos nuevos
3. **Conectar** el formulario de Evaluación al **backend FastAPI real** (eliminar la función `simulatePrediction()` del JS)
4. **Guardar** cada evaluación en **Supabase** (tabla de historial)
5. El **historial** debe leer de Supabase, no de localStorage
6. **Dashboard** con estadísticas reales de las evaluaciones realizadas
7. Página de **Rendimiento del Modelo** con las métricas reales del modelo (desde `/api/model/metrics`)

### BACKEND — FastAPI (Python)

Endpoints requeridos:

| Método | Ruta                 | Descripción                                                                                    |
| ------ | -------------------- | ---------------------------------------------------------------------------------------------- |
| `POST` | `/api/predict`       | Recibe JSON con 15 variables, ejecuta pipeline, retorna predicción + probabilidades + factores |
| `GET`  | `/api/model/info`    | Retorna metadata del modelo (versión, tipo, fecha)                                             |
| `GET`  | `/api/model/metrics` | Retorna métricas de rendimiento del modelo                                                     |
| `GET`  | `/api/health`        | Health check                                                                                   |

Requisitos técnicos:

- CORS configurado para el frontend
- Cargar los artefactos `.pkl` de `artefactos_modelo_v2/` **al iniciar la app** (no recargar en cada request)
- Validación de JWT de Supabase en cada endpoint protegido

### AUTH & DB — Supabase

- Autenticación con email/password
- Tabla `profiles` (id, email, nombre, especialidad, institución, created_at)
- Tabla `evaluaciones` (id, user_id, datos_paciente JSONB, prediccion, probabilidades JSONB, factores JSONB, created_at)
- **Row Level Security**: cada médico solo ve sus propias evaluaciones
- El frontend maneja el token JWT de Supabase y lo envía al backend en el header `Authorization: Bearer <token>`

---

## ESTRUCTURA DE CARPETAS DEL PROYECTO A CREAR

```
proyecto/
├── frontend/                          # Next.js 14
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.js
│   │   │   └── register/page.js
│   │   ├── (dashboard)/
│   │   │   ├── layout.js
│   │   │   ├── dashboard/page.js
│   │   │   ├── evaluacion/page.js
│   │   │   ├── historial/page.js
│   │   │   └── rendimiento/page.js
│   │   ├── components/
│   │   │   ├── Sidebar.js
│   │   │   ├── PatientForm.js
│   │   │   ├── PredictionResult.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   ├── AuthContext.js          # Supabase Auth
│   │   │   └── ThemeContext.js
│   │   ├── lib/
│   │   │   ├── supabase.js             # Cliente Supabase
│   │   │   └── api.js                  # Llamadas a FastAPI
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js
│   ├── package.json
│   └── .env.local
│
├── backend/                            # FastAPI
│   ├── app/
│   │   ├── main.py                     # FastAPI app + CORS
│   │   ├── routes/
│   │   │   ├── predict.py              # /api/predict
│   │   │   └── model_info.py           # /api/model/*
│   │   ├── services/
│   │   │   ├── ml_service.py           # Carga modelo + pipeline de predicción
│   │   │   └── auth.py                 # Verificar JWT de Supabase
│   │   ├── models/
│   │   │   └── schemas.py              # Pydantic schemas
│   │   └── config.py                   # Settings
│   ├── artifacts/                      # ← Copiar aquí el contenido de artefactos_modelo_v2/
│   │   ├── modelo_v2c.pkl
│   │   ├── scaler_v2c.pkl
│   │   ├── ohe_v2c.pkl
│   │   ├── imputer_num_v2c.pkl
│   │   ├── imputer_cat_v2c.pkl
│   │   ├── pipeline_completo_v2c.pkl
│   │   ├── feature_names_v2c.json
│   │   └── metadata_v2c.json
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
├── supabase/
│   └── migrations/
│       └── 001_initial.sql             # SQL para tablas + RLS policies
│
├── docker-compose.yml
└── README.md
```

---

## SQL PARA SUPABASE

```sql
-- Tabla de perfiles de médicos
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  especialidad TEXT,
  institucion TEXT DEFAULT 'Universidad del Sinú',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de evaluaciones
CREATE TABLE evaluaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  datos_paciente JSONB NOT NULL,
  prediccion TEXT NOT NULL,        -- 'Leve', 'Moderada', 'Severa'
  prediccion_codigo INT NOT NULL,  -- 0, 1, 2
  probabilidades JSONB NOT NULL,   -- {"leve": 0.85, "moderada": 0.10, "severa": 0.05}
  factores JSONB,                  -- ["Glasgow alterado", ...]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: cada médico solo ve sus evaluaciones
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own evaluaciones"
  ON evaluaciones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own evaluaciones"
  ON evaluaciones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Sin nombre')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## PYDANTIC SCHEMAS PARA FASTAPI

```python
from pydantic import BaseModel, Field
from typing import Optional

class PatientInput(BaseModel):
    grupo_edad: str = Field(..., description="Grupo edad años: 'Menor de 2', '2-5', '6-12', '13-17'")
    sexo: str = Field(..., description="'Femenino' o 'Masculino'")
    area: str = Field(..., description="'Rural' o 'Urban'")
    tiempo_fiebre: int = Field(..., ge=0, le=60, description="Días desde inicio de fiebre")
    vacunacion: str = Field(..., description="'Completo' o 'Incompleto'")
    antecedentes: str = Field(..., description="Antecedentes personales de patologías")
    contacto_epidemiologico: str = Field(..., description="Contacto epidemiológico con enfermedades infecciosas")
    exposicion_ambiental: str = Field(..., description="Exposición ambiental")
    estado_nutricional: str = Field(..., description="Estado nutricional")
    glasgow: int = Field(..., ge=3, le=15, description="Escala de Glasgow")
    triage: str = Field(..., description="Nivel de Triage por el TEP: 'Nivel I' a 'Nivel IV'")
    cayados: Optional[float] = Field(None, ge=0, description="Cayados absolutos cel/mm³")
    plaquetas: Optional[float] = Field(None, ge=0, description="Plaquetas cel/mm³")
    albumina: Optional[float] = Field(None, ge=0, description="Albúmina sérica g/dl")
    globulina: Optional[float] = Field(None, ge=0, description="Globulina sérica g/dl")

class PredictionOutput(BaseModel):
    prediccion: str                # "Leve", "Moderada", "Severa"
    codigo: int                    # 0, 1, 2
    probabilidades: dict           # {"leve": 0.85, "moderada": 0.10, "severa": 0.05}
    factores: list[str]            # Factores contribuyentes
    confianza: float               # Probabilidad máxima
    disclaimer: str                # Disclaimer legal obligatorio
```

---

## SCORER CLÍNICO PERSONALIZADO

El modelo fue optimizado con este scorer personalizado:

```python
def scorer_clinico_v2c(y_true, y_pred):
    """50% F1-macro + 30% Recall Severa + 20% Seguridad (penaliza Sev→Lev)"""
    f1_m = f1_score(y_true, y_pred, average='macro', zero_division=0)
    recall_sev = recall_score(y_true, y_pred, labels=[2], average='micro', zero_division=0)
    mask_severo = (y_true == 2)
    if mask_severo.sum() > 0:
        errores_criticos = (y_pred[mask_severo] == 0).sum()
        seguridad = 1 - errores_criticos / mask_severo.sum()
    else:
        seguridad = 1.0
    return 0.5 * f1_m + 0.3 * recall_sev + 0.2 * seguridad
```

**Prioridad**: Nunca clasificar un paciente Severo como Leve (error crítico = 0).

---

## CONSIDERACIONES CRÍTICAS

### Seguridad

- NUNCA exponer credenciales de Supabase en el código
- Validar el JWT de Supabase en CADA endpoint del backend
- Sanitizar todas las entradas del formulario (inyección SQL/XSS)
- HTTPS en producción
- Variables de entorno para TODO lo sensible
- No almacenar nombres ni identificación del paciente (HIPAA). Solo datos clínicos anónimos
- Rate limiting en `/api/predict` para evitar abuso

### Modelo ML

- El modelo V2 espera **EXACTAMENTE 37 features** post-OHE en el orden correcto (ver lista arriba)
- Si una categoría nueva llega que no existía en el entrenamiento, `handle_unknown='ignore'` la ignorará (todas las columnas OHE = 0)
- El scaler SOLO se aplica a las 6 columnas numéricas, NO a las columnas OHE
- Los artefactos se cargan **UNA VEZ** al inicio del servidor (no por request)
- Incluir validación de rangos clínicos (Glasgow 3-15, Plaquetas > 0, etc.)
- **Todos los artefactos del pipeline V2 ya están exportados** como `.pkl`: modelo, scaler, OHE, imputer numérico, imputer categórico, y pipeline completo. No hace falta reconstruir nada
- También existe un `pipeline_completo_v2c.pkl` que encapsula todo en un solo objeto (opción más simple)

### UX Médica

- El formulario debe ser claro y rápido de llenar
- Los campos categóricos deben ser **selects/dropdowns**, no texto libre
- Mostrar las probabilidades de las **3 clases**, no solo la predicha
- Usar código de colores: 🟢 Verde = Leve, 🟡 Amarillo = Moderada, 🔴 Rojo = Severa
- Incluir **disclaimer obligatorio**: _"Esta herramienta es de apoyo a la decisión clínica, no reemplaza el juicio médico"_
- Soporte responsive para **tablets** (uso en urgencias)
- El formulario existente en `frontend_base/` es un buen punto de partida visual

### Frontend base de referencia

- Usa **CSS puro** con custom properties para theming (dark/light mode). **Mantener ese enfoque**, no migrar a Tailwind
- AuthContext actual usa credenciales hardcoded → reemplazar con Supabase
- La función `simulatePrediction()` en evaluación es una simulación JS → reemplazar con llamada real a FastAPI
- Sidebar ya tiene la navegación completa

---

## VARIABLES DE ENTORNO

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`.env`)

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_JWT_SECRET=tu-jwt-secret-de-supabase
ALLOWED_ORIGINS=http://localhost:3000
# Opción A: Pipeline completo (recomendado)
PIPELINE_PATH=./artifacts/pipeline_completo_v2c.pkl
# Opción B: Artefactos individuales
MODEL_PATH=./artifacts/modelo_v2c.pkl
SCALER_PATH=./artifacts/scaler_v2c.pkl
OHE_PATH=./artifacts/ohe_v2c.pkl
IMPUTER_NUM_PATH=./artifacts/imputer_num_v2c.pkl
IMPUTER_CAT_PATH=./artifacts/imputer_cat_v2c.pkl
FEATURES_PATH=./artifacts/feature_names_v2c.json
METADATA_PATH=./artifacts/metadata_v2c.json
```

---

## TECNOLOGÍAS Y VERSIONES

| Componente | Tecnología           | Versión                                   |
| ---------- | -------------------- | ----------------------------------------- |
| Frontend   | Next.js (App Router) | 14+                                       |
| Frontend   | React                | 18                                        |
| Frontend   | Supabase Client      | `@supabase/supabase-js` / `@supabase/ssr` |
| Frontend   | Estilos              | CSS puro (custom properties)              |
| Backend    | FastAPI              | 0.110+                                    |
| Backend    | Uvicorn              | Latest                                    |
| Backend    | scikit-learn         | 1.6.1                                     |
| Backend    | pandas               | Latest                                    |
| Backend    | numpy                | Latest                                    |
| Backend    | python-jose          | JWT verification                          |
| Backend    | imbalanced-learn     | Para compatibilidad con el modelo         |
| DB         | Supabase             | PostgreSQL managed                        |

---

## DEPLOY SUGERIDO

| Componente    | Plataforma                    | Notas                               |
| ------------- | ----------------------------- | ----------------------------------- |
| Frontend      | **Vercel**                    | Deploy automático desde GitHub      |
| Backend       | **Railway** / Render / Fly.io | Soporte para Python + archivos .pkl |
| Base de datos | **Supabase Cloud**            | Free tier disponible                |

---

## ORDEN DE IMPLEMENTACIÓN RECOMENDADO

1. **Backend FastAPI** — Endpoint `/api/predict` funcional cargando los `.pkl` de `artefactos_modelo_v2/`
2. **Supabase** — Crear proyecto, tablas, RLS policies, auth
3. **Frontend Auth** — Integrar Supabase Auth (login + registro)
4. **Conectar Evaluación** — Formulario → FastAPI real (eliminar `simulatePrediction`)
5. **Historial** — CRUD con Supabase (guardar + listar evaluaciones)
6. **Dashboard** — Estadísticas reales de evaluaciones
7. **Rendimiento** — Métricas del modelo desde `/api/model/metrics`
8. **Tests** — Tests básicos para el pipeline de predicción
9. **Documentación** — README con instrucciones de setup local

---

## CONTENIDO DE ESTA CARPETA (`material produccion/`)

```
material produccion/
├── prompt.md                      ← ESTE ARCHIVO (instrucciones completas)
├── artefactos_modelo_v2/          ← Artefactos del modelo V2 listos para producción
│   ├── modelo_v2c.pkl
│   ├── scaler_v2c.pkl
│   ├── ohe_v2c.pkl
│   ├── imputer_num_v2c.pkl
│   ├── imputer_cat_v2c.pkl
│   ├── pipeline_completo_v2c.pkl
│   ├── feature_names_v2c.json
│   └── metadata_v2c.json
└── frontend_base/                 ← Frontend Next.js de referencia (diseño existente)
    ├── package.json
    ├── jsconfig.json
    ├── next.config.mjs
    └── app/
        ├── globals.css
        ├── layout.js
        ├── page.js
        ├── (dashboard)/
        │   ├── layout.js
        │   ├── dashboard/page.js
        │   ├── evaluacion/page.js
        │   ├── historial/page.js
        │   └── rendimiento/page.js
        ├── components/
        │   └── Sidebar.js
        ├── context/
        │   ├── AuthContext.js
        │   └── ThemeContext.js
        └── login/
            └── page.js
```

---

## NOTAS FINALES

- El modelo **V2 Corregido ya está entrenado y exportado**. NO necesitas reentrenar nada.
- Todos los artefactos `.pkl` están en `artefactos_modelo_v2/` con nombres limpios, listos para copiar a `backend/artifacts/`.
- El frontend base en `frontend_base/` tiene el diseño visual completo. Usarlo como referencia de UI/UX.
- La investigación es liderada por la **Dra. Fontalvo** de la Universidad del Sinú, Cartagena.
- El proyecto es para uso en **urgencias pediátricas** — la velocidad y claridad son prioritarias.
