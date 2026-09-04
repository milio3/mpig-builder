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
   * Lista las builds guardadas en la base de datos
   */
  async listBuilds() {
    const res = await fetch(`${this.baseUrl}/builds`);
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
