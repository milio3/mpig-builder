# -*- coding: utf-8 -*-
"""
api/index.py - Entrypoint Serverless para Vercel
Exporta la instancia ASGI de FastAPI para su ejecución en la infraestructura de Vercel.
"""

from app.main import app

# Vercel Serverless busca la variable 'app'
# En entornos serverless, las rutas estáticas y endpoints se canalizan a través de este entrypoint.
