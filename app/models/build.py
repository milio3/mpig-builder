# -*- coding: utf-8 -*-
"""
app/models/build.py - Modelo ORM para Builds de Habilidades Guardadas
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Build(Base):
    __tablename__ = "builds"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    title = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    author = Column(String(80), nullable=True, default="Anónimo")
    purpose = Column(String(30), nullable=False, default="Avance")  # 'Avance', 'Jefes', 'Farmeo'
    votes = Column(Integer, nullable=False, default=0)
    hero_level = Column(Integer, nullable=False, default=80)
    share_code = Column(String(64), unique=True, nullable=False, index=True)
    build_data = Column(Text, nullable=False)  # JSON con la distribucion de puntos
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    deletion_requests = relationship("BuildDeletionRequest", back_populates="build", cascade="all, delete-orphan")

class BuildDeletionRequest(Base):
    __tablename__ = "build_deletion_requests"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    build_id = Column(Integer, ForeignKey("builds.id", ondelete="CASCADE"), nullable=False, index=True)
    reason = Column(Text, nullable=False)
    requester_ip = Column(String(45), nullable=True)
    status = Column(String(20), nullable=False, default="PENDING")  # PENDING, APPROVED, REJECTED
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    build = relationship("Build", back_populates="deletion_requests")
