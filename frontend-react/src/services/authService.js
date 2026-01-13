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

      // Normalizar posible token en root
      if (response && response.token && response.user) {
        response.user.token = response.token;
      }

      return response;
    } catch (error) {
      console.error("AuthService.login - Error:", error);
      throw new Error(error.message || "Error en AuthService.login");
    }
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
    localStorage.removeItem("token");
    return Promise.resolve();
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