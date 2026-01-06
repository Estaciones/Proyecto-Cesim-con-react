// src/App.jsx - Versión Simplificada
import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

// Providers
import { AuthProvider } from "./context/AuthContext"
import { ModalProvider } from "./context/ModalProvider"

// Layouts
import AuthLayout from "./components/layout/AuthLayout"
import DashboardLayout from "./components/layout/DashboardLayout"

// Páginas de autenticación
import Login from "./components/auth/Login/Login"
import Register from "./components/auth/Register/Register"

// Dashboard
import Dashboard from "./components/dashboard/Dashboard"

// Importar estilos globales
import "./styles/index.css"
import "./styles/variables.css"
import "./styles/reset.css"
import "./styles/utilities.css"
import Modal from "./components/modals/Modal/Modal"

function App() {
  return (
    <ModalProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas públicas (autenticación) */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Route>

            {/* Rutas protegidas (dashboard) */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* Redirección para rutas no definidas */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ModalProvider>
  )
}

export default App
