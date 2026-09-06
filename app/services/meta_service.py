# -*- coding: utf-8 -*-
"""
app/services/meta_service.py - Servicio de Metadatos del Juego
Recupera de SQLite toda la información de héroes, habilidades y filas.
"""

import json
from sqlalchemy.orm import Session
from app.models.hero import Hero, Ability, RowConfig
from app.schemas.meta import GameMetaResponse, AbilityDTO, HeroDTO, HeroActiveDTO, RowConfigDTO

_CACHED_GAME_METADATA = None

def get_game_metadata(db: Session, force_reload: bool = False) -> GameMetaResponse:
    global _CACHED_GAME_METADATA
    if _CACHED_GAME_METADATA is not None and not force_reload:
        return _CACHED_GAME_METADATA

    # 1. Habilidades

    abilities_db = db.query(Ability).all()
    abilities_dict = {
        str(a.id): AbilityDTO.model_validate(a) for a in abilities_db
    }

    # 2. Héroes ordenados
    heroes_db = db.query(Hero).order_by(Hero.sort_order).all()
    heroes_dict = {}
    for h in heroes_db:
        # Activas
        actives_dto = [HeroActiveDTO.model_validate(act) for act in h.actives]
        # Pasivas ordenadas por slot
        passives_ids = [hp.ability_id for hp in sorted(h.passives, key=lambda x: x.slot_index)]

        hero_dto = HeroDTO(
            id=h.id,
            name=h.name,
            name_en=h.name_en,
            role=h.role,
            theme_color=h.theme_color,
            border_color=h.border_color,
            avatar=h.avatar,
            sort_order=h.sort_order,
            actives=actives_dto,
            passives=passives_ids
        )
        heroes_dict[h.id] = hero_dto

    # 3. Filas
    rows_db = db.query(RowConfig).order_by(RowConfig.row_index).all()
    rows_list = []
    row_unlock_levels = []
    active_group_by_row = []
    passive_ids_by_row = []

    for r in rows_db:
        slots = json.loads(r.passive_slots)
        row_dto = RowConfigDTO(
            row_index=r.row_index,
            unlock_level=r.unlock_level,
            active_group=r.active_group,
            passive_slots=slots
        )
        rows_list.append(row_dto)
        row_unlock_levels.append(r.unlock_level)
        active_group_by_row.append(r.active_group)
        passive_ids_by_row.append(slots)

    _CACHED_GAME_METADATA = GameMetaResponse(
        heroes=heroes_dict,
        abilities=abilities_dict,
        rows=rows_list,
        row_unlock_levels=row_unlock_levels,
        active_group_by_row=active_group_by_row,
        passive_ids_by_row=passive_ids_by_row
    )
    return _CACHED_GAME_METADATA

