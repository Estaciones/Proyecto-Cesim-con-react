// src/hooks/useAuth.js
import { useState, useCallback, useEffect } from "react"
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

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async (credentials = {}) => {
    setLoading(true)
    try {
      // Aceptar { identifier, password } como contrato frontal
      const identifier = (credentials.identifier ?? "").toString().trim()
      const password = credentials.password

      if (!identifier || !password) {
        throw new Error("Faltan credenciales")
      }

      // Construcción mínima del payload: dejamos que AuthService haga la conversión
      // (pero podríamos decidir aquí también). Pasamos exactamente { identifier, password }
      const data = await AuthService.login({ identifier, password })

      // Extraer el user del response { message, user }
      const userData = data.user

      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
      setError(null)

      return userData
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    AuthService.logout()
    setUser(null)
    setProfile(null)
  }, [])

  const loadProfile = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const userId = user.id_usuario ?? user.id
      const profileData = await AuthService.getProfile(userId)
      setProfile(profileData)
      setError(null)
    } catch (err) {
      setError(err.message)
      setProfile({
        id_usuario: user.id_usuario ?? user.id,
        email: user.email,
        nombre_usuario: user.nombre_usuario,
        tipo_usuario: user.tipo_usuario ?? user.tipo
      })
    } finally {
      setLoading(false)
    }
  }, [user])

  // Sincronización entre pestañas
  useEffect(() => {
    function handleStorage(e) {
      if (e.key === "user") {
        try {
          const newVal = e.newValue ? JSON.parse(e.newValue) : null
          setUser(newVal)
        } catch {
          setUser(null)
        }
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  return {
    user,
    profile,
    loading,
    error,
    login,
    logout,
    loadProfile,
    setUser
  }
}