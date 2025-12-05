// src/utils/api.js
// Helper simple para construir URLs de API centralizado.
// Usa una URL explícita en lugar de confiar en variables de entorno.
export const API_BASE = "http://localhost:3000/api".replace(/\/$/, "");

/**
 * apiUrl(path)
 * - path: cadena relativa (puede incluir query string), p. ej. "profile?id=123" o "/historia"
 * - devuelve: URL absoluta completa para usar en fetch
 */
export function apiUrl(path = "") {
  const cleaned = String(path || "").replace(/^\/+/, ""); // quita slashes iniciales
  return cleaned ? `${API_BASE}/${cleaned}` : API_BASE;
}
