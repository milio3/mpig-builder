# -*- coding: utf-8 -*-
"""
tests/conftest.py - Fixtures globales para pruebas automatizadas
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient

# Asegurar que la raíz del proyecto esté en el sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.main import app

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client
