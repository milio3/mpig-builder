# -*- coding: utf-8 -*-
"""
app/schemas/meta.py - Esquemas Pydantic para Metadatos del Juego
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, ConfigDict

class AbilityDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    name_en: str
    icon: str
    step: float
    unit: str
    max_level: int
    description: str
    description_en: Optional[str] = None
    is_flat: bool

class HeroActiveDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    hero_id: str
    skill_group: int
    unlock_level: int
    max_level: int
    name: str
    name_en: str
    elem: str
    elem_name: str
    is_elemental: bool
    cooldown: float
    icon: str
    effect: str
    base_value: float
    step_value: float
    status_prob: Optional[int] = None
    description: str
    description_en: Optional[str] = None

class HeroDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    name_en: str
    role: str
    theme_color: str
    border_color: str
    avatar: str
    sort_order: int
    actives: List[HeroActiveDTO]
    passives: List[int]  # Array con los IDs de las 12 habilidades pasivas

class RowConfigDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    row_index: int
    unlock_level: int
    active_group: int
    passive_slots: List[int]

class GameMetaResponse(BaseModel):
    heroes: Dict[str, HeroDTO]
    abilities: Dict[str, AbilityDTO]
    rows: List[RowConfigDTO]
    row_unlock_levels: List[int]
    active_group_by_row: List[int]
    passive_ids_by_row: List[List[int]]
