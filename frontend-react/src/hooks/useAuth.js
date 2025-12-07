import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"

/**
 * Hook personalizado para manejar la autenticación
 * @returns {Object} Estado y funciones de autenticación
 */
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const API_URL = "http://localhost:3000/api"

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true)
      const storedUser = localStorage.getItem("user")

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)

        // Verificar token en el servidor (si es necesario)
        const response = await fetch(`${API_URL}/auth/verify`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${parsedUser.token}`,
            "Content-Type": "application/json"
          }
        })

        if (response.ok) {
          setUser(parsedUser)
        } else {
          // Token inválido, limpiar sesión
          localStorage.removeItem("user")
          setUser(null)
        }
      }
    } catch (error) {
      console.error("Error verificando autenticación:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [API_URL])
  // Verificar autenticación al cargar
  
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  /**
   * Verifica si hay una sesión activa
   */

  /**
   * Iniciar sesión
   * @param {Object} credentials - Credenciales del usuario
   * @param {string} credentials.email - Email del usuario
   * @param {string} credentials.password - Contraseña
   */
  const login = async (credentials) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: credentials.email,
          nombre_usuario: credentials.email,
          password: credentials.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar sesión")
      }

      if (data.message === "Login correcto") {
        const userData = {
          id: data.user.id_usuario,
          email: data.user.email,
          tipo: data.user.tipo_usuario,
          nombre_usuario: data.user.nombre_usuario,
          token: data.token,
          profile: data.user
        }

        localStorage.setItem("user", JSON.stringify(userData))
        setUser(userData)

        return { success: true, user: userData }
      } else {
        throw new Error(data.error || "Error en la autenticación")
      }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Registrar nuevo usuario
   * @param {Object} userData - Datos del usuario
   */
  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al registrar usuario")
      }

      return { success: true, data }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cerrar sesión
   */
  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
    setError(null)
    navigate("/login")
  }

  /**
   * Actualizar perfil del usuario
   * @param {Object} profileData - Datos del perfil a actualizar
   */
  const updateProfile = async (profileData) => {
    try {
      setLoading(true)
      setError(null)

      const storedUser = JSON.parse(localStorage.getItem("user"))

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${storedUser.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar perfil")
      }

      // Actualizar usuario en localStorage
      const updatedUser = {
        ...storedUser,
        profile: { ...storedUser.profile, ...data.user }
      }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)

      return { success: true, user: updatedUser }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cambiar contraseña
   * @param {Object} passwords - Contraseñas actual y nueva
   */
  const changePassword = async (passwords) => {
    try {
      setLoading(true)
      setError(null)

      const storedUser = JSON.parse(localStorage.getItem("user"))

      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${storedUser.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(passwords)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al cambiar contraseña")
      }

      return { success: true, message: data.message }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Verificar permisos del usuario
   * @param {Array|string} requiredRoles - Roles o permisos requeridos
   */
  const hasPermission = (requiredRoles) => {
    if (!user) return false

    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.tipo)
    }

    return user.tipo === requiredRoles
  }

  /**
   * Obtener token de autenticación
   */
  const getToken = () => {
    const storedUser = localStorage.getItem("user")
    return storedUser ? JSON.parse(storedUser).token : null
  }

  return {
    // Estado
    user,
    loading,
    error,
    isAuthenticated: !!user,

    // Funciones
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    checkAuth,
    hasPermission,
    getToken,

    // Setters
    setError
  }
}

export default useAuth
