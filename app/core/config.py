# -*- coding: utf-8 -*-
"""
app/core/config.py - Configuración Centralizada de la Aplicación
Carga y valida las variables de entorno mediante Pydantic Settings.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "MPIG Builder"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    DATABASE_URL: str = "sqlite:///./data/mpig.db"
    HTTP_TIMEOUT_SECONDS: float = 10.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
