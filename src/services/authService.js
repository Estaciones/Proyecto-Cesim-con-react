import { api } from "../utils/api"

export const AuthService = {
  login: async (credentials) => {
    try {
      const { identifier, password } = credentials
      const isEmail = identifier.includes("@")
      const payload = {
        password,
        ...(isEmail ? { email: identifier } : { nombre_usuario: identifier })
      }

      const response = await api.post("auth/login", payload)

      return response
    } catch (error) {
      console.error("AuthService.login - Error:", error)
      throw new Error(error.message || "Error en AuthService.login")
    }
  },
  verify: async () => {
    try {
      const response = await api.get("auth/verify")
      return response
    } catch (error) {
      console.error("AuthService.verify - Error:", error)
      throw error
    }
  },
  logout: async () => {
    try {
      // Llamar al backend para limpiar cookies
      await api.post("auth/logout")

      // Limpiar localStorage
      localStorage.removeItem("user")
      localStorage.removeItem("profile")

      // Recargar para limpiar estado
      window.location.href = "/login"

      return Promise.resolve()
    } catch (error) {
      console.error("AuthService.logout - Error:", error)
      throw error
    }
  },

  getProfile: async (userId) => {
    try {
      const response = await api.get(`profile?id=${userId}`)
      return response
    } catch (error) {
      console.error("AuthService.getProfile - Error:", error)
      throw error
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post("auth/register", userData)
      return response
    } catch (error) {
      console.error("AuthService.register - Error:", error)
      const msg = error.message || "Error en AuthService.register"
      throw new Error(msg)
    }
  }
}
