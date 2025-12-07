import { apiUrl, getHeaders } from '../utils/api';

/**
 * Servicio de planes de tratamiento
 * Maneja todas las operaciones CRUD de planes y prescripciones
 */
class PlanService {
  /**
   * Obtener lista de planes de tratamiento
   * @param {Object} params - Parámetros de búsqueda y paginación
   * @returns {Promise<Object>} Lista de planes y metadatos
   */
  static async getPlans(params = {}) {
    try {
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      const url = queryString ? apiUrl(`plans?${queryString}`) : apiUrl('plans');
      
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
          plans: [],
          pagination: null
        };
      }

      return {
        success: true,
        data,
        plans: data.plans || data,
        pagination: data.pagination,
        total: data.total || (Array.isArray(data) ? data.length : 0)
      };
    } catch (error) {
      console.error('Error obteniendo planes:', error);
      return {
        success: false,
        error: error.message || 'Error obteniendo planes',
        plans: [],
        pagination: null
      };
    }
  }

  /**
   * Obtener plan por ID
   * @param {string|number} id - ID del plan
   * @returns {Promise<Object>} Datos del plan con prescripciones
   */
  static async getPlanById(id) {
    try {
      const response = await fetch(apiUrl(`plans/${id}`), {
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
        plan: data.plan || data
      };
    } catch (error) {
      console.error('Error obteniendo plan:', error);
      return {
        success: false,
        error: error.message || 'Error obteniendo plan'
      };
    }
  }

  /**
   * Crear nuevo plan de tratamiento
   * @param {Object} planData - Datos del plan
   * @returns {Promise<Object>} Plan creado
   */
  static async createPlan(planData) {
    try {
      const response = await fetch(apiUrl('plans'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(planData),
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
        plan: data.plan || data,
        message: data.message || 'Plan creado exitosamente'
      };
    } catch (error) {
      console.error('Error creando plan:', error);
      return {
        success: false,
        error: error.message || 'Error creando plan'
      };
    }
  }

  /**
   * Actualizar plan existente
   * @param {string|number} id - ID del plan
   * @param {Object} planData - Datos actualizados
   * @returns {Promise<Object>} Plan actualizado
   */
  static async updatePlan(id, planData) {
    try {
      const response = await fetch(apiUrl(`plans/${id}`), {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(planData),
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
        plan: data.plan || data,
        message: data.message || 'Plan actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error actualizando plan:', error);
      return {
        success: false,
        error: error.message || 'Error actualizando plan'
      };
    }
  }

  /**
   * Eliminar plan
   * @param {string|number} id - ID del plan
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  static async deletePlan(id) {
    try {
      const response = await fetch(apiUrl(`plans/${id}`), {
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
        message: 'Plan eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error eliminando plan:', error);
      return {
        success: false,
        error: error.message || 'Error eliminando plan'
      };
    }
  }

  /**
   * Cambiar estado del plan
   * @param {string|number} id - ID del plan
   * @param {string} estado - Nuevo estado (activo, completado, cancelado)
   * @returns {Promise<Object>} Plan actualizado
   */
  static async changePlanStatus(id, estado) {
    try {
      const response = await fetch(apiUrl(`plans/${id}/status`), {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ estado }),
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
        plan: data.plan || data,
        message: data.message || `Plan marcado como ${estado}`
      };
    } catch (error) {
      console.error('Error cambiando estado del plan:', error);
      return {
        success: false,
        error: error.message || 'Error cambiando estado del plan'
      };
    }
  }

  /**
   * Obtener prescripciones de un plan
   * @param {string|number} planId - ID del plan
   * @returns {Promise<Object>} Lista de prescripciones
   */
  static async getPrescripciones(planId) {
    try {
      const response = await fetch(apiUrl(`plans/${planId}/prescripciones`), {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`,
          prescripciones: []
        };
      }

      return {
        success: true,
        data,
        prescripciones: data.prescripciones || data
      };
    } catch (error) {
      console.error('Error obteniendo prescripciones:', error);
      return {
        success: false,
        error: error.message || 'Error obteniendo prescripciones',
        prescripciones: []
      };
    }
  }

  /**
   * Agregar prescripción a un plan
   * @param {string|number} planId - ID del plan
   * @param {Object} prescripcionData - Datos de la prescripción
   * @returns {Promise<Object>} Prescripción creada
   */
  static async addPrescripcion(planId, prescripcionData) {
    try {
      const response = await fetch(apiUrl(`plans/${planId}/prescripciones`), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(prescripcionData),
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
        prescripcion: data.prescripcion || data,
        message: data.message || 'Prescripción agregada exitosamente'
      };
    } catch (error) {
      console.error('Error agregando prescripción:', error);
      return {
        success: false,
        error: error.message || 'Error agregando prescripción'
      };
    }
  }

  /**
   * Actualizar prescripción
   * @param {string|number} prescripcionId - ID de la prescripción
   * @param {Object} prescripcionData - Datos actualizados
   * @returns {Promise<Object>} Prescripción actualizada
   */
  static async updatePrescripcion(prescripcionId, prescripcionData) {
    try {
      const response = await fetch(apiUrl(`prescripciones/${prescripcionId}`), {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(prescripcionData),
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
        prescripcion: data.prescripcion || data,
        message: data.message || 'Prescripción actualizada exitosamente'
      };
    } catch (error) {
      console.error('Error actualizando prescripción:', error);
      return {
        success: false,
        error: error.message || 'Error actualizando prescripción'
      };
    }
  }

  /**
   * Eliminar prescripción
   * @param {string|number} prescripcionId - ID de la prescripción
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  static async deletePrescripcion(prescripcionId) {
    try {
      const response = await fetch(apiUrl(`prescripciones/${prescripcionId}`), {
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
        message: 'Prescripción eliminada exitosamente'
      };
    } catch (error) {
      console.error('Error eliminando prescripción:', error);
      return {
        success: false,
        error: error.message || 'Error eliminando prescripción'
      };
    }
  }

  /**
   * Cambiar estado de cumplimiento de prescripción
   * @param {string|number} prescripcionId - ID de la prescripción
   * @param {boolean} cumplimiento - Nuevo estado de cumplimiento
   * @returns {Promise<Object>} Prescripción actualizada
   */
  static async toggleCumplimiento(prescripcionId, cumplimiento) {
    try {
      const response = await fetch(apiUrl(`prescripciones/${prescripcionId}/cumplimiento`), {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ cumplimiento }),
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
        prescripcion: data.prescripcion || data,
        message: data.message || `Prescripción marcada como ${cumplimiento ? 'cumplida' : 'no cumplida'}`
      };
    } catch (error) {
      console.error('Error cambiando cumplimiento:', error);
      return {
        success: false,
        error: error.message || 'Error cambiando cumplimiento'
      };
    }
  }
}

export default PlanService;