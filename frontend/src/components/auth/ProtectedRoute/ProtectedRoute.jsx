// src/components/auth/ProtectedRoute/ProtectedRoute.jsx
import React from "react"
import { Navigate } from "react-router-dom"
import { useAuthContext } from "../../../context/AuthContext"

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
        color: 'white'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          borderTopColor: 'white',
          animation: 'spin 1s ease-in-out infinite',
          marginBottom: '1.5rem'
        }}></div>
        <p>Cargando sesión...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}