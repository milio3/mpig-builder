# -*- coding: utf-8 -*-
"""
app/main.py - Punto de Entrada Principal de MPIG Builder
Configura FastAPI, middlewares, gestión de ciclo de vida (lifespan),
rutas de API y montaje de frontend estático y modular con Jinja2.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.health import router as health_router
from app.api.v1.meta import router as meta_router
from app.api.v1.builds import router as builds_router

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "web", "static")
TEMPLATES_DIR = os.path.join(BASE_DIR, "web", "templates")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Asegurar que las tablas de la base de datos existan
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# CORS explícito según GEMINI.md
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Montaje de archivos estáticos (CSS, JS, Assets)
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Motor de plantillas Jinja2
templates = Jinja2Templates(directory=TEMPLATES_DIR)

# Registro de routers
app.include_router(health_router)
app.include_router(meta_router, prefix="/api/v1")
app.include_router(builds_router, prefix="/api/v1")

@app.get("/", tags=["Frontend"])
async def render_home(request: Request):
    """Renderiza la vista principal standalone del Planificador de Habilidades y Builds."""
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "project_name": settings.PROJECT_NAME,
            "version": settings.VERSION
        }
    )
