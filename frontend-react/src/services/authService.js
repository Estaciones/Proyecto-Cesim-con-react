import { apiUrl, getHeaders } from '../utils/api';

/**
 * Servicio de autenticación
 * Maneja login, registro, verificación y recuperación de contraseña
 */
class AuthService {
  /**
   * Iniciar sesión
   * @param {Object} credentials - Credenciales del usuario
   * @param {string} credentials.email - Email o nombre de usuario
   * @param {string} credentials.password - Contraseña
   * @returns {Promise<Object>} Datos del usuario y token
   */
  static async login(credentials) {
    try {
      const response = await fetch(apiUrl('auth/login'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          email: credentials.email,
          nombre_usuario: credentials.email,
          password: credentials.password,
        }),
        credentials: 'include' // Para manejar cookies si las usas
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`
        };
      }

      if (data.message === 'Login correcto') {
        const userData = {
          id: data.user.id_usuario,
          email: data.user.email,
          tipo: data.user.tipo_usuario,
          nombre_usuario: data.user.nombre_usuario,
          token: data.token || null,
          profile: data.user
        };

        // Guardar en localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Guardar token separadamente si existe
        if (data.token) {
          localStorage.setItem('token', data.token);
        }

        return {
          success: true,
          data: userData,
          message: data.message || 'Login exitoso'
        };
      }

      return {
        success: false,
        error: data.error || 'Error en la autenticación'
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        error: error.message || 'Error de conexión con el servidor'
      };
    }
  }

  /**
   * Registrar nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Resultado del registro
   */
  static async register(userData) {
    try {
      const response = await fetch(apiUrl('auth/register'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data,
        message: data.message || 'Usuario registrado exitosamente'
      };
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        error: error.message || 'Error de conexión'
      };
    }
  }

  /**
   * Verificar token de autenticación
   * @returns {Promise<Object>} Estado de verificación
   */
  static async verifyToken() {
    try {
      const response = await fetch(apiUrl('auth/verify'), {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`,
          isValid: false
        };
      }

      return {
        success: true,
        data,
        isValid: data.valid || false
      };
    } catch (error) {
      console.error('Error verificando token:', error);
      return {
        success: false,
        error: error.message,
        isValid: false
      };
    }
  }

  /**
   * Cerrar sesión
   * @returns {Promise<Object>} Resultado del logout
   */
  static async logout() {
    try {
      const response = await fetch(apiUrl('auth/logout'), {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include'
      });

      // Limpiar almacenamiento local independientemente del resultado
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.clear();

      if (response.ok) {
        return {
          success: true,
          message: 'Sesión cerrada exitosamente'
        };
      }

      return {
        success: true, // Consideramos éxito incluso si falla la petición
        message: 'Sesión cerrada localmente'
      };
    } catch (error) {
      console.error('Error en logout:', error);
      
      // Limpiar almacenamiento local incluso si hay error
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.clear();

      return {
        success: true,
        message: 'Sesión cerrada localmente'
      };
    }
  }

  /**
   * Obtener perfil del usuario actual
   * @returns {Promise<Object>} Perfil del usuario
   */
  static async getProfile() {
    try {
      const response = await fetch(apiUrl('auth/profile'), {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data,
        profile: data.user || data
      };
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return {
        success: false,
        error: error.message || 'Error obteniendo perfil'
      };
    }
  }

  /**
   * Actualizar perfil del usuario
   * @param {Object} profileData - Datos del perfil a actualizar
   * @returns {Promise<Object>} Perfil actualizado
   */
  static async updateProfile(profileData) {
    try {
      const response = await fetch(apiUrl('auth/profile'), {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`
        };
      }

      // Actualizar datos en localStorage si es necesario
      if (data.user) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...storedUser,
          profile: { ...storedUser.profile, ...data.user }
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return {
        success: true,
        data,
        message: data.message || 'Perfil actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return {
        success: false,
        error: error.message || 'Error actualizando perfil'
      };
    }
  }

  /**
   * Cambiar contraseña
   * @param {Object} passwordData - Contraseñas actual y nueva
   * @returns {Promise<Object>} Resultado del cambio
   */
  static async changePassword(passwordData) {
    try {
      const response = await fetch(apiUrl('auth/change-password'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(passwordData),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data,
        message: data.message || 'Contraseña cambiada exitosamente'
      };
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      return {
        success: false,
        error: error.message || 'Error cambiando contraseña'
      };
    }
  }

  /**
   * Solicitar restablecimiento de contraseña
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>} Resultado de la solicitud
   */
  static async forgotPassword(email) {
    try {
      const response = await fetch(apiUrl('auth/forgot-password'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data,
        message: data.message || 'Correo de recuperación enviado'
      };
    } catch (error) {
      console.error('Error solicitando recuperación:', error);
      return {
        success: false,
        error: error.message || 'Error en la solicitud'
      };
    }
  }

  /**
   * Restablecer contraseña con token
   * @param {Object} resetData - Datos para restablecer contraseña
   * @returns {Promise<Object>} Resultado del restablecimiento
   */
  static async resetPassword(resetData) {
    try {
      const response = await fetch(apiUrl('auth/reset-password'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(resetData)
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data,
        message: data.message || 'Contraseña restablecida exitosamente'
      };
    } catch (error) {
      console.error('Error restableciendo contraseña:', error);
      return {
        success: false,
        error: error.message || 'Error restableciendo contraseña'
      };
    }
  }

  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean} Estado de autenticación
   */
  static isAuthenticated() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    return !!(user && (token || JSON.parse(user || '{}').token));
  }

  /**
   * Obtener datos del usuario actual
   * @returns {Object|null} Datos del usuario
   */
  static getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parseando datos del usuario:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Obtener token del usuario actual
   * @returns {string|null} Token JWT
   */
  static getToken() {
    const token = localStorage.getItem('token');
    if (token) return token;
    
    const user = this.getCurrentUser();
    return user ? user.token : null;
  }

  /**
   * Verificar rol del usuario
   * @param {string|Array} requiredRole - Rol o roles requeridos
   * @returns {boolean} Si tiene permiso
   */
  static hasRole(requiredRole) {
    const user = this.getCurrentUser();
    if (!user) return false;

    const userRole = user.tipo;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    
    return userRole === requiredRole;
  }

  /**
   * Verificar permisos del usuario
   * @param {Array|string} requiredRoles - Roles o permisos requeridos
   * @returns {boolean} Si tiene permiso
   */
  static hasPermission(requiredRoles) {
    return this.hasRole(requiredRoles);
  }
}

export default AuthService;