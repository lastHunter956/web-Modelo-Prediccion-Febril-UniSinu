FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar artefactos del modelo
COPY artifacts/ ./artifacts/

# Copiar código de la aplicación
COPY app/ ./app/

# Railway / Dockploy inyectan variables de entorno; no se necesita .env
# COPY .env* ./

# Railway asigna PORT dinámicamente; por defecto 8000
ENV PORT=8000
EXPOSE ${PORT}

# Healthcheck para plataformas que lo soporten
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Usar shell form para que $PORT se resuelva en runtime
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
