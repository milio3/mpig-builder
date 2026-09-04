# -*- coding: utf-8 -*-
"""
app/services/build_service.py - Servicio de Gestión de Builds
Maneja la persistencia, validación, búsqueda y borrado de builds en SQLite.
"""

import json
import secrets
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.build import Build
from app.schemas.build import BuildCreate, BuildResponse, BuildListItem

def generate_unique_share_code(db: Session, hero_level: int) -> str:
    while True:
        token = secrets.token_hex(4).upper()
        code = f"MPIG-B{hero_level}-{token}"
        exists = db.query(Build).filter(Build.share_code == code).first()
        if not exists:
            return code

def create_build(db: Session, build_in: BuildCreate) -> BuildResponse:
    share_code = build_in.share_code
    if not share_code or not share_code.strip():
        share_code = generate_unique_share_code(db, build_in.hero_level)
    else:
        share_code = share_code.strip().upper()
        # Si ya existe con ese código, actualizar o crear uno derivado
        existing = db.query(Build).filter(Build.share_code == share_code).first()
        if existing:
            share_code = generate_unique_share_code(db, build_in.hero_level)

    build_data_str = json.dumps(build_in.build_data)

    db_build = Build(
        title=build_in.title.strip(),
        description=build_in.description.strip() if build_in.description else None,
        hero_level=build_in.hero_level,
        share_code=share_code,
        build_data=build_data_str
    )
    db.add(db_build)
    db.commit()
    db.refresh(db_build)

    return BuildResponse(
        id=db_build.id,
        title=db_build.title,
        description=db_build.description,
        hero_level=db_build.hero_level,
        share_code=db_build.share_code,
        build_data=json.loads(db_build.build_data),
        created_at=db_build.created_at,
        updated_at=db_build.updated_at
    )

def list_builds(db: Session, limit: int = 50) -> List[BuildListItem]:
    builds_db = db.query(Build).order_by(Build.updated_at.desc()).limit(limit).all()
    return [
        BuildListItem(
            id=b.id,
            title=b.title,
            description=b.description,
            hero_level=b.hero_level,
            share_code=b.share_code,
            created_at=b.created_at,
            updated_at=b.updated_at
        ) for b in builds_db
    ]

def get_build_by_id_or_code(db: Session, identifier: str) -> Optional[BuildResponse]:
    if identifier.isdigit():
        db_build = db.query(Build).filter(Build.id == int(identifier)).first()
    else:
        db_build = db.query(Build).filter(Build.share_code == identifier.strip().upper()).first()

    if not db_build:
        return None

    return BuildResponse(
        id=db_build.id,
        title=db_build.title,
        description=db_build.description,
        hero_level=db_build.hero_level,
        share_code=db_build.share_code,
        build_data=json.loads(db_build.build_data),
        created_at=db_build.created_at,
        updated_at=db_build.updated_at
    )

def delete_build(db: Session, build_id: int) -> bool:
    db_build = db.query(Build).filter(Build.id == build_id).first()
    if not db_build:
        return False
    db.delete(db_build)
    db.commit()
    return True
