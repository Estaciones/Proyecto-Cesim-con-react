// src/services/patientService.js
import { api } from '../utils/api';

export const PatientService = {
  getAll: async (params = {}) => {
    // params puede ser { medico_id, gestor_id } o vacío
    const queryString = new URLSearchParams(params).toString();
    const path = queryString ? `pacientes?${queryString}` : 'pacientes';
    return api.get(path);
  },

  getById: async (id) => {
    return api.get(`pacientes/${id}`);
  },

  create: async (patientData) => {
    return api.post('pacientes', patientData);
  },

  update: async (id, patientData) => {
    return api.patch(`pacientes/${id}`, patientData);
  },

  delete: async (id) => {
    return api.delete(`pacientes/${id}`);
  },

  // Otras funciones específicas de pacientes
  getGestores: async () => {
    return api.get('gestores');
  },

  assignGestor: async (data) => {
    return api.post('asignar_gestor', data);
  },
};