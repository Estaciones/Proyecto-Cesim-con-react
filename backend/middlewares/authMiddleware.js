// backend/middlewares/authMiddleware.js
import jwt from "jsonwebtoken"

export const verifyToken = (req, res, next) => {
  try {
    // 1. Obtener token de las cookies
    const token = req.cookies?.auth_token
    
    if (!token) {
      console.log('❌ Middleware: No hay token en cookies')
      return res.status(401).json({ 
        error: "Acceso denegado. No autenticado." 
      })
    }

    // 2. Verificar token
    const verified = jwt.verify(token, process.env.JWT_SECRET || "dev_secret")
    
    // 3. Agregar datos del usuario al request
    req.user = verified
    console.log('✅ Middleware: Token válido para usuario:', verified.email)
    
    next() // Continuar con el controlador
    
  } catch (err) {
    console.error('❌ Middleware Error:', err.message)
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: "Token expirado. Por favor, inicie sesión nuevamente." 
      })
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: "Token inválido." 
      })
    }
    
    return res.status(500).json({ 
      error: "Error en la verificación de autenticación." 
    })
  }
}

// Middleware opcional para verificar roles
export const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" })
    }
    
    const userRole = req.user.tipo_usuario
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: `Acceso denegado. Rol requerido: ${allowedRoles.join(", ")}` 
      })
    }
    
    next()
  }
}