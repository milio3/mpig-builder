# MPIG Builder 🛡️⚡

Aplicación web modular y de alto rendimiento para la planificación, personalización y guardado de **Árboles de Habilidades y Builds** de los 5 personajes de MPIG (Caballero, Guerrero, Asesina, Arquera y Maga).

Construida siguiendo las especificaciones canónicas de arquitectura de [`GEMINI.md`](../GEMINI.md) (Nivel 2 Modular con FastAPI, persistencia SQLite en modo WAL y frontend desacoplado).

---

## 🚀 Características Principales

- **Visualización Completa de 5 Columnas**: Interfaz panorámica optimizada para ver simultáneamente a los 5 héroes con sus 9 filas de habilidades (activas y pasivas) sin barras de desplazamiento lateral ni vertical en resoluciones estándar (1080p).
- **Regla MPIG de 4 Habilidades Activas**: Restricción estricta de hasta 4 habilidades activas equipadas por personaje (tanto en subida manual como en los botones de maximización automática).
- **Indicador Elemental Izquierdo**: Cada habilidad activa muestra a la izquierda de su marco un icono vectorial SVG representativo del tipo de daño con su resplandor característico:
  - ⚔️ **Físico (`PHYSICAL`)**: Espadas de acero plateadas (`#cbd5e1`).
  - 🔥 **Fuego (`FIRE`)**: Llama viva ardiente (`#f97316`).
  - ❄️ **Frío (`COLD`)**: Cristal de hielo / copo glacial (`#38bdf8`).
  - ⚡ **Rayo (`LIGHTNING`)**: Relámpago en amarillo eléctrico (`#facc15`).
  - 🌀 **Caos (`CHAOS`)**: Vórtice / sello arcano púrpura (`#c084fc`).
  - *Las pasivas conservan un hueco reservado de 20px para una alineación vertical perfecta.*
- **Píldora Interactiva `MAX`**: Asigna todos los puntos posibles de un solo toque a una habilidad concreta (o con el atajo `Shift + Click`).
- **Persistencia en Base de Datos SQLite**: Las builds pueden guardarse con nombre y notas tácticas en la base de datos local y listarse en un modal interactivo para cargarlas de inmediato.
- **Exportador/Importador Universal**: Soporta compartir builds mediante códigos compactos alfanuméricos (`MPIG-B80-...`) o bloques JSON estructurados.
- **Tooltip Flotante de 580px**: Previsualización nítida con escalado por nivel, elemento, tiempo de recarga y contador de activas equipadas (`X/4`).

---

## 🛠️ Pila Tecnológica y Arquitectura

- **Backend**: Python 3.12+ / FastAPI (arquitectura asíncrona modular).
- **Base de Datos**: SQLite con motor SQLAlchemy, modo **WAL** (*Write-Ahead Logging*), `PRAGMA synchronous=NORMAL` y claves foráneas activadas.
- **Frontend**: Servido con Jinja2 (SSR) + CSS desacoplado + Vanilla JavaScript modular (sin frameworks pesados).
- **Despliegue Serverless**: Compatible con **Vercel** (`vercel.json` y entrypoint ASGI en `api/index.py`).
- **Contenedores**: `Dockerfile` endurecido con usuario no-root (`appuser`) y `compose.yml` con límites de recursos.

---

## ⚙️ Configuración y Variables de Entorno

Copia el archivo de plantilla `.env.example` a `.env`:

```bash
cp .env.example .env
```

| Variable | Descripción | Valor por Defecto |
| :--- | :--- | :--- |
| `PROJECT_NAME` | Nombre visible del proyecto | `MPIG Builder` |
| `VERSION` | Versión semántica | `1.0.0` |
| `DEBUG` | Activa recarga automática y docs Swagger (`/docs`) | `false` |
| `DATABASE_URL` | URI de conexión SQLAlchemy a SQLite | `sqlite:///./data/mpig.db` |
| `HTTP_TIMEOUT_SECONDS` | Timeout para llamadas salientes | `10.0` |

---

## 💻 Instalación y Ejecución Local

### 1. Requisitos Previos
- Python 3.12 o superior instalado.

### 2. Instalar Dependencias
```bash
pip install -r requirements.txt
```

### 3. Sembrar la Base de Datos Inicial (si es necesario)
```bash
python scripts/seed_database.py
```

### 4. Iniciar el Servidor de Desarrollo
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Abre tu navegador en [http://localhost:8000](http://localhost:8000).

---

## 🧪 Pruebas Automatizadas (Pytest)

Ejecuta la suite de pruebas unitarias y de integración:

```bash
python -m pytest -v
```

Tests incluidos:
- `tests/test_health.py`: Endpoints normativos `/health` y `/ready`.
- `tests/test_meta_api.py`: Integridad de héroes, habilidades y elementos.
- `tests/test_builds_api.py`: Ciclo de vida CRUD completo de builds en SQLite.

---

## 🐳 Despliegue con Docker Compose

```bash
# Construir y levantar el contenedor en segundo plano
docker compose up -d --build

# Verificar el estado y healthcheck
docker compose ps

# Ver logs en tiempo real
docker compose logs -f
```

El servicio responderá en [http://localhost:8000](http://localhost:8000).

---

## ☁️ Despliegue en Vercel

El proyecto incluye la configuración para Vercel en `vercel.json` y `api/index.py`:

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Desplegar
vercel
```

---

## 💾 Procedimiento de Backup Seguro para SQLite (Modo WAL)

> [!WARNING]
> En modo WAL, **nunca** copies directamente el archivo `.db` en caliente con `cp` o el explorador de archivos mientras la aplicación esté en uso. Utiliza siempre la herramienta de respaldo online de SQLite:

```bash
# Comando canónico de respaldo en caliente:
sqlite3 data/mpig.db ".backup 'data/backup_$(date +%Y%m%d_%H%M%S).db'"
```

---

## 🔄 Procedimiento de Rollback Rápido

En caso de incidencia tras actualizar una versión en producción:

```bash
# 1. Volver al tag de la versión estable anterior
git checkout v1.0.0

# 2. Reconstruir el contenedor
docker compose up -d --build

# 3. Comprobar disponibilidad inmediata
curl -f http://localhost:8000/health
```

---

## 📄 Licencia y Créditos
Desarrollado como módulo independiente para la comunidad de MPIG.
