// src/services/patientService.js (ACTUALIZADO)
import api from './api';

const PatientService = {
  // Obtener todos los pacientes
  getAll: async (params = {}) => {
    let url = 'pacientes';
    const queryParams = new URLSearchParams();
    
    if (params.medico_id) queryParams.append('medico_id', params.medico_id);
    if (params.gestor_id) queryParams.append('gestor_id', params.gestor_id);
    
    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
    
    return api.get(url);
  },

  // Crear paciente
  create: async (patientData) => {
    return api.post('pacientes', patientData);
  },

  // Asignar gestor
  assignGestor: async (id_gestor, id_paciente) => {
    return api.post('asignar_gestor', { id_gestor, id_paciente });
  }
};

export default PatientService;