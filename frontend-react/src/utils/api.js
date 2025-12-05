// src/utils/api.js
// Helper para construir URLs de API centralizado.
// Usa REACT_APP_API_BASE (Create React App) o caída a cadena vacía
// para llamadas relativas (útil si usas "proxy" en package.json).
export const API_BASE = (process.env.REACT_APP_API_BASE || "").replace(/\/$/, "");

export function apiUrl(path) {
  const cleaned = String(path || "").replace(/^\//, "");
  return API_BASE ? `${API_BASE}/${cleaned}` : `/${cleaned}`;
}
