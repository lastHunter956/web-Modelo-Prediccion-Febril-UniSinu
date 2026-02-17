# 🏥 Predicción de Severidad Febril Pediátrica

**Universidad del Sinú · Cartagena, Colombia**

Sistema web para predecir la severidad de cuadros febriles en pacientes pediátricos usando Machine Learning.

## 📋 Stack

| Componente    | Tecnología                                 |
| ------------- | ------------------------------------------ |
| **Frontend**  | Next.js 14 (App Router)                    |
| **Backend**   | FastAPI (Python 3.11)                      |
| **Modelo ML** | Extra Trees Calibrado (scikit-learn 1.6.1) |
| **Auth & DB** | Supabase (Auth + Postgres)                 |
| **Estilos**   | Vanilla CSS (Dark/Light mode)              |

## ⚡ Setup Rápido

### 1. Supabase

1. Ve a tu proyecto de Supabase → SQL Editor
2. Ejecuta el contenido de `supabase/migrations/001_initial.sql`
3. Copia tu `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `JWT_SECRET` desde Settings → API

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

Edita `backend/.env` con tus credenciales de Supabase:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_JWT_SECRET=tu-jwt-secret
```

Inicia el servidor:

```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
```

Edita `frontend/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Inicia el dev server:

```bash
npm run dev
```

### 4. Docker (Alternativa)

Copia el archivo `.env` en la raíz del proyecto con tus credenciales:

```bash
cp .env.example .env  # Editar con tus valores
docker-compose up --build
```

Accede a:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/health
- **Docs API**: http://localhost:8000/docs

## 🧠 Modelo ML

- **Algoritmo**: Extra Trees Classifier + CalibratedClassifierCV
- **15 Variables Clínicas**: grupo edad, sexo, área, tiempo de fiebre, vacunación, antecedentes, contacto epidemiológico, exposición ambiental, estado nutricional, Glasgow, triage TEP, cayados, plaquetas, albúmina, globulina
- **3 Clases**: Leve (0), Moderada (1), Severa (2)
- **Métricas**: Accuracy 91.95% | F1-Macro 92.56% | 0 errores críticos

## 📁 Estructura

```
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app
│   │   ├── config.py          # Settings
│   │   ├── models/schemas.py  # Pydantic schemas
│   │   ├── routes/
│   │   │   ├── predict.py     # POST /api/predict
│   │   │   └── model_info.py  # GET /api/model/info & metrics
│   │   └── services/
│   │       ├── ml_service.py  # Pipeline loader
│   │       └── auth.py        # JWT verification
│   ├── artifacts/             # ML .pkl files
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── (auth)/login/      # Login page
│   │   ├── (auth)/register/   # Register page
│   │   ├── (dashboard)/       # Dashboard, Evaluación, Historial, Rendimiento
│   │   ├── components/        # Sidebar, PatientForm, PredictionResult
│   │   ├── context/           # AuthContext (Supabase), ThemeContext
│   │   └── lib/               # supabase.js, api.js
│   └── .env.local
├── supabase/migrations/       # SQL para crear tablas
└── docker-compose.yml
```

## ⚕️ Disclaimer

Esta herramienta es de apoyo a la decisión clínica y **no reemplaza el juicio médico profesional**.
