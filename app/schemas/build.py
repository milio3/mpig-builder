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
    hero_level: int = Field(80, ge=1, le=100, description="Nivel común del grupo (1..100)")
    build_data: Dict[str, Any] = Field(..., description="Distribución de activas y pasivas para los 5 héroes")
    share_code: Optional[str] = Field(None, max_length=64, description="Código compartible opcional")

class BuildListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    hero_level: int
    share_code: str
    created_at: datetime
    updated_at: datetime

class BuildResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    hero_level: int
    share_code: str
    build_data: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
