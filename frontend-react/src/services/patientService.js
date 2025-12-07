import { apiUrl, getHeaders} from '../utils/api';

/**
 * Servicio de pacientes
 * Maneja todas las operaciones CRUD de pacientes
 */
class PatientService {
  /**
   * Obtener lista de pacientes
   * @param {Object} params - Parámetros de búsqueda y paginación
   * @returns {Promise<Object>} Lista de pacientes y metadatos
   */
  static async getPatients(params = {}) {
    try {
      // Construir query string
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      const url = queryString ? apiUrl(`patients?${queryString}`) : apiUrl('patients');
      
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
          patients: [],
          pagination: null
        };
      }

      return {
        success: true,
        data,
        patients: data.patients || data,
        pagination: data.pagination,
        total: data.total || (Array.isArray(data) ? data.length : 0)
      };
    } catch (error) {
      console.error('Error obteniendo pacientes:', error);
      return {
        success: false,
        error: error.message || 'Error obteniendo pacientes',
        patients: [],
        pagination: null
      };
    }
  }

  /**
   * Obtener paciente por ID
   * @param {string|number} id - ID del paciente
   * @returns {Promise<Object>} Datos del paciente
   */
  static async getPatientById(id) {
    try {
      const response = await fetch(apiUrl(`patients/${id}`), {
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
        patient: data.patient || data
      };
    } catch (error) {
      console.error('Error obteniendo paciente:', error);
      return {
        success: false,
        error: error.message || 'Error obteniendo paciente'
      };
    }
  }

  /**
   * Crear nuevo paciente
   * @param {Object} patientData - Datos del paciente
   * @returns {Promise<Object>} Paciente creado
   */
  static async createPatient(patientData) {
    try {
      const response = await fetch(apiUrl('patients'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(patientData),
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
        patient: data.patient || data,
        message: data.message || 'Paciente creado exitosamente'
      };
    } catch (error) {
      console.error('Error creando paciente:', error);
      return {
        success: false,
        error: error.message || 'Error creando paciente'
      };
    }
  }

  /**
   * Actualizar paciente existente
   * @param {string|number} id - ID del paciente
   * @param {Object} patientData - Datos actualizados
   * @returns {Promise<Object>} Paciente actualizado
   */
  static async updatePatient(id, patientData) {
    try {
      const response = await fetch(apiUrl(`patients/${id}`), {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(patientData),
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
        patient: data.patient || data,
        message: data.message || 'Paciente actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error actualizando paciente:', error);
      return {
        success: false,
        error: error.message || 'Error actualizando paciente'
      };
    }
  }

  /**
   * Eliminar paciente
   * @param {string|number} id - ID del paciente
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  static async deletePatient(id) {
    try {
      const response = await fetch(apiUrl(`patients/${id}`), {
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
        message: 'Paciente eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error eliminando paciente:', error);
      return {
        success: false,
        error: error.message || 'Error eliminando paciente'
      };
    }
  }

  /**
   * Buscar pacientes por criterios
   * @param {string} query - Término de búsqueda
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Object>} Resultados de búsqueda
   */
  static async searchPatients(query, options = {}) {
    try {
      const params = { q: query, ...options };
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      const response = await fetch(apiUrl(`patients/search?${queryString}`), {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`,
          patients: []
        };
      }

      return {
        success: true,
        data,
        patients: data.patients || data,
        count: data.count || (Array.isArray(data) ? data.length : 0)
      };
    } catch (error) {
      console.error('Error buscando pacientes:', error);
      return {
        success: false,
        error: error.message || 'Error buscando pacientes',
        patients: []
      };
    }
  }

  /**
   * Obtener estadísticas de pacientes
   * @returns {Promise<Object>} Estadísticas
   */
  static async getStatistics() {
    try {
      const response = await fetch(apiUrl('patients/statistics'), {
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
        statistics: data.statistics || data
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        success: false,
        error: error.message || 'Error obteniendo estadísticas'
      };
    }
  }

  /**
   * Asignar gestor de casos a paciente
   * @param {string|number} patientId - ID del paciente
   * @param {string|number} gestorId - ID del gestor
   * @returns {Promise<Object>} Resultado de la asignación
   */
  static async assignGestor(patientId, gestorId) {
    try {
      const response = await fetch(apiUrl(`patients/${patientId}/assign-gestor`), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ id_gestor: gestorId }),
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
        message: data.message || 'Gestor asignado exitosamente'
      };
    } catch (error) {
      console.error('Error asignando gestor:', error);
      return {
        success: false,
        error: error.message || 'Error asignando gestor'
      };
    }
  }

  /**
   * Obtener gestores disponibles
   * @returns {Promise<Object>} Lista de gestores
   */
  static async getGestores() {
    try {
      const response = await fetch(apiUrl('gestores'), {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`,
          gestores: []
        };
      }

      return {
        success: true,
        data,
        gestores: data.gestores || data
      };
    } catch (error) {
      console.error('Error obteniendo gestores:', error);
      return {
        success: false,
        error: error.message || 'Error obteniendo gestores',
        gestores: []
      };
    }
  }

  /**
   * Obtener historial médico del paciente
   * @param {string|number} patientId - ID del paciente
   * @returns {Promise<Object>} Historial médico
   */
  static async getMedicalHistory(patientId) {
    try {
      const response = await fetch(apiUrl(`patients/${patientId}/medical-history`), {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`,
          history: []
        };
      }

      return {
        success: true,
        data,
        history: data.history || data
      };
    } catch (error) {
      console.error('Error obteniendo historial médico:', error);
      return {
        success: false,
        error: error.message || 'Error obteniendo historial médico',
        history: []
      };
    }
  }

  /**
   * Obtener planes de tratamiento del paciente
   * @param {string|number} patientId - ID del paciente
   * @returns {Promise<Object>} Planes de tratamiento
   */
  static async getPatientPlans(patientId) {
    try {
      const response = await fetch(apiUrl(`patients/${patientId}/plans`), {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`,
          plans: []
        };
      }

      return {
        success: true,
        data,
        plans: data.plans || data
      };
    } catch (error) {
      console.error('Error obteniendo planes del paciente:', error);
      return {
        success: false,
        error: error.message || 'Error obteniendo planes del paciente',
        plans: []
      };
    }
  }
}

export default PatientService;