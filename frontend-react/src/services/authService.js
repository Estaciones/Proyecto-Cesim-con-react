import { api } from "../utils/api"

// ligera util para detectar email
function isProbablyEmail(value) {
  if (!value || typeof value !== "string") return false
  const trimmed = value.trim()
  if (!trimmed.includes("@")) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
}

export const AuthService = {
  login: async (credentials) => {
    // credentials puede ser: { identifier, password } o { email, password } o { nombre_usuario, password }
    const identifier = credentials.identifier
    const email = credentials.email
    const nombre_usuario = credentials.nombre_usuario
    const username = credentials.username
    const password = credentials.password

    if (!password) throw new Error("Faltan credenciales")

    let payload = {}

    if (identifier) {
      if (isProbablyEmail(identifier)) {
        payload.email = identifier.trim().toLowerCase()
      } else {
        payload.nombre_usuario = identifier.trim()
      }
    } else if (email || nombre_usuario || username) {
      if (email) payload.email = email.trim().toLowerCase()
      if (nombre_usuario) payload.nombre_usuario = nombre_usuario.trim()
      if (username && !payload.nombre_usuario)
        payload.nombre_usuario = username.trim()
    } else {
      throw new Error("Faltan credenciales")
    }

    payload.password = password

    return api.post("auth/login", payload)
  },

  logout: async () => {
    localStorage.removeItem("user")
  },

  getProfile: async (userId) => {
    return api.get(`profile?id=${encodeURIComponent(userId)}`)
  }
}
