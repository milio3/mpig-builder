# -*- coding: utf-8 -*-
"""
tests/test_builds_api.py - Pruebas de Persistencia CRUD de Builds
"""

def test_crear_build_y_recuperar_por_id_y_codigo(client):
    payload = {
        "title": "Build Test Pytest",
        "description": "Prueba unitaria automatizada",
        "hero_level": 80,
        "build_data": {
            "KNIGHT": {"actives": {"K1": 3, "K4": 5}, "passives": {"P1": 13}}
        }
    }

    # 1. Crear
    res_post = client.post("/api/v1/builds", json=payload)
    assert res_post.status_code == 201
    created = res_post.json()
    assert created["title"] == "Build Test Pytest"
    assert "share_code" in created
    assert created["hero_level"] == 80
    build_id = created["id"]
    share_code = created["share_code"]

    # 2. Recuperar por ID
    res_get_id = client.get(f"/api/v1/builds/{build_id}")
    assert res_get_id.status_code == 200
    assert res_get_id.json()["id"] == build_id

    # 3. Recuperar por share_code
    res_get_code = client.get(f"/api/v1/builds/{share_code}")
    assert res_get_code.status_code == 200
    assert res_get_code.json()["share_code"] == share_code

    # 4. Eliminar
    res_del = client.delete(f"/api/v1/builds/{build_id}")
    assert res_del.status_code == 204

    # 5. Confirmar eliminación
    res_after = client.get(f"/api/v1/builds/{build_id}")
    assert res_after.status_code == 404

def test_listar_builds(client):
    response = client.get("/api/v1/builds")
    assert response.status_code == 200
    builds_list = response.json()
    assert isinstance(builds_list, list)
