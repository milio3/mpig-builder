# -*- coding: utf-8 -*-
"""
app/api/v1/meta.py - Endpoints de Metadatos del Juego
Provee la configuración de héroes, habilidades activas y pasivas directamente desde SQLite.
"""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.meta import GameMetaResponse
from app.services.meta_service import get_game_metadata

router = APIRouter(prefix="/meta", tags=["Metadatos"])

@router.get("", response_model=GameMetaResponse)
def get_metadata(response: Response, db: Session = Depends(get_db)):
    """Retorna los datos completos de héroes, habilidades y configuraciones de filas."""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return get_game_metadata(db)

