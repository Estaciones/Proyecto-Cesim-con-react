import React, { createContext, useContext, useMemo } from "react"
import { useAuth } from "../hooks/useAuth"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const auth = useAuth()

  // CORRECCIÓN: Memoizar el valor del contexto con todas las dependencias
  const contextValue = useMemo(
    () => ({
      user: auth.user,
      profile: auth.profile,
      loading: auth.loading,
      error: auth.error,
      login: auth.login,
      logout: auth.logout,
      loadProfile: auth.loadProfile,
      setUser: auth.setUser
    }),
    [
      auth.user,
      auth.profile,
      auth.loading,
      auth.error,
      auth.login,
      auth.logout,
      auth.loadProfile,
      auth.setUser
    ]
  )

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthContext debe usarse dentro de AuthProvider")
  }
  return context
}
