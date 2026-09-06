# -*- coding: utf-8 -*-
"""
app/schemas/build.py - Esquemas Pydantic para Guardado y Consulta de Builds
"""

from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class BuildCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=120, description="Título descriptivo de la build")
    description: Optional[str] = Field(None, max_length=500, description="Notas o descripción adicional")
    author: Optional[str] = Field("Anónimo", max_length=80, description="Autor o creador de la build")
    purpose: Optional[str] = Field("Avance", max_length=30, description="Cometido de la build: Avance, Jefes, Farmeo")
    hero_level: int = Field(80, ge=1, le=100, description="Nivel común del grupo (1..100)")
    build_data: Dict[str, Any] = Field(..., description="Distribución de activas y pasivas para los 5 héroes")
    share_code: Optional[str] = Field(None, max_length=64, description="Código compartible opcional")

class BuildListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    author: Optional[str] = "Anónimo"
    purpose: Optional[str] = "Avance"
    votes: int = 0
    hero_level: int
    share_code: str
    created_at: datetime
    updated_at: datetime

class BuildResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    author: Optional[str] = "Anónimo"
    purpose: Optional[str] = "Avance"
    votes: int = 0
    hero_level: int
    share_code: str
    build_data: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

class BuildVoteResponse(BaseModel):
    id: int
    votes: int
    message: str = "Voto registrado con éxito"

class DeletionRequestCreate(BaseModel):
    reason: str = Field(..., min_length=3, max_length=500, description="Motivo o justificación de la solicitud de borrado")

class DeletionRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    build_id: int
    reason: str
    status: str
    created_at: datetime
    message: str = "Solicitud de borrado registrada para auditoría"

