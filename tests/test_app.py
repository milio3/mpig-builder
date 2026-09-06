import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_metadata():
    res = client.get('/api/v1/meta')
    assert res.status_code == 200
    data = res.json()
    assert 'KNIGHT' in data['heroes']

def test_build_workflow():
    payload = {
        'title': 'Test Advance Build',
        'author': 'Milio',
        'purpose': 'Avance',
        'hero_level': 55,
        'build_data': {
            'KNIGHT': {'actives': {'K_A1': 5}, 'passives': {'P1': 10}},
            'WARRIOR': {'actives': {}, 'passives': {}},
            'ASSASSIN': {'actives': {}, 'passives': {}},
            'ARCHER': {'actives': {}, 'passives': {}},
            'MAGE': {'actives': {}, 'passives': {}}
        }
    }
    res_create = client.post('/api/v1/builds', json=payload)
    assert res_create.status_code in (200, 201), res_create.text
    build_data = res_create.json()
    b_id = build_data['id']
    assert build_data['author'] == 'Milio'
    assert build_data['purpose'] == 'Avance'
    assert build_data['votes'] == 0

    # Votar
    res_vote = client.post(f'/api/v1/builds/{b_id}/vote')
    assert res_vote.status_code == 200
    assert res_vote.json()['votes'] == 1

    # Listar ordenado por votos
    res_list = client.get('/api/v1/builds?sort=votes&limit=5')
    assert res_list.status_code == 200
    items = res_list.json()
    assert len(items) <= 5
    assert any(b['id'] == b_id for b in items)

    # Solicitar borrado
    res_del = client.post(f'/api/v1/builds/{b_id}/deletion-request', json={'reason': 'Duplicado o prueba'})
    assert res_del.status_code in (200, 201)
    assert res_del.json()['status'].upper() == 'PENDING'

def test_index_page():
    res = client.get('/')
    assert res.status_code == 200
    html = res.text
    assert 'btn-control-library' in html
    assert 'modal_save_build' in html
    assert 'modal_deletion_request' in html
    assert 'community_sort_select' in html
