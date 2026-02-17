# 🚀 Guía de Despliegue — Predicción Febril Pediátrica

Este proyecto consta de **dos servicios** independientes:

| Servicio     | Stack        | Puerto | Directorio   |
| ------------ | ------------ | ------ | ------------ |
| **Backend**  | FastAPI + ML | 8000   | `./backend`  |
| **Frontend** | Next.js 14   | 3000   | `./frontend` |

---

## 📦 Opción 1 — Railway.com

Railway permite desplegar **cada servicio como un "Service"** dentro de un proyecto.

### Paso 1 · Crear el proyecto

1. Ve a [railway.com](https://railway.com) e inicia sesión.
2. Click **"New Project"** → **"Deploy from GitHub Repo"**.
3. Conecta tu repositorio de GitHub.

### Paso 2 · Servicio Backend

1. En el proyecto, click **"+ New Service"** → **"GitHub Repo"** (el mismo repo).
2. En **Settings → Source**:
   - **Root Directory**: `backend`
   - **Builder**: `Dockerfile`
3. En **Settings → Networking**:
   - Habilita **"Public Networking"** para generar un dominio público.
   - Anota la URL generada, ej: `https://backend-xxx.up.railway.app`
4. En **Variables**, agrega:
   ```
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_JWT_SECRET=tu-jwt-secret
   SUPABASE_ANON_KEY=tu-anon-key
   ALLOWED_ORIGINS=https://frontend-xxx.up.railway.app
   PIPELINE_PATH=./artifacts/pipeline_completo_v2c.pkl
   METADATA_PATH=./artifacts/metadata_v2c.json
   FEATURES_PATH=./artifacts/feature_names_v2c.json
   ```
5. Click **Deploy**.

### Paso 3 · Servicio Frontend

1. Click **"+ New Service"** → **"GitHub Repo"** (mismo repo).
2. En **Settings → Source**:
   - **Root Directory**: `frontend`
   - **Builder**: `Dockerfile`
3. En **Settings → Networking**:
   - Habilita **"Public Networking"**.
4. En **Variables**, agrega:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   NEXT_PUBLIC_API_URL=https://backend-xxx.up.railway.app
   ```

   > ⚠️ `NEXT_PUBLIC_API_URL` debe apuntar a la URL pública del backend (paso 2).

5. Click **Deploy**.

### Paso 4 · Actualizar CORS

Una vez que tengas la URL del frontend, ve al servicio **backend** → **Variables** y actualiza:

```
ALLOWED_ORIGINS=https://tu-frontend.up.railway.app
```

Redeploy el backend para aplicar el cambio.

---

## 📦 Opción 2 — Dockploy

Dockploy soporta `docker-compose.yml` directamente.

### Paso 1 · Preparar variables

1. Copia `.env.example` como `.env` y completa los valores reales.
2. Cambia `NEXT_PUBLIC_API_URL` al dominio que Dockploy asigne al backend.
3. Cambia `ALLOWED_ORIGINS` al dominio que Dockploy asigne al frontend.

### Paso 2 · Desplegar

1. Sube el repo a Dockploy.
2. Dockploy detectará `docker-compose.yml` y levantará ambos servicios.
3. Asigna dominios públicos a backend (puerto 8000) y frontend (puerto 3000).

---

## 🐳 Opción 3 — VPS con Docker Compose

Para un servidor propio (DigitalOcean, Hetzner, etc.):

```bash
# Clonar repo
git clone <tu-repo> && cd <tu-repo>

# Configurar variables
cp .env.example .env
nano .env   # completar valores reales

# Construir y levantar
docker compose up --build -d

# Ver logs
docker compose logs -f
```

---

## 🔑 Variables de Entorno (referencia rápida)

### Backend

| Variable              | Descripción                               | Ejemplo                                 |
| --------------------- | ----------------------------------------- | --------------------------------------- |
| `SUPABASE_URL`        | URL de tu proyecto Supabase               | `https://xxx.supabase.co`               |
| `SUPABASE_JWT_SECRET` | JWT Secret de Supabase (Settings → API)   | `puh7cOxi...`                           |
| `SUPABASE_ANON_KEY`   | Anon/Public key de Supabase               | `eyJhbGci...`                           |
| `ALLOWED_ORIGINS`     | URLs del frontend (CORS), separar con `,` | `https://mi-app.railway.app`            |
| `PIPELINE_PATH`       | Ruta al modelo ML                         | `./artifacts/pipeline_completo_v2c.pkl` |
| `METADATA_PATH`       | Ruta a metadata del modelo                | `./artifacts/metadata_v2c.json`         |
| `FEATURES_PATH`       | Ruta a nombres de features                | `./artifacts/feature_names_v2c.json`    |

### Frontend (build-time)

| Variable                        | Descripción                 | Ejemplo                              |
| ------------------------------- | --------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL de Supabase             | `https://xxx.supabase.co`            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase        | `eyJhbGci...`                        |
| `NEXT_PUBLIC_API_URL`           | URL **pública** del backend | `https://backend-xxx.up.railway.app` |

> **Nota:** Las variables `NEXT_PUBLIC_*` se incrustan en build-time. Si cambias alguna, debes **rebuildar** el frontend.

---

## 🩺 Verificar despliegue

```bash
# Health check del backend
curl https://tu-backend.railway.app/api/health

# Respuesta esperada
# {"status":"ok","model_loaded":true,"version":"2.0.0"}
```

Abre la URL del frontend en el navegador y prueba login + evaluación.

---

## 🔧 Solución de problemas

| Problema                       | Solución                                                        |
| ------------------------------ | --------------------------------------------------------------- |
| Frontend no conecta al backend | Verificar `NEXT_PUBLIC_API_URL` y rebuildar el frontend         |
| Error CORS                     | Verificar `ALLOWED_ORIGINS` en backend incluye URL del frontend |
| Modelo no carga                | Verificar que `artifacts/` está incluido en la imagen Docker    |
| 503 en `/api/predict`          | El modelo no se cargó; revisar logs del backend                 |
| Timeout en build del frontend  | Normal en free tier; esperar o escalar recursos                 |
