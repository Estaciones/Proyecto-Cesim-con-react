// src/services/historyService.js
import { api } from '../utils/api';

export const HistoryService = {
  getAll: async (params = {}) => {
    // params puede ser { ci, id_paciente } o vacío
    const queryString = new URLSearchParams(params).toString();
    const path = queryString ? `historia?${queryString}` : 'historia';
    return api.get(path);
  },

  getById: async (id) => {
    return api.get(`historia/${id}`);
  },

  create: async (historyData) => {
    return api.post('historia', historyData);
  },

  update: async (id, historyData) => {
    return api.patch(`historia/${id}`, historyData);
  },

  delete: async (id) => {
    return api.delete(`historia/${id}`);
  },
};