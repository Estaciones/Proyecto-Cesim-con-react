import { api } from "../utils/api";

export const AuthService = {
  login: async (credentials) => {
    try {
      console.log("AuthService.login - Credenciales:", credentials);
      const { identifier, password } = credentials;
      const isEmail = identifier.includes("@");
      const payload = {
        password,
        ...(isEmail ? { email: identifier } : { nombre_usuario: identifier })
      };

      console.log("AuthService.login - Payload a enviar:", payload);
      const response = await api.post("auth/login", payload);
      console.log("AuthService.login - Respuesta:", response);

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
      console.log("AuthService.getProfile - userId:", userId);
      const response = await api.get(`profile?id=${userId}`);
      console.log("AuthService.getProfile - Respuesta:", response);
      return response;
    } catch (error) {
      console.error("AuthService.getProfile - Error:", error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      console.log("AuthService.register - userData:", userData);
      const response = await api.post("auth/register", userData);
      console.log("AuthService.register - Respuesta:", response);
      return response;
    } catch (error) {
      console.error("AuthService.register - Error:", error);
      // Intentar extraer mensaje legible
      const msg = error.message || "Error en AuthService.register";
      throw new Error(msg);
    }
  }
};
