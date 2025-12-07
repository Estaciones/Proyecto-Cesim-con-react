import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook personalizado para manejar operaciones con pacientes
 * @returns {Object} Estado y funciones de pacientes
 */
export function usePatients() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    limit: 20,
    totalPages: 0
  });

  const { getToken, user } = useAuth();
  const API_URL ='http://localhost:3000/api';

  /**
   * Cargar lista de pacientes
   * @param {Object} options - Opciones de paginación y filtros
   */
  const loadPatients = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('No autenticado');
      }

      const { page = 1, limit = 20, search = '' } = options;
      
      let url = `${API_URL}/patients?page=${page}&limit=${limit}`;
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      // Si el usuario es médico, cargar solo sus pacientes
      if (user?.tipo === 'medico') {
        url += `&medico_id=${user.id}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar pacientes');
      }

      setPatients(Array.isArray(data.patients) ? data.patients : data);
      
      if (data.pagination) {
        setPagination(data.pagination);
      }

      return { success: true, patients: data.patients || data };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [API_URL, getToken, user]);

  /**
   * Crear un nuevo paciente
   * @param {Object} patientData - Datos del paciente
   */
  const createPatient = async (patientData) => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('No autenticado');
      }

      const response = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patientData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear paciente');
      }

      // Actualizar lista de pacientes
      setPatients(prev => [...prev, data.patient]);
      
      return { success: true, patient: data.patient };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar paciente existente
   * @param {string} id - ID del paciente
   * @param {Object} patientData - Datos actualizados
   */
  const updatePatient = async (id, patientData) => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('No autenticado');
      }

      const response = await fetch(`${API_URL}/patients/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patientData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar paciente');
      }

      // Actualizar paciente en la lista
      setPatients(prev => prev.map(patient => 
        patient.id_paciente === id ? { ...patient, ...data.patient } : patient
      ));

      return { success: true, patient: data.patient };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar paciente
   * @param {string} id - ID del paciente
   */
  const deletePatient = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('No autenticado');
      }

      const response = await fetch(`${API_URL}/patients/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar paciente');
      }

      // Eliminar paciente de la lista
      setPatients(prev => prev.filter(patient => patient.id_paciente !== id));

      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Buscar pacientes por criterios
   * @param {string} query - Término de búsqueda
   * @param {Array} fields - Campos donde buscar (default: ['nombre', 'apellido', 'ci', 'email'])
   */
  const searchPatients = async (query, fields = ['nombre', 'apellido', 'ci', 'email']) => {
    try {
      if (!query.trim()) {
        await loadPatients();
        return { success: true, patients };
      }

      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('No autenticado');
      }

      const response = await fetch(`${API_URL}/patients/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, fields })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la búsqueda');
      }

      setPatients(data.patients || []);
      return { success: true, patients: data.patients || [] };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener paciente por ID
   * @param {string} id - ID del paciente
   */
  const getPatientById = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('No autenticado');
      }

      const response = await fetch(`${API_URL}/patients/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar paciente');
      }

      return { success: true, patient: data.patient };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Asignar gestor de casos a paciente
   * @param {string} patientId - ID del paciente
   * @param {string} gestorId - ID del gestor
   */
  const assignGestor = async (patientId, gestorId) => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('No autenticado');
      }

      const response = await fetch(`${API_URL}/patients/${patientId}/assign-gestor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_gestor: gestorId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al asignar gestor');
      }

      // Actualizar paciente en la lista
      setPatients(prev => prev.map(patient => 
        patient.id_paciente === patientId ? { ...patient, id_gestor: gestorId } : patient
      ));

      return { success: true, patient: data.patient };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar gestores disponibles
   */
  const loadGestores = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('No autenticado');
      }

      const response = await fetch(`${API_URL}/gestores`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar gestores');
      }

      return { success: true, gestores: data.gestores || data };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cambiar página de pacientes
   * @param {number} page - Número de página
   */
  const changePage = async (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    
    await loadPatients({ page, limit: pagination.limit });
  };

  // Cargar pacientes cuando el hook se monta
  useEffect(() => {
    if (user) {
      loadPatients();
    }
  }, [user, loadPatients]);

  return {
    // Estado
    patients,
    selectedPatient,
    loading,
    error,
    pagination,
    
    // Funciones CRUD
    loadPatients,
    createPatient,
    updatePatient,
    deletePatient,
    getPatientById,
    searchPatients,
    assignGestor,
    loadGestores,
    changePage,
    
    // Funciones de selección
    setSelectedPatient,
    clearSelectedPatient: () => setSelectedPatient(null),
    
    // Setters
    setError
  };
}

export default usePatients;