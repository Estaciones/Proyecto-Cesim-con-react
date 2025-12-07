// Helper simple para construir URLs de API centralizado.
// Usa una URL explícita en lugar de confiar en variables de entorno.
export const API_BASE = "http://localhost:3000/api".replace(/\/$/, "")

/**
 * apiUrl(path)
 * - path: cadena relativa (puede incluir query string), p. ej. "profile?id=123" o "/historia"
 * - devuelve: URL absoluta completa para usar en fetch
 */
export function apiUrl(path = "") {
  const cleaned = String(path || "").replace(/^\/+/, "") // quita slashes iniciales
  return cleaned ? `${API_BASE}/${cleaned}` : API_BASE
}

/**
 * Obtiene el token del usuario actual desde localStorage
 */
export function getToken() {
  const userStr = localStorage.getItem("user")
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      return user.token
    } catch (error) {
      console.error("Error parsing user from localStorage:", error)
      return null
    }
  }
  return null
}

/**
 * Obtiene los headers comunes para las peticiones fetch
 * Incluye token de autenticación si está disponible
 */
export function getHeaders(contentType = "application/json") {
  const headers = {
    Accept: "application/json"
  }

  if (contentType) {
    headers["Content-Type"] = contentType
  }

  const token = getToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return headers
}

/**
 * Función helper para manejar respuestas fetch
 * Convierte la respuesta a JSON y maneja errores comunes
 */
export async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`

    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorData.message || errorMessage
    } catch (e) {
      console.log("Dio este error " + e)
      // Si no se puede parsear como JSON, usar el texto de la respuesta
      const text = await response.text()
      if (text) errorMessage = text
    }

    throw new Error(errorMessage)
  }

  // Para respuestas sin contenido (204 No Content)
  if (response.status === 204) {
    return null
  }

  return response.json()
}

/**
 * Función wrapper para fetch con manejo de errores común
 */
export async function apiFetch(url, options = {}) {
  try {
    const response = await fetch(url, options)
    return await handleResponse(response)
  } catch (error) {
    console.error("Error en apiFetch:", error)
    throw error
  }
}
