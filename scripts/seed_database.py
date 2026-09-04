# -*- coding: utf-8 -*-
"""
scripts/seed_database.py - Inicializador y Poblador de la Base de Datos SQLite
Extrae los datos de skills_data.js y genera la base de datos relacional data/mpig.db
"""

import os
import json
import sqlite3

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
DB_PATH = os.path.join(DATA_DIR, 'mpig.db')
SOURCE_JS_PATH = r"c:\Users\milio3\OneDrive\Dev\mpig\research\web\data\skills_data.js"

def init_db():
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Habilitar WAL y claves foráneas
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute("PRAGMA synchronous=NORMAL;")
    cursor.execute("PRAGMA foreign_keys=ON;")

    # 1. Tabla de Héroes
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS heroes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_en TEXT NOT NULL,
        role TEXT NOT NULL,
        theme_color TEXT NOT NULL,
        border_color TEXT NOT NULL,
        avatar TEXT NOT NULL,
        sort_order INTEGER NOT NULL
    );
    """)

    # 2. Tabla de Habilidades Pasivas (Catálogo de habilidades)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS abilities (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        name_en TEXT NOT NULL,
        icon TEXT NOT NULL,
        step REAL NOT NULL,
        unit TEXT NOT NULL,
        max_level INTEGER NOT NULL,
        description TEXT NOT NULL,
        is_flat BOOLEAN NOT NULL DEFAULT 0
    );
    """)

    # 3. Asociación de Pasivas por Héroe (12 slots)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hero_passives (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hero_id TEXT NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
        slot_index INTEGER NOT NULL,
        ability_id INTEGER NOT NULL REFERENCES abilities(id) ON DELETE CASCADE,
        UNIQUE(hero_id, slot_index)
    );
    """)

    # 4. Tabla de Habilidades Activas por Héroe (6 activas)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hero_actives (
        id TEXT PRIMARY KEY,
        hero_id TEXT NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
        skill_group INTEGER NOT NULL,
        unlock_level INTEGER NOT NULL,
        max_level INTEGER NOT NULL,
        name TEXT NOT NULL,
        name_en TEXT NOT NULL,
        elem TEXT NOT NULL,
        elem_name TEXT NOT NULL,
        is_elemental BOOLEAN NOT NULL,
        cooldown REAL NOT NULL,
        icon TEXT NOT NULL,
        effect TEXT NOT NULL,
        base_value REAL NOT NULL,
        step_value REAL NOT NULL,
        status_prob INTEGER,
        description TEXT NOT NULL
    );
    """)

    # 5. Configuración de Filas y Tiers
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS row_configs (
        row_index INTEGER PRIMARY KEY,
        unlock_level INTEGER NOT NULL,
        active_group INTEGER NOT NULL,
        passive_slots TEXT NOT NULL
    );
    """)

    # 6. Tabla de Builds Guardadas
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS builds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        hero_level INTEGER NOT NULL DEFAULT 80,
        share_code TEXT UNIQUE NOT NULL,
        build_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()
    print(f"[OK] Tablas creadas correctamente en {DB_PATH}")

def seed_data():
    if not os.path.exists(SOURCE_JS_PATH):
        print(f"[ERROR] No se encuentra el archivo fuente {SOURCE_JS_PATH}")
        return

    with open(SOURCE_JS_PATH, 'r', encoding='utf-8') as f:
        text = f.read()

    start = text.find('{')
    end = text.find('};\n') + 1
    if end <= 1:
        end = text.find('};') + 1
    raw = json.loads(text[start:end])

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Limpiar tablas maestras antes de sembrar
    cursor.execute("DELETE FROM hero_passives;")
    cursor.execute("DELETE FROM hero_actives;")
    cursor.execute("DELETE FROM abilities;")
    cursor.execute("DELETE FROM heroes;")
    cursor.execute("DELETE FROM row_configs;")

    # 1. Sembrar Catálogo de Habilidades Pasivas
    for ab_id_str, ab in raw['ABILITY_INFO'].items():
        cursor.execute("""
        INSERT INTO abilities (id, name, name_en, icon, step, unit, max_level, description, is_flat)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            int(ab_id_str),
            ab['name'],
            ab['name_en'],
            f"assets/skillicon/{ab['icon']}",
            float(ab['step']),
            ab['unit'],
            int(ab['max_level']),
            ab['desc'],
            1 if ab.get('is_flat') else 0
        ))

    # 2. Sembrar Héroes y sus Habilidades
    heroes_order = ['KNIGHT', 'WARRIOR', 'ASSASSIN', 'ARCHER', 'MAGE']
    for idx, h_id in enumerate(heroes_order):
        h = raw['HEROES'][h_id]
        avatar_rel = h['avatar'].replace('extracted_assets/', 'assets/')
        cursor.execute("""
        INSERT INTO heroes (id, name, name_en, role, theme_color, border_color, avatar, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            h['id'],
            h['name'],
            h.get('name_en', h['name']),
            h['role'],
            h['theme_color'],
            h['border_color'],
            avatar_rel,
            idx
        ))

        # Pasivas asignadas al héroe (12 ranuras)
        for slot_idx, ab_id in enumerate(h['passives'], start=1):
            cursor.execute("""
            INSERT INTO hero_passives (hero_id, slot_index, ability_id)
            VALUES (?, ?, ?);
            """, (h['id'], slot_idx, int(ab_id)))

        # Activas del héroe (6 activas)
        for act in h['actives']:
            icon_rel = act['icon'].replace('extracted_assets/', 'assets/')
            cursor.execute("""
            INSERT INTO hero_actives (
                id, hero_id, skill_group, unlock_level, max_level, name, name_en,
                elem, elem_name, is_elemental, cooldown, icon, effect, base_value,
                step_value, status_prob, description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                act['id'],
                h['id'],
                int(act['group']),
                int(act['unlock_level']),
                int(act['max_level']),
                act['name'],
                act.get('name_en', act['name']),
                act.get('elem', 'PHYSICAL'),
                act.get('elem_name', 'Físico'),
                1 if act.get('is_elemental') else 0,
                float(act.get('cd', 0.0)),
                icon_rel,
                act.get('effect', 'DAMAGE'),
                float(act.get('base', 0.0)),
                float(act.get('step', 0.0)),
                act.get('status_prob'),
                act.get('desc', '')
            ))

    # 3. Sembrar Configuración de Filas
    for r_idx in range(9):
        unlock_lvl = raw['ROW_UNLOCK_LEVELS'][r_idx]
        act_grp = raw['ACTIVE_GROUP_BY_ROW'][r_idx]
        pass_slots = json.dumps(raw['PASSIVE_IDS_BY_ROW'][r_idx])
        cursor.execute("""
        INSERT INTO row_configs (row_index, unlock_level, active_group, passive_slots)
        VALUES (?, ?, ?, ?);
        """, (r_idx, unlock_lvl, act_grp, pass_slots))

    # 4. Insertar una build inicial de ejemplo en la tabla `builds`
    sample_build = {
        'KNIGHT': {'actives': {'K1': 3, 'K3': 3, 'K4': 5, 'K5': 5}, 'passives': {'P1': 13, 'P2': 10, 'P3': 4, 'P4': 13}},
        'WARRIOR': {'actives': {'W1': 5, 'W2': 5, 'W3': 5, 'W4': 5}, 'passives': {'P1': 13, 'P2': 10, 'P3': 13}},
        'ASSASSIN': {'actives': {'A1': 5, 'A2': 5, 'A3': 5, 'A4': 5}, 'passives': {'P1': 13, 'P2': 10}},
        'ARCHER': {'actives': {'R1': 5, 'R2': 5, 'R3': 5, 'R4': 5}, 'passives': {'P1': 13, 'P2': 10}},
        'MAGE': {'actives': {'M1': 5, 'M2': 5, 'M3': 5, 'M4': 5}, 'passives': {'P1': 13, 'P2': 10}}
    }
    cursor.execute("""
    INSERT OR IGNORE INTO builds (title, description, hero_level, share_code, build_data)
    VALUES (?, ?, ?, ?, ?);
    """, (
        "Build Inicial Balanceada (Nv.80)",
        "Configuración estándar balanceada con 4 activas maximizadas por personaje y distribución de pasivas esenciales.",
        80,
        "MPIG-PRESET-BALANCED-V1",
        json.dumps(sample_build)
    ))

    conn.commit()
    conn.close()
    print("[OK] Datos sembrados con éxito en la base de datos SQLite.")

if __name__ == "__main__":
    init_db()
    seed_data()
