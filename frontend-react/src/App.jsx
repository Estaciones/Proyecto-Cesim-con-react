// App.jsx corregido
import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { DashboardProvider } from "./context/DashboardProvider"

// Layouts
import AuthLayout from "./components/layout/AuthLayout"
import DashboardLayout from "./components/layout/DashboardLayout"

// Páginas de autenticación
import Login from "./components/auth/Login/Login"
import Register from "./components/auth/Register/Register"

// Secciones del dashboard
import Dashboard from "./components/auth/dashboard/Dashboard"

// Importar estilos globales
import "./styles/index.css"
import "./styles/variables.css"
import "./styles/reset.css"
import "./styles/utilities.css"

function App() {
  return (
    <DashboardProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas (autenticación) */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Route>

          {/* Rutas protegidas (dashboard) */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            {/* Removemos las rutas específicas, ahora Dashboard maneja las secciones internamente */}
          </Route>

          {/* Redirección para rutas no definidas */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </DashboardProvider>
  )
}

export default App
