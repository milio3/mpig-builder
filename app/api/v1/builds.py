# -*- coding: utf-8 -*-
"""
app/api/v1/builds.py - Endpoints CRUD para Gestión de Builds en Base de Datos
Permite guardar, listar, cargar y borrar configuraciones de builds.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.build import BuildCreate, BuildResponse, BuildListItem
from app.services.build_service import create_build, list_builds, get_build_by_id_or_code, delete_build

router = APIRouter(prefix="/builds", tags=["Builds"])

@router.get("", response_model=List[BuildListItem])
def get_all_builds(limit: int = 50, db: Session = Depends(get_db)):
    """Lista las builds guardadas en la base de datos."""
    return list_builds(db, limit=limit)

@router.post("", response_model=BuildResponse, status_code=status.HTTP_201_CREATED)
def save_build(build_in: BuildCreate, db: Session = Depends(get_db)):
    """Guarda una nueva build en la base de datos SQLite y retorna su código único."""
    return create_build(db, build_in)

@router.get("/{identifier}", response_model=BuildResponse)
def get_build(identifier: str, db: Session = Depends(get_db)):
    """Recupera una build específica mediante su ID numérico o código compartible."""
    build = get_build_by_id_or_code(db, identifier)
    if not build:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró ninguna build con el identificador '{identifier}'."
        )
    return build

@router.delete("/{build_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_build(build_id: int, db: Session = Depends(get_db)):
    """Elimina una build guardada de la base de datos."""
    success = delete_build(db, build_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró la build con ID {build_id} para eliminar."
        )
    return None
