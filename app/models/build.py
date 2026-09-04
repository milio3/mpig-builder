# -*- coding: utf-8 -*-
"""
app/models/build.py - Modelo ORM para Builds de Habilidades Guardadas
"""

from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Build(Base):
    __tablename__ = "builds"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    title = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    hero_level = Column(Integer, nullable=False, default=80)
    share_code = Column(String(64), unique=True, nullable=False, index=True)
    build_data = Column(Text, nullable=False)  # JSON con la distribucion de puntos
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
