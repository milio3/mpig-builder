# -*- coding: utf-8 -*-
"""
app/api/health.py - Endpoints de Salud y Estado
Implementa los estándares de liveness y readiness definidos en GEMINI.md.
"""

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from app.core.database import engine
from app.core.config import settings

router = APIRouter(tags=["Salud"])

@router.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """Chequeo de vitalidad (liveness): confirma que el proceso web está respondiendo."""
    return {"status": "ok", "version": settings.VERSION}

@router.get("/ready", status_code=status.HTTP_200_OK)
def ready_check():
    """Chequeo de disponibilidad (readiness): confirma conectividad activa con SQLite."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "unready", "database_error": str(e)}
        )
