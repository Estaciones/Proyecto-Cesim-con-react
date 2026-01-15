// src/components/common/ProtectedRoute.jsx - VERSIÓN MEJORADA
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { AuthService } from '../../services/authService'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, logout } = useAuthContext()
  const [isVerifying, setIsVerifying] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [redirectToLogin, setRedirectToLogin] = useState(false)

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Si NO hay usuario en localStorage, redirigir inmediatamente
        if (!user) {
          console.log('🔄 ProtectedRoute: No hay usuario en localStorage')
          setRedirectToLogin(true)
          return
        }

        // Verificar con backend
        console.log('🔄 ProtectedRoute: Verificando token con backend...')
        await AuthService.verify()
        setIsValid(true)
        
        // Verificar rol si es necesario
        if (requiredRole && user.tipo_usuario !== requiredRole) {
          console.log(`❌ ProtectedRoute: Rol incorrecto. Requerido: ${requiredRole}, tiene: ${user.tipo_usuario}`)
          // Podrías redirigir a una página de "acceso denegado"
        }
      } catch (error) {
        console.log('❌ ProtectedRoute: Error en verificación:', error.message)
        setIsValid(false)
        
        // Si es error 401, hacer logout
        if (error.message.includes('401') || 
            error.message.includes('Acceso denegado') ||
            error.message.includes('No autenticado')) {
          logout()
        }
        
        setRedirectToLogin(true)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [user, logout, requiredRole])

  // Mostrar loading mientras verifica
  if (isVerifying) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div>🔐 Verificando autenticación...</div>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>
          Comprobando credenciales...
        </div>
      </div>
    )
  }

  // Redirigir a login si no es válido
  if (redirectToLogin || !isValid) {
    console.log('🔄 ProtectedRoute: Redirigiendo a /login')
    return <Navigate to="/login" replace />
  }

  // Todo OK, renderizar children
  return children
}