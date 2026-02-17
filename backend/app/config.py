"""Configuración central del backend."""
from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    # Supabase
    supabase_url: str = ""
    supabase_jwt_secret: str = ""
    supabase_anon_key: str = ""

    # CORS
    allowed_origins: str = "http://localhost:3000"

    # Artifacts paths
    pipeline_path: str = "./artifacts/pipeline_completo_v2c.pkl"
    metadata_path: str = "./artifacts/metadata_v2c.json"
    features_path: str = "./artifacts/feature_names_v2c.json"

    # Rate limiting
    rate_limit: str = "30/minute"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
