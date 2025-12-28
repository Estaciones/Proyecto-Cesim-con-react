import { api } from "../utils/api"

export const AuthService = {
  login: async (credentials) => {
    try {
      console.log("AuthService.login - Credenciales:", credentials)

      // La API backend espera {nombre_usuario, password} o {email, password}
      // Como recibimos 'identifier' que puede ser email o username,
      // debemos determinar qué es
      const { identifier, password } = credentials

      // Determinar si identifier es email o username
      const isEmail = identifier.includes("@")

      // Construir el payload según lo que sea
      const payload = {
        password,
        ...(isEmail ? { email: identifier } : { nombre_usuario: identifier })
      }

      console.log("AuthService.login - Payload a enviar:", payload)

      const response = await api.post("auth/login", payload)
      console.log("AuthService.login - Respuesta:", response)

      return response
    } catch (error) {
      console.error("AuthService.login - Error:", error)
      throw error
    }
  },

  logout: () => {
    // Limpiar localStorage
    localStorage.removeItem("user")
    localStorage.removeItem("profile")
    localStorage.removeItem("token")
    return Promise.resolve()
  },

  getProfile: async (userId) => {
    try {
      console.log("AuthService.getProfile - userId:", userId)
      const response = await api.get(`profile?id=${userId}`)
      console.log("AuthService.getProfile - Respuesta:", response)
      return response
    } catch (error) {
      console.error("AuthService.getProfile - Error:", error)
      throw error
    }
  },

  register: (userData) => {
    return api.post("auth/register", userData)
  }
}
