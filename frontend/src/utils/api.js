// src/utils/api.js
export const API_BASE = "http://localhost:4000/api".replace(/\/$/, "")

export function apiUrl(path = "") {
  const cleaned = String(path || "").replace(/^\/+/, "")
  const url = cleaned ? `${API_BASE}/${cleaned}` : API_BASE
  return url
}

export function getToken() {
  return null // Las cookies se manejan automáticamente
}

export function getHeaders(contentType = "application/json") {
  const headers = {
    'Accept': 'application/json'
  }
  
  if (contentType) {
    headers['Content-Type'] = contentType
  }
  
  return headers
}

export async function handleResponse(response) {
  const contentType = (response.headers.get("content-type") || "").toLowerCase()

  // ✅ MANEJAR ERROR 401 AUTOMÁTICAMENTE
  if (response.status === 401) {
    console.log('🔐 handleResponse: 401 Unauthorized - Token inválido/ausente')
    
    // Limpiar localStorage
    localStorage.removeItem("user")
    localStorage.removeItem("profile")
    
    // Si estamos en el navegador, redirigir a login
    if (typeof window !== "undefined" && !window.location.pathname.includes('/login')) {
      console.log('🔄 Redirigiendo a login desde handleResponse')
      window.location.href = "/login"
    }
    
    const errorData = await response.json().catch(() => ({ error: "No autenticado" }))
    throw new Error(errorData.error || "Sesión expirada. Por favor, inicie sesión nuevamente.")
  }

  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorData.message || errorMessage
      console.error(`❌ Error JSON:`, errorData)
    } catch {
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

  if (response.status === 204) return null

  if (
    contentType.includes("application/json") ||
    contentType.includes("application/ld+json")
  ) {
    try {
      const data = await response.json()
      return data
    } catch (error) {
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
    // ✅ CONFIGURACIÓN CRÍTICA para cookies
    const fetchOptions = {
      ...options,
      credentials: 'include', // Envía cookies automáticamente
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      }
    }
    
    console.log('🌐 Fetch a:', url, 'con cookies')
    
    const response = await fetch(url, fetchOptions)
    const result = await handleResponse(response)
    return result
  } catch (error) {
    // Si fue abortado: lo consideramos un flujo normal (no spam en consola)
    if (error && error.name === "AbortError") {
      // re-lanzamos para que el caller pueda detectarlo si quiere
      throw error
    }
    // Para otros errores, dejamos log y re-lanzamos
    console.error(`ERROR apiFetch:`, {
      message: error.message,
      name: error.name
    })
    throw error
  }
}

export const api = {
  get: (path, options = {}) => {
    const url = apiUrl(path)
    const headers = getHeaders()
    return apiFetch(url, {
      ...options,
      method: "GET",
      headers
    })
  },

  post: (path, data, options = {}) => {
    const url = apiUrl(path)
    const headers = getHeaders()
    return apiFetch(url, {
      ...options,
      method: "POST",
      headers,
      body: JSON.stringify(data)
    })
  },

  patch: (path, data, options = {}) => {
    const url = apiUrl(path)
    const headers = getHeaders()
    return apiFetch(url, {
      ...options,
      method: "PATCH",
      headers,
      body: JSON.stringify(data)
    })
  },

  delete: (path, options = {}) => {
    const url = apiUrl(path)
    const headers = getHeaders(null)
    return apiFetch(url, {
      ...options,
      method: "DELETE",
      headers
    })
  }
}
