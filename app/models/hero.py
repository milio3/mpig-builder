# -*- coding: utf-8 -*-
"""
app/models/hero.py - Modelos ORM para Héroes y Habilidades
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Hero(Base):
    __tablename__ = "heroes"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    name_en = Column(String, nullable=False)
    role = Column(String, nullable=False)
    theme_color = Column(String, nullable=False)
    border_color = Column(String, nullable=False)
    avatar = Column(String, nullable=False)
    sort_order = Column(Integer, nullable=False, default=0)

    actives = relationship("HeroActive", back_populates="hero", cascade="all, delete-orphan", order_by="HeroActive.unlock_level")
    passives = relationship("HeroPassive", back_populates="hero", cascade="all, delete-orphan", order_by="HeroPassive.slot_index")

class Ability(Base):
    __tablename__ = "abilities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    name_en = Column(String, nullable=False)
    icon = Column(String, nullable=False)
    step = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    max_level = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    is_flat = Column(Boolean, nullable=False, default=False)

    hero_associations = relationship("HeroPassive", back_populates="ability")

class HeroPassive(Base):
    __tablename__ = "hero_passives"

    id = Column(Integer, primary_key=True, autoincrement=True)
    hero_id = Column(String, ForeignKey("heroes.id", ondelete="CASCADE"), nullable=False)
    slot_index = Column(Integer, nullable=False)  # 1..12
    ability_id = Column(Integer, ForeignKey("abilities.id", ondelete="CASCADE"), nullable=False)

    hero = relationship("Hero", back_populates="passives")
    ability = relationship("Ability", back_populates="hero_associations")

class HeroActive(Base):
    __tablename__ = "hero_actives"

    id = Column(String, primary_key=True, index=True)
    hero_id = Column(String, ForeignKey("heroes.id", ondelete="CASCADE"), nullable=False)
    skill_group = Column(Integer, nullable=False)
    unlock_level = Column(Integer, nullable=False)
    max_level = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    name_en = Column(String, nullable=False)
    elem = Column(String, nullable=False)
    elem_name = Column(String, nullable=False)
    is_elemental = Column(Boolean, nullable=False, default=False)
    cooldown = Column(Float, nullable=False, default=0.0)
    icon = Column(String, nullable=False)
    effect = Column(String, nullable=False)
    base_value = Column(Float, nullable=False, default=0.0)
    step_value = Column(Float, nullable=False, default=0.0)
    status_prob = Column(Integer, nullable=True)
    description = Column(Text, nullable=False)

    hero = relationship("Hero", back_populates="actives")

class RowConfig(Base):
    __tablename__ = "row_configs"

    row_index = Column(Integer, primary_key=True)  # 0..8
    unlock_level = Column(Integer, nullable=False)
    active_group = Column(Integer, nullable=False)
    passive_slots = Column(Text, nullable=False)  # JSON string
