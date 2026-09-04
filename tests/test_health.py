# -*- coding: utf-8 -*-
"""
tests/test_health.py - Pruebas de Endpoints de Salud y Estado
"""

def test_health_check_retorna_200(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data

def test_ready_check_retorna_200_con_conexion_bd(client):
    response = client.get("/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["database"] == "connected"
