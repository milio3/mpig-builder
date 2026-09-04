# -*- coding: utf-8 -*-
"""
tests/test_meta_api.py - Pruebas de Metadatos de Héroes y Habilidades
"""

def test_meta_endpoint_retorna_5_heroes_y_habilidades(client):
    response = client.get("/api/v1/meta")
    assert response.status_code == 200
    data = response.json()

    assert "heroes" in data
    assert "abilities" in data
    assert "rows" in data
    assert "row_unlock_levels" in data

    # 5 héroes exactos
    heroes = data["heroes"]
    assert len(heroes) == 5
    for expected_id in ["KNIGHT", "WARRIOR", "ASSASSIN", "ARCHER", "MAGE"]:
        assert expected_id in heroes
        hero = heroes[expected_id]
        # Cada héroe debe tener 6 habilidades activas y 12 pasivas
        assert len(hero["actives"]) == 6
        assert len(hero["passives"]) == 12

def test_meta_endpoint_habilidades_activas_tienen_elementos(client):
    response = client.get("/api/v1/meta")
    assert response.status_code == 200
    data = response.json()

    knight = data["heroes"]["KNIGHT"]
    active_elems = {a["id"]: a["elem"] for a in knight["actives"]}
    # K4 es fuego, K5 es frío, K1 es físico
    assert active_elems["K1"] == "PHYSICAL"
    assert active_elems["K4"] == "FIRE"
    assert active_elems["K5"] == "COLD"
