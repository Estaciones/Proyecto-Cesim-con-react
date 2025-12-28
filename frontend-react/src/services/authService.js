import { api } from "../utils/api"

export const AuthService = {
  login: async (credentials) => {
    try {
      console.log("AuthService.login - Credenciales:", credentials)
      const { identifier, password } = credentials
      const isEmail = identifier.includes("@")
      const payload = {
        password,
        ...(isEmail ? { email: identifier } : { nombre_usuario: identifier })
      }

      console.log("AuthService.login - Payload a enviar:", payload)
      const response = await api.post("auth/login", payload)
      console.log("AuthService.login - Respuesta:", response)

      // Normalizar para que siempre haya response.user.token (si el backend devolvió token)
      if (response && response.token && response.user) {
        response.user.token = response.token
      }

      return response
    } catch (error) {
      console.error("AuthService.login - Error:", error)
      // arrojar error con mensaje claro
      throw new Error(error.message || "Error en AuthService.login")
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
