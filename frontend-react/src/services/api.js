// 1. Primero, actualiza src/services/api.js
import { apiUrl, getHeaders, apiFetch } from '../utils/api';

export const api = {
  get: async (path, options = {}) => {
    const url = apiUrl(path);
    const headers = getHeaders();
    return apiFetch(url, { 
      method: 'GET',
      headers,
      ...options 
    });
  },

  post: async (path, data, options = {}) => {
    const url = apiUrl(path);
    const headers = getHeaders();
    return apiFetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      ...options
    });
  },

  patch: async (path, data, options = {}) => {
    const url = apiUrl(path);
    const headers = getHeaders();
    return apiFetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
      ...options
    });
  },

  delete: async (path, options = {}) => {
    const url = apiUrl(path);
    const headers = getHeaders();
    return apiFetch(url, {
      method: 'DELETE',
      headers,
      ...options
    });
  }
};

export default api;