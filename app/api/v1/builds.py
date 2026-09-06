# -*- coding: utf-8 -*-
"""
app/api/v1/builds.py - Endpoints CRUD para Gestión de Builds en Base de Datos
Permite guardar, listar, cargar y borrar configuraciones de builds.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.rate_limiter import rate_limit_writes, rate_limit_reads, get_client_ip
from app.schemas.build import (
    BuildCreate,
    BuildResponse,
    BuildListItem,
    BuildVoteResponse,
    DeletionRequestCreate,
    DeletionRequestResponse
)
from app.services.build_service import (
    create_build,
    list_builds,
    get_build_by_id_or_code,
    vote_build,
    create_deletion_request,
    delete_build
)

router = APIRouter(prefix="/builds", tags=["Builds"])

@router.get("", response_model=List[BuildListItem], dependencies=[Depends(rate_limit_reads)])
def get_all_builds(
    response: Response,
    sort: str = "votes",
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Lista las builds guardadas ordenadas por 'votes' o 'recent' con límite configurable."""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return list_builds(db, sort=sort, limit=limit)

@router.post("", response_model=BuildResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(rate_limit_writes)])
def save_build(build_in: BuildCreate, db: Session = Depends(get_db)):
    """Guarda una nueva build en la base de datos SQLite y retorna su código único."""
    return create_build(db, build_in)

@router.get("/{identifier}", response_model=BuildResponse, dependencies=[Depends(rate_limit_reads)])
def get_build(identifier: str, db: Session = Depends(get_db)):
    """Recupera una build específica mediante su ID numérico o código compartible."""
    build = get_build_by_id_or_code(db, identifier)
    if not build:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró ninguna build con el identificador '{identifier}'."
        )
    return build

@router.post("/{build_id}/vote", response_model=BuildVoteResponse, dependencies=[Depends(rate_limit_writes)])
def add_vote(build_id: int, db: Session = Depends(get_db)):
    """Registra un voto a favor de una build específica."""
    new_votes = vote_build(db, build_id)
    if new_votes is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró la build con ID {build_id} para votar."
        )
    return BuildVoteResponse(id=build_id, votes=new_votes)

@router.post("/{build_id}/deletion-request", response_model=DeletionRequestResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(rate_limit_writes)])
def request_build_deletion(
    build_id: int,
    req_in: DeletionRequestCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Registra una solicitud de borrado motivada en la tabla de auditoría."""
    client_ip = get_client_ip(request)
    req = create_deletion_request(db, build_id, req_in.reason, requester_ip=client_ip)
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró la build con ID {build_id} para solicitar su borrado."
        )
    return DeletionRequestResponse(
        id=req.id,
        build_id=req.build_id,
        reason=req.reason,
        status=req.status,
        created_at=req.created_at,
        message="Solicitud de borrado registrada con éxito para auditoría."
    )

@router.delete("/{build_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(rate_limit_writes)])
def remove_build(build_id: int, db: Session = Depends(get_db)):
    """Elimina directamente una build de la base de datos (para uso administrativo)."""
    success = delete_build(db, build_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró la build con ID {build_id} para eliminar."
        )
    return None

