// src/services/planService.js
import { api } from '../utils/api';

export const PlanService = {
  getAll: async (params = {}) => {
    // params puede ser { ci, id_paciente } o vacío
    const queryString = new URLSearchParams(params).toString();
    const path = queryString ? `plan_tratamiento?${queryString}` : 'plan_tratamiento';
    return api.get(path);
  },

  getById: async (id) => {
    return api.get(`plan_tratamiento/${id}`);
  },

  create: async (planData) => {
    return api.post('plan_tratamiento', planData);
  },

  update: async (id, planData) => {
    return api.patch(`plan_tratamiento/${id}`, planData);
  },

  delete: async (id) => {
    return api.delete(`plan_tratamiento/${id}`);
  },

  // Funciones para prescripciones
  updatePrescription: async (presId, prescriptionData) => {
    return api.patch(`prescripcion/${presId}`, prescriptionData);
  },

  getPrescription: async (presId) => {
    return api.get(`prescripcion/${presId}`);
  },
};