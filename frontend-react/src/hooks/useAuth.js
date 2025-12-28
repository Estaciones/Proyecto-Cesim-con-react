import { useState, useCallback, useEffect, useRef } from "react"
import { AuthService } from "../services/authService"

export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user")
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem("profile")
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const serviceRef = useRef(AuthService)

  const login = useCallback(async (credentials = {}) => {
    setLoading(true)
    setError(null)

    try {
      const identifier = (credentials.identifier ?? "").toString().trim()
      const password = credentials.password

      if (!identifier || !password) {
        throw new Error("Faltan credenciales")
      }

      console.log("useAuth.login - Iniciando login con:", { identifier })

      const response = await serviceRef.current.login({ identifier, password })

      console.log("useAuth.login - Respuesta completa:", response)

      // Verificar estructura de respuesta
      if (!response.user) {
        throw new Error("Respuesta del servidor no contiene datos de usuario")
      }

      const userData = response.user
      console.log("useAuth.login - Datos del usuario:", userData)

      // Guardar user en localStorage
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)

      // Crear perfil básico a partir de los datos del usuario
      // Nota: El login solo devuelve datos básicos, el perfil completo
      // se obtiene luego con getProfile
      const basicProfile = {
        id_usuario: userData.id_usuario,
        email: userData.email,
        nombre_usuario: userData.nombre_usuario,
        tipo_usuario: userData.tipo_usuario,
        // Campos que pueden estar vacíos hasta que se cargue el perfil completo
        nombre: userData.nombre || "",
        apellido: userData.apellido || ""
      }

      // Guardar perfil básico temporalmente
      localStorage.setItem("profile", JSON.stringify(basicProfile))
      setProfile(basicProfile)

      console.log("useAuth.login - Login exitoso, usuario:", userData)

      return { user: userData, profile: basicProfile }
    } catch (err) {
      console.error("useAuth.login - Error:", err)
      setError(err.message || "Error en el login")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    console.log("useAuth.logout - Cerrando sesión")
    serviceRef.current.logout()
    localStorage.removeItem("user")
    localStorage.removeItem("profile")
    localStorage.removeItem("token")
    setUser(null)
    setProfile(null)
    setError(null)
  }, [])

  const loadProfile = useCallback(
    async (userId = null) => {
      if (!user && !userId) {
        console.log(
          "useAuth.loadProfile - No hay usuario, no se puede cargar perfil"
        )
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const profileId = userId || user?.id_usuario || user?.id
        if (!profileId) {
          throw new Error("No se pudo obtener el ID del usuario")
        }

        console.log("useAuth.loadProfile - Cargando perfil para ID:", profileId)

        const profileData = await serviceRef.current.getProfile(profileId)
        console.log("useAuth.loadProfile - Datos recibidos:", profileData)

        if (!profileData) {
          console.warn(
            "useAuth.loadProfile - Perfil vacío, usando datos básicos del usuario"
          )
          // Si no hay perfil, mantener los datos básicos del login
          return (
            profile || {
              id_usuario: user.id_usuario,
              email: user.email,
              nombre_usuario: user.nombre_usuario,
              tipo_usuario: user.tipo_usuario,
              nombre: user.nombre || "",
              apellido: user.apellido || ""
            }
          )
        }

        // Guardar perfil en localStorage
        localStorage.setItem("profile", JSON.stringify(profileData))
        setProfile(profileData)

        return profileData
      } catch (err) {
        console.error("useAuth.loadProfile - Error:", err)
        setError(err.message || "Error cargando perfil")

        // Si falla la carga del perfil, mantener los datos básicos del usuario
        if (user) {
          const basicProfile = {
            id_usuario: user.id_usuario,
            email: user.email,
            nombre_usuario: user.nombre_usuario,
            tipo_usuario: user.tipo_usuario,
            nombre: user.nombre || "",
            apellido: user.apellido || ""
          }
          localStorage.setItem("profile", JSON.stringify(basicProfile))
          setProfile(basicProfile)
          return basicProfile
        }

        return null
      } finally {
        setLoading(false)
      }
    },
    [user, profile]
  )

  // Sincronización entre pestañas
  useEffect(() => {
    function handleStorage(e) {
      console.log("useAuth - Evento storage:", e.key)
      if (e.key === "user") {
        try {
          const newVal = e.newValue ? JSON.parse(e.newValue) : null
          console.log("useAuth - Nuevo valor user:", newVal)
          setUser(newVal)
          if (!newVal) {
            localStorage.removeItem("profile")
            setProfile(null)
          }
        } catch {
          setUser(null)
          setProfile(null)
        }
      }
      if (e.key === "profile") {
        try {
          const newVal = e.newValue ? JSON.parse(e.newValue) : null
          console.log("useAuth - Nuevo valor profile:", newVal)
          setProfile(newVal)
        } catch {
          setProfile(null)
        }
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  // Cargar perfil automáticamente al montar si hay usuario
  useEffect(() => {
    const init = async () => {
      if (user && !profile) {
        console.log("useAuth - Usuario sin perfil, cargando...")
        await loadProfile()
      } else if (user && profile) {
        console.log("useAuth - Usuario ya tiene perfil:", profile)
      }
    }

    init()
  }, [loadProfile, profile, user]) // Solo ejecutar al montar

  return {
    user,
    profile,
    loading,
    error,
    login,
    logout,
    loadProfile
  }
}
