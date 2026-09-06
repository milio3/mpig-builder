/**
 * api_client.js - Cliente HTTP para comunicarse con la API FastAPI de MPIG Builder
 */

const ApiClient = {
  baseUrl: '/api/v1',

  /**
   * Obtiene los metadatos completos del juego desde SQLite
   */
  async getMetadata() {
    const res = await fetch(`${this.baseUrl}/meta`);
    if (!res.ok) {
      throw new Error(`Error al obtener metadatos: ${res.statusText}`);
    }
    return await res.json();
  },

  /**
   * Lista las builds guardadas en la base de datos (con ordenación 'votes' o 'recent' y límite)
   */
  async listBuilds(options = {}) {
    const sort = options.sort || 'votes';
    const limit = options.limit || 50;
    const res = await fetch(`${this.baseUrl}/builds?sort=${encodeURIComponent(sort)}&limit=${encodeURIComponent(limit)}`);
    if (!res.ok) {
      throw new Error(`Error al listar builds: ${res.statusText}`);
    }
    return await res.json();
  },

  /**
   * Guarda una nueva build en la base de datos
   */
  async saveBuild(payload) {
    const res = await fetch(`${this.baseUrl}/builds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Error al guardar la build.');
    }
    return await res.json();
  },

  /**
   * Registra un voto a favor de una build
   */
  async voteBuild(buildId) {
    const res = await fetch(`${this.baseUrl}/builds/${buildId}/vote`, {
      method: 'POST'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Error al registrar el voto.');
    }
    return await res.json();
  },

  /**
   * Registra una solicitud de borrado motivada en la tabla de auditoría
   */
  async requestDeletion(buildId, reason) {
    const res = await fetch(`${this.baseUrl}/builds/${buildId}/deletion-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Error al enviar la solicitud de borrado.');
    }
    return await res.json();
  },

  /**
   * Obtiene una build por su ID o código compartible
   */
  async getBuild(identifier) {
    const res = await fetch(`${this.baseUrl}/builds/${encodeURIComponent(identifier)}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Build no encontrada.');
    }
    return await res.json();
  },

  /**
   * Elimina una build de la base de datos
   */
  async deleteBuild(buildId) {
    const res = await fetch(`${this.baseUrl}/builds/${buildId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      throw new Error(`Error al eliminar la build: ${res.statusText}`);
    }
    return true;
  }
};

