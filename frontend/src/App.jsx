// src/App.jsx - Versión Simplificada
import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

// Providers
import { AuthProvider } from "./context/AuthContext"
import { ModalProvider } from "./context/ModalProvider"

// Páginas de autenticación
import Login from "./components/auth/Login/Login"
import Register from "./components/auth/Register/Register"

// Dashboard
import Dashboard from "./components/dashboard/Dashboard"

// Componente para rutas protegidas
import ProtectedRoute from "./components/auth/ProtectedRoute/ProtectedRoute"

function App() {
  return (
    <ModalProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas públicas (autenticación) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Ruta del dashboard (protegida) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Redirecciones */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ModalProvider>
  )
}

export default App