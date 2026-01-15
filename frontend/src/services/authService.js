import { api } from "../utils/api";

export const AuthService = {
   login: async (credentials) => {
    try {
      const { identifier, password } = credentials;
      const isEmail = identifier.includes("@");
      const payload = {
        password,
        ...(isEmail ? { email: identifier } : { nombre_usuario: identifier })
      };

      const response = await api.post("auth/login", payload);
      
      // ❌ NO guardar token en localStorage - viene en cookies
      // localStorage.setItem('token', response.token);
      
      return response;
    } catch (error) {
      console.error("AuthService.login - Error:", error);
      throw new Error(error.message || "Error en AuthService.login");
    }
  },

  logout: async () => {
    try {
      // Llamar al backend para limpiar cookies
      await api.post("auth/logout");
      
      // Limpiar localStorage (pero NO el token porque está en cookies)
      localStorage.removeItem("user");
      localStorage.removeItem("profile");
      
      return Promise.resolve();
    } catch (error) {
      console.error("AuthService.logout - Error:", error);
      throw error;
    }
  },
  
  getProfile: async (userId) => {
    try {
      const response = await api.get(`profile?id=${userId}`);
      return response;
    } catch (error) {
      console.error("AuthService.getProfile - Error:", error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post("auth/register", userData);
      return response;
    } catch (error) {
      console.error("AuthService.register - Error:", error);
      const msg = error.message || "Error en AuthService.register";
      throw new Error(msg);
    }
  }
};