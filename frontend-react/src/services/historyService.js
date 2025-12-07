import { apiUrl, getHeaders } from '../utils/api';

/**
 * Servicio de historia clínica
 * Maneja todas las operaciones CRUD de registros médicos
 */
class HistoryService {
  /**
   * Obtener registros de historia clínica
   * @param {Object} params - Parámetros de búsqueda y paginación
   * @returns {Promise<Object>} Lista de registros y metadatos
   */
  static async getRecords(params = {}) {
    try {
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      const url = queryString ? apiUrl(`historia?${queryString}`) : apiUrl('historia');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`,
          records: [],
          pagination: null
        };
      }

      return {
        success: true,
        data,
        records: data.records || data,
        pagination: data.pagination,
        total: data.total || (Array.isArray(data) ? data.length : 0)
      };
    } catch (error) {
      console.error('Error obteniendo registros:', error);
      return {
        success: false,
        error: error.message || 'Error obteniendo registros',
        records: [],
        pagination: null
      };
    }
  }

  /**
   * Obtener registro por ID
   * @param {string|number} id - ID del registro
   * @returns {Promise<Object>} Datos del registro
   */
  static async getRecordById(id) {
    try {
      const response = await fetch(apiUrl(`historia/${id}`), {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data,
        record: data.record || data
      };
    } catch (error) {
      console.error('Error obteniendo registro:', error);
      return {
        success: false,
        error: error.message || 'Error obteniendo registro'
      };
    }
  }

  /**
   * Crear nuevo registro en historia clínica
   * @param {Object} recordData - Datos del registro
   * @returns {Promise<Object>} Registro creado
   */
  static async createRecord(recordData) {
    try {
      const response = await fetch(apiUrl('historia'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(recordData),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data,
        record: data.record || data,
        message: data.message || 'Registro creado exitosamente'
      };
    } catch (error) {
      console.error('Error creando registro:', error);
      return {
        success: false,
        error: error.message || 'Error creando registro'
      };
    }
  }

  /**
   * Actualizar registro existente
   * @param {string|number} id - ID del registro
   * @param {Object} recordData - Datos actualizados
   * @returns {Promise<Object>} Registro actualizado
   */
  static async updateRecord(id, recordData) {
    try {
      const response = await fetch(apiUrl(`historia/${id}`), {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(recordData),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data,
        record: data.record || data,
        message: data.message || 'Registro actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error actualizando registro:', error);
      return {
        success: false,
        error: error.message || 'Error actualizando registro'
      };
    }
  }

  /**
   * Eliminar registro
   * @param {string|number} id - ID del registro
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  static async deleteRecord(id) {
    try {
      const response = await fetch(apiUrl(`historia/${id}`), {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        message: 'Registro eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error eliminando registro:', error);
      return {
        success: false,
        error: error.message || 'Error eliminando registro'
      };
    }
  }

  /**
   * Obtener registros por paciente
   * @param {string|number} patientId - ID del paciente
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Registros del paciente
   */
  static async getRecordsByPatient(patientId, params = {}) {
    try {
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      const baseUrl = apiUrl(`historia/paciente/${patientId}`);
      const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`,
          records: []
        };
      }

      return {
        success: true,
        data,
        records: data.records || data,
        patient: data.patient
      };
    } catch (error) {
      console.error('Error obteniendo registros del paciente:', error);
      return {
        success: false,
        error: error.message || 'Error obteniendo registros del paciente',
        records: []
      };
    }
  }

  /**
   * Buscar registros por criterios
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Object>} Resultados de búsqueda
   */
  static async searchRecords(filters = {}) {
    try {
      const queryString = Object.keys(filters)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`)
        .join('&');
      
      const url = apiUrl(`historia/search?${queryString}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`,
          records: []
        };
      }

      return {
        success: true,
        data,
        records: data.records || data,
        count: data.count || (Array.isArray(data) ? data.length : 0)
      };
    } catch (error) {
      console.error('Error buscando registros:', error);
      return {
        success: false,
        error: error.message || 'Error buscando registros',
        records: []
      };
    }
  }
}

export default HistoryService;