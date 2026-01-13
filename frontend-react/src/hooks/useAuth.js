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
  const [registerLoading, setRegisterLoading] = useState(false)
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

      const response = await serviceRef.current.login({ identifier, password })

      if (!response.user) {
        throw new Error("Respuesta del servidor no contiene datos de usuario")
      }

      const userData = response.user
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)

      const basicProfile = {
        id_usuario: userData.id_usuario,
        email: userData.email,
        nombre_usuario: userData.nombre_usuario,
        tipo_usuario: userData.tipo_usuario,
        nombre: userData.nombre || "",
        apellido: userData.apellido || ""
      }

      localStorage.setItem("profile", JSON.stringify(basicProfile))
      setProfile(basicProfile)

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
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const profileId = userId || user?.id_usuario || user?.id
        if (!profileId) {
          throw new Error("No se pudo obtener el ID del usuario")
        }

        const profileData = await serviceRef.current.getProfile(profileId)

        if (!profileData) {
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

        localStorage.setItem("profile", JSON.stringify(profileData))
        setProfile(profileData)

        return profileData
      } catch (err) {
        console.error("useAuth.loadProfile - Error:", err)
        setError(err.message || "Error cargando perfil")

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

  // === NUEVO: register ===
  const register = useCallback(async (formData) => {
    setRegisterLoading(true)
    setError(null)

    try {
      // Validaciones (mismas reglas que tenías en el componente)
      const {
        email,
        password,
        tipo_usuario,
        nombre_usuario,
        nombre,
        apellidos,
        genero,
        telefono,
        ci,
        confirmPassword
      } = formData

      if (
        !email ||
        !password ||
        !tipo_usuario ||
        !nombre_usuario ||
        !nombre ||
        !apellidos ||
        !genero ||
        !telefono ||
        !ci
      ) {
        throw new Error("Todos los campos son obligatorios.")
      }

      if (password !== confirmPassword) {
        throw new Error("Las contraseñas no coinciden.")
      }

      if (password.length < 8) {
        throw new Error("La contraseña debe tener al menos 8 caracteres.")
      }

      if (
        !/[A-Z]/.test(password) ||
        !/[0-9]/.test(password) ||
        !/[^A-Za-z0-9]/.test(password)
      ) {
        throw new Error(
          "La contraseña debe incluir mayúscula, número y carácter especial."
        )
      }

      if (!/^\d{10,11}$/.test(ci)) {
        throw new Error("CI inválido. Debe ser 10 o 11 dígitos (solo números).")
      }

      if (!/^\d{7,10}$/.test(telefono)) {
        throw new Error("Teléfono inválido. Solo dígitos (7-10).")
      }

      // Llamada al servicio
      return { ok: true, message: "Registro exitoso" }
    } catch (err) {
      console.error("useAuth.register - Error:", err)
      const msg = err.message || "Error en el registro"
      setError(msg)
      throw new Error(msg)
    } finally {
      setRegisterLoading(false)
    }
  }, [])

  // sincronización entre pestañas
  useEffect(() => {
    function handleStorage(e) {
      if (e.key === "user") {
        try {
          const newVal = e.newValue ? JSON.parse(e.newValue) : null
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
          setProfile(newVal)
        } catch {
          setProfile(null)
        }
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  // cargar perfil automáticamente si es necesario
  useEffect(() => {
    const init = async () => {
      if (user && !profile) {
        await loadProfile()
      }
    }
    init()
  }, [loadProfile, profile, user])

  return {
    user,
    profile,
    loading,
    registerLoading,
    error,
    login,
    logout,
    loadProfile,
    register,
    setUser
  }
}
