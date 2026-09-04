# -*- coding: utf-8 -*-
"""
app/core/database.py - Conexión y Gestión de Base de Datos SQLite
Configura SQLAlchemy con modo WAL (Write-Ahead Logging) y timeout según GEMINI.md.
"""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

# Engine para SQLite con timeout y sin bloqueo de hilos
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False, "timeout": 15}
)

# Configurar PRAGMAs obligatorios según GEMINI.md (Modo WAL y synchronous NORMAL)
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute("PRAGMA synchronous=NORMAL;")
    cursor.execute("PRAGMA foreign_keys=ON;")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Generador de sesiones de base de datos para inyección de dependencias en FastAPI."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
