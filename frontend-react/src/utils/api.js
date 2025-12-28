// src/utils/api.js
let apiCallCount = 0
let fetchCallCount = 0

export const API_BASE = "http://localhost:4000/api".replace(/\/$/, "")

export function apiUrl(path = "") {
  const cleaned = String(path || "").replace(/^\/+/, "")
  const url = cleaned ? `${API_BASE}/${cleaned}` : API_BASE
  console.log(`🌐 apiUrl - Path: "${path}" -> URL: ${url}`)
  return url
}

export function getToken() {
  console.log(`🔐 getToken - Obteniendo token de localStorage`)
  const userStr = localStorage.getItem("user")
  console.log(
    "🔐 Token obtenido de localStorage:",
    userStr ? "PRESENTE" : "AUSENTE"
  )
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      console.log(
        `🔐 getToken - Usuario encontrado, token: ${
          user.token ? "PRESENTE" : "AUSENTE"
        }`
      )
      return user.token
    } catch (error) {
      console.error(
        "❌ getToken - Error parsing user from localStorage:",
        error
      )
      return null
    }
  }
  console.log(`🔐 getToken - No hay usuario en localStorage`)
  return null
}

export function getHeaders(contentType = "application/json") {
  console.log(`📋 getHeaders - Content-Type: ${contentType}`)

  const headers = {
    Accept: "application/json"
  }

  if (contentType) {
    headers["Content-Type"] = contentType
  }

  const token = getToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
    console.log(`📋 getHeaders - Token incluído en headers`)
  } else {
    console.log(`📋 getHeaders - NO hay token disponible`)
  }

  console.log(`📋 getHeaders - Headers finales:`, headers)
  return headers
}

/**
 * handleResponse: parsea la respuesta, con logging detallado cuando la respuesta
 * no es JSON válido (ej. HTML dev server, página de login, etc).
 */
export async function handleResponse(response) {
  const callId = fetchCallCount
  const contentType = (response.headers.get("content-type") || "").toLowerCase()

  console.log(
    `🔄 handleResponse #${callId} - Status: ${response.status} ${response.statusText} - Content-Type: ${contentType}`
  )

  if (!response.ok) {
    // Intentamos extraer JSON de error; si falla, guardamos texto crudo
    let errorMessage = `Error ${response.status}: ${response.statusText}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorData.message || errorMessage
      console.error(`❌ handleResponse #${callId} - Error JSON:`, errorData)
    } catch {
      // No era JSON: tomar texto crudo
      try {
        const text = await response.text()
        if (text) {
          const snippet = text.slice(0, 2000)
          console.error(
            `❌ handleResponse #${callId} - Error text (snippet):`,
            snippet
          )
          errorMessage = snippet
        }
      } catch (err2) {
        console.error(
          `❌ handleResponse #${callId} - Error leyendo body:`,
          err2
        )
      }
    }

    console.error(
      `❌ handleResponse #${callId} - Lanzando error:`,
      errorMessage
    )
    throw new Error(errorMessage)
  }

  // No content
  if (response.status === 204) {
    console.log(`✅ handleResponse #${callId} - Status 204, sin contenido`)
    return null
  }

  // Si Content-Type indica JSON, parseamos; si no, devolvemos texto crudo y avisamos
  if (
    contentType.includes("application/json") ||
    contentType.includes("application/ld+json")
  ) {
    try {
      const data = await response.json()
      console.log(`✅ handleResponse #${callId} - JSON parseado exitosamente`, {
        dataType: typeof data,
        isArray: Array.isArray(data),
        count: Array.isArray(data) ? data.length : "N/A",
        sample:
          Array.isArray(data) && data.length > 0
            ? typeof data[0] === "object"
              ? { ...data[0], fullData: "..." }
              : data[0]
            : "vacío"
      })
      return data
    } catch (error) {
      // JSON parsing failed even si content-type decía JSON: log raw text
      try {
        const raw = await response.text()
        const snippet = raw.slice(0, 2000)
        console.error(
          `❌ handleResponse #${callId} - Error parseando JSON. RAW (snippet):`,
          snippet
        )
        throw new Error(
          `Error parseando JSON de la respuesta: se recibió texto. Revisa RAW response (console).`
        )
      } catch (err2) {
        console.error(
          `❌ handleResponse #${callId} - Error leyendo body despues de fallo JSON:`,
          err2
        )
        throw new Error(`Error parseando respuesta JSON: ${error.message}`)
      }
    }
  } else {
    // No es JSON: mostrar RAW para debug y lanzar error claro
    try {
      const raw = await response.text()
      const snippet = raw.slice(0, 2000)
      console.warn(
        `⚠️ handleResponse #${callId} - Response no es JSON. Content-Type: ${contentType}. RAW (snippet):`,
        snippet
      )
      throw new Error(
        `La API devolvió Content-Type="${contentType}" (no JSON). Revisa la respuesta RAW en consola.`
      )
    } catch (err) {
      console.error(
        `❌ handleResponse #${callId} - Error leyendo body no-JSON:`,
        err
      )
      throw new Error(
        "La API devolvió una respuesta no-JSON y no se pudo leer el body."
      )
    }
  }
}

export async function apiFetch(url, options = {}) {
  fetchCallCount++
  const callId = fetchCallCount

  console.log(`🌐 apiFetch #${callId} - INICIO`)
  console.log(`🌐 apiFetch #${callId} - URL: ${url}`)
  console.log(`🌐 apiFetch #${callId} - Options:`, {
    method: options.method,
    headers: options.headers,
    hasBody: !!options.body,
    bodyLength: options.body ? JSON.stringify(options.body).length : 0
  })

  try {
    const startTime = performance.now()
    console.log(`🌐 apiFetch #${callId} - Llamando fetch...`)

    const response = await fetch(url, options)

    const endTime = performance.now()
    console.log(
      `🌐 apiFetch #${callId} - Fetch completado en ${Math.round(
        endTime - startTime
      )}ms`
    )
    // Intentamos mostrar headers (si es posible)
    let headersObj = {}
    try {
      headersObj = Object.fromEntries(response.headers.entries())
    } catch (err) {
      console.warn(`🌐 apiFetch #${callId} - No se pudieron leer headers:`, err)
    }

    console.log(`🌐 apiFetch #${callId} - Response recibida:`, {
      status: response.status,
      statusText: response.statusText,
      headers: headersObj,
      ok: response.ok,
      redirected: response.redirected
    })

    const result = await handleResponse(response)

    const totalTime = Math.round(performance.now() - startTime)
    console.log(`✅ apiFetch #${callId} - COMPLETADO en ${totalTime}ms total`)

    return result
  } catch (error) {
    console.error(`❌ apiFetch #${callId} - ERROR CAPTURADO:`, {
      message: error.message,
      name: error.name,
      stack: error.stack
    })
    // extra: si el error tiene información útil, mostrarla
    throw error
  }
}

// Métodos HTTP convenience
export const api = {
  get: (path, options = {}) => {
    apiCallCount++
    const callId = apiCallCount

    console.log(`📡 API.GET #${callId} - INICIO`)
    console.log(`📡 API.GET #${callId} - Path: ${path}`)

    const url = apiUrl(path)
    console.log(`📡 API.GET #${callId} - URL completa: ${url}`)

    const headers = getHeaders()
    console.log(`📡 API.GET #${callId} - Headers generados:`, headers)

    console.log(`📡 API.GET #${callId} - Llamando a apiFetch...`)
    return apiFetch(url, {
      ...options,
      method: "GET",
      headers: headers
    })
      .then((result) => {
        console.log(`✅ API.GET #${callId} - FINALIZADO EXITOSAMENTE`)
        return result
      })
      .catch((error) => {
        console.error(
          `❌ API.GET #${callId} - FINALIZADO CON ERROR:`,
          error.message
        )
        throw error
      })
  },

  post: (path, data, options = {}) => {
    apiCallCount++
    const callId = apiCallCount

    console.log(`📡 API.POST #${callId} - INICIO`)
    console.log(`📡 API.POST #${callId} - Path: ${path}`)
    console.log(`📡 API.POST #${callId} - Data:`, data)

    const url = apiUrl(path)
    console.log(`📡 API.POST #${callId} - URL completa: ${url}`)

    const headers = getHeaders()
    console.log(`📡 API.POST #${callId} - Headers generados:`, headers)

    console.log(
      `📡 API.POST #${callId} - Body serializado:`,
      JSON.stringify(data)
    )

    return apiFetch(url, {
      ...options,
      method: "POST",
      headers: headers,
      body: JSON.stringify(data)
    })
      .then((result) => {
        console.log(`✅ API.POST #${callId} - FINALIZADO EXITOSAMENTE`)
        return result
      })
      .catch((error) => {
        console.error(
          `❌ API.POST #${callId} - FINALIZADO CON ERROR:`,
          error.message
        )
        throw error
      })
  },

  patch: (path, data, options = {}) => {
    apiCallCount++
    const callId = apiCallCount

    console.log(`📡 API.PATCH #${callId} - INICIO`)
    console.log(`📡 API.PATCH #${callId} - Path: ${path}`)
    console.log(`📡 API.PATCH #${callId} - Data:`, data)

    const url = apiUrl(path)
    console.log(`📡 API.PATCH #${callId} - URL completa: ${url}`)

    const headers = getHeaders()
    console.log(`📡 API.PATCH #${callId} - Headers generados:`, headers)

    return apiFetch(url, {
      ...options,
      method: "PATCH",
      headers: headers,
      body: JSON.stringify(data)
    })
      .then((result) => {
        console.log(`✅ API.PATCH #${callId} - FINALIZADO EXITOSAMENTE`)
        return result
      })
      .catch((error) => {
        console.error(
          `❌ API.PATCH #${callId} - FINALIZADO CON ERROR:`,
          error.message
        )
        throw error
      })
  },

  delete: (path, options = {}) => {
    apiCallCount++
    const callId = apiCallCount

    console.log(`📡 API.DELETE #${callId} - INICIO`)
    console.log(`📡 API.DELETE #${callId} - Path: ${path}`)

    const url = apiUrl(path)
    console.log(`📡 API.DELETE #${callId} - URL completa: ${url}`)

    const headers = getHeaders(null) // DELETE puede no necesitar Content-Type
    console.log(`📡 API.DELETE #${callId} - Headers generados:`, headers)

    return apiFetch(url, {
      ...options,
      method: "DELETE",
      headers: headers
    })
      .then((result) => {
        console.log(`✅ API.DELETE #${callId} - FINALIZADO EXITOSAMENTE`)
        return result
      })
      .catch((error) => {
        console.error(
          `❌ API.DELETE #${callId} - FINALIZADO CON ERROR:`,
          error.message
        )
        throw error
      })
  }
}
