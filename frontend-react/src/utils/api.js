// src/utils/api.js
export const API_BASE = "http://localhost:4000/api".replace(/\/$/, "")

export function apiUrl(path = "") {
  const cleaned = String(path || "").replace(/^\/+/, "")
  const url = cleaned ? `${API_BASE}/${cleaned}` : API_BASE
  return url
}

export function getToken() {
  const userStr = localStorage.getItem("user")
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      return user.token
    } catch (error) {
      console.error(
        "❌ getToken - Error parsing user from localStorage:",
        error
      )
      return null
    }
  }
  return null
}

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
 * handleResponse: parsea la respuesta, con logging detallado cuando la respuesta
 * no es JSON válido (ej. HTML dev server, página de login, etc).
 */
export async function handleResponse(response) {
  const contentType = (response.headers.get("content-type") || "").toLowerCase()

  if (!response.ok) {
    // Intentamos extraer JSON de error; si falla, guardamos texto crudo
    let errorMessage = `Error ${response.status}: ${response.statusText}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorData.message || errorMessage
      console.error(`❌ Error JSON:`, errorData)
    } catch {
      // No era JSON: tomar texto crudo
      try {
        const text = await response.text()
        if (text) {
          errorMessage = text.slice(0, 2000)
        }
      } catch (err2) {
        console.error(`❌ Error leyendo body:`, err2)
      }
    }

    console.error(`❌ Lanzando error:`, errorMessage)
    throw new Error(errorMessage)
  }

  // No content
  if (response.status === 204) {
    return null
  }

  // Si Content-Type indica JSON, parseamos; si no, devolvemos texto crudo y avisamos
  if (
    contentType.includes("application/json") ||
    contentType.includes("application/ld+json")
  ) {
    try {
      const data = await response.json()
      return data
    } catch (error) {
      // JSON parsing failed even si content-type decía JSON: log raw text
      try {
        const raw = await response.text()
        console.error(`Error parseando JSON. RAW:`, raw.slice(0, 2000))
        throw new Error(
          `Error parseando JSON de la respuesta: se recibió texto. Revisa RAW response (console).`
        )
      } catch (err2) {
        console.error(`Error leyendo body despues de fallo JSON:`, err2)
        throw new Error(`Error parseando respuesta JSON: ${error.message}`)
      }
    }
  } else {
    // No es JSON: mostrar RAW para debug y lanzar error claro
    try {
      const raw = await response.text()
      console.warn(
        `Response no es JSON. Content-Type: ${contentType}. RAW:`,
        raw.slice(0, 2000)
      )
      throw new Error(
        `La API devolvió Content-Type="${contentType}" (no JSON). Revisa la respuesta RAW en consola.`
      )
    } catch (err) {
      console.error(`Error leyendo body no-JSON:`, err)
      throw new Error(
        "La API devolvió una respuesta no-JSON y no se pudo leer el body."
      )
    }
  }
}

export async function apiFetch(url, options = {}) {
  try {
    const response = await fetch(url, options)

    const result = await handleResponse(response)

    return result
  } catch (error) {
    console.error(`ERROR:`, {
      message: error.message,
      name: error.name
    })
    throw error
  }
}

// Métodos HTTP convenience
export const api = {
  get: (path, options = {}) => {
    const url = apiUrl(path)
    const headers = getHeaders()

    return apiFetch(url, {
      ...options,
      method: "GET",
      headers: headers
    }).catch((error) => {
      console.error(`Error:`, error.message)
      throw error
    })
  },

  post: (path, data, options = {}) => {
    const url = apiUrl(path)
    const headers = getHeaders()

    return apiFetch(url, {
      ...options,
      method: "POST",
      headers: headers,
      body: JSON.stringify(data)
    }).catch((error) => {
      console.error(`Error:`, error.message)
      throw error
    })
  },

  patch: (path, data, options = {}) => {
    const url = apiUrl(path)
    const headers = getHeaders()

    return apiFetch(url, {
      ...options,
      method: "PATCH",
      headers: headers,
      body: JSON.stringify(data)
    }).catch((error) => {
      console.error(`Error:`, error.message)
      throw error
    })
  },

  delete: (path, options = {}) => {
    const url = apiUrl(path)
    const headers = getHeaders(null) // DELETE puede no necesitar Content-Type

    return apiFetch(url, {
      ...options,
      method: "DELETE",
      headers: headers
    }).catch((error) => {
      console.error(`Error:`, error.message)
      throw error
    })
  }
}
