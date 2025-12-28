// src/components/layout/DashboardLayout.jsx
import React from "react"
import { Outlet, Navigate } from "react-router-dom"
import { useAuthContext } from "../../context/AuthContext"
import "./DashboardLayout.module.css"

export default function DashboardLayout() {
  const { user, loading } = useAuthContext()

  // Mientras resolvemos (p.ej. comprobando localStorage / cargando perfil), mostramos loader
  if (loading) {
    return (
      <div className="dashboard-layout">
        <div style={{ padding: 24 }}>Cargando sesión...</div>
      </div>
    )
  }

  // Si no hay usuario autenticado, redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Usuario presente -> renderizamos el layout y las rutas hijas
  return (
    <div className="dashboard-layout">
      {/* Aquí puedes mantener tu sidebar / header */}
      <Outlet />
    </div>
  )
}
