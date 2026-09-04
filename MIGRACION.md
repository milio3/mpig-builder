# Bitácora de Migración: Extracción Standalone de MPIG Builder

Este documento detalla el proceso técnico de extracción y desacoplamiento de la pestaña **Árboles de Habilidades & Builds** de la suite de investigación original (`mpig/research/web`) hacia su propio proyecto autónomo e independiente: **MPIG Builder** (`mpig-builder`).

---

## 1. Motivación y Objetivos

1. **Aislamiento Funcional**: La pestaña de builds y habilidades creció sustancialmente en complejidad (lógica de 4 activas equipadas por personaje, cálculo dinámico de topes de pasivas por nivel, árbol visual de 5 columnas, botón `MAX` interactivo y modales de advertencia). Extraerla permite iterar rápidamente en ella sin arrastrar el peso ni las dependencias del resto de calculadoras de DPS, EHP y fórmulas de combate.
2. **Liberación de Datos en Archivos `.js`**: En el proyecto original, toda la matriz de habilidades y héroes residía embebida en un archivo estático masivo de JavaScript (`skills_data.js`). Se ha migrado y normalizado toda esta información a una base de datos relacional **SQLite** (`data/mpig.db`), sirviendo los metadatos de forma estructurada a través de una API REST.
3. **Persistencia Real de Builds**: Se incorpora una tabla relacional `builds` en SQLite que permite a los usuarios guardar sus configuraciones con nombre, notas y nivel de grupo, listarlas, cargarlas en cualquier momento y compartirlas mediante códigos compactos únicos.
4. **Adopción de Estándares [`GEMINI.md`](file:///C:/Users/milio3/OneDrive/Dev/GEMINI.md)**: Estructuración canónica Nivel 2 Modular con FastAPI, Pydantic Settings, SQLite en modo WAL, tests automatizados con Pytest, Dockerfile endurecido con usuario no-root y adaptadores para despliegue en Vercel.

---

## 2. Inventario de Componentes Extraídos y Migrados

### 2.1 Assets Gráficos
Se migraron las imágenes necesarias desde `mpig/research/extracted_assets/` hacia `app/web/static/assets/`:
- **80 avatares e ilustraciones de héroes**: `assets/herostanding/` (ej. `swordman1.png`, etc.).
- **53 iconos de habilidades y efectos**: `assets/skillicon/` (ej. `skill_heal.png`, `skill_passive_1.png`, etc.).
- Total: 133 archivos gráficos ligeros (~390 KB en total).

### 2.2 Migración de Datos a SQLite (`scripts/seed_database.py`)
Se estructuraron 6 tablas relacionales en `data/mpig.db`:
- `heroes`: 5 héroes jugables con roles, colores temáticos y avatares.
- `abilities`: Catálogo de 24 habilidades pasivas con ratios de escalado (`step`), unidades (`%`, `% /s`), límites finales y descripciones.
- `hero_passives`: Mapeo relacional de las 12 ranuras de pasivas de cada héroe.
- `hero_actives`: 30 habilidades activas (6 por héroe) con tipos de daño (`PHYSICAL`, `FIRE`, `COLD`, `LIGHTNING`, `CHAOS`), tiempos de reutilización, fórmulas y descripciones.
- `row_configs`: Definición de las 9 filas de progresión, niveles de desbloqueo (1, 10, 20, 30, 40, 50, 60, 70, 80) y ranuras asociadas.
- `builds`: Tabla de almacenamiento de configuraciones de usuario (ID, título, descripción, nivel, código compartible, JSON de habilidades y fechas de creación/actualización).

---

## 3. Arquitectura del Nuevo Proyecto

```text
mpig-builder/
├── app/
│   ├── main.py                   # Entrypoint FastAPI, middlewares, ciclo de vida
│   ├── core/
│   │   ├── config.py             # Configuración centralizada tipada (Pydantic Settings)
│   │   └── database.py           # Conexión SQLAlchemy con SQLite en modo WAL y timeout 15s
│   ├── api/
│   │   ├── health.py             # Endpoints /health (liveness) y /ready (readiness)
│   │   └── v1/
│   │       ├── meta.py           # GET /api/v1/meta (entrega metadatos del juego)
│   │       └── builds.py         # CRUD de builds (/api/v1/builds)
│   ├── models/                   # Modelos ORM (Hero, Ability, Active, Passive, Build)
│   ├── schemas/                  # DTOs Pydantic para validación y serialización
│   ├── services/                 # Lógica de negocio (meta_service, build_service)
│   └── web/                      # Frontend desacoplado
│       ├── static/
│       │   ├── css/app.css       # Tarjetas de 68px, botones Tailwind, tooltips 580px
│       │   ├── js/               # api_client.js, skills_state.js, build_manager.js, ui.js
│       │   └── assets/           # Imágenes y avatares migrados
│       └── templates/            # Plantillas Jinja2 y componentes modulares
├── data/                         # Base de datos SQLite (mpig.db)
├── scripts/                      # Scripts de seed y utilidades
├── tests/                        # Suite de pruebas automatizadas Pytest
├── api/index.py                  # Entrypoint serverless para Vercel
├── compose.yml                   # Orquestación Docker Compose local/producción
├── Dockerfile                    # Contenedor hardened sin privilegios root
├── requirements.txt              # Dependencias de producción estrictamente fijadas
├── vercel.json                   # Configuración de despliegue en Vercel
├── MIGRACION.md                  # Este documento
└── README.md                     # Manual operativo y de despliegue
```

---

## 4. Reglas de Juego Preservadas e Implementadas

1. **Límite Estricto de 4 Habilidades Activas por Héroe**:
   - En asignación automática (`⚡ Max Todo` y `Max Puntos`): solo se invierten puntos en un máximo de 4 activas (priorizando las ya iniciadas), dejando las otras 2 en nivel 0 y volcando los puntos restantes a pasivas.
   - En asignación manual o botón `MAX`: si un personaje ya tiene 4 activas con nivel > 0, el sistema bloquea subir una 5ª activa y lanza un aviso visual.
2. **Identificación Visual de Tipos de Daño**:
   - Cada activa muestra a la izquierda de su icono su tipo elemental con SVG y resplandor: Físico (acero), Fuego (naranja), Frío (cian), Rayo (ámbar) y Caos (púrpura).
   - Las pasivas conservan el mismo espaciador de 20px para una alineación vertical perfecta.
3. **Píldora Interactiva `MAX`**:
   - Asigna todos los puntos disponibles a una habilidad concreta con un solo click (o mediante `Shift + Click`).
4. **Persistencia Dual (Base de Datos + Códigos Portables)**:
   - Las builds se pueden guardar con nombre directamente en SQLite o exportar como JSON / código alfanumérico para compartir con otros jugadores.

---

## 5. Verificación y Resultados

- **Pruebas Automatizadas**: 6 tests unitarios y de integración ejecutados con `pytest`:
  - `tests/test_health.py`: Liveness y Readiness OK.
  - `tests/test_meta_api.py`: 5 héroes, habilidades y tipos elementales OK.
  - `tests/test_builds_api.py`: Creación, consulta, código compartible, listado y borrado en SQLite OK.
- **Frontend**: Renderizado y respuesta HTTP 200 verificado en `/`.
- **Base de Datos**: 100% de datos maestros sembrados y verificados.
