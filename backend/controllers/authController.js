// backend/controllers/authController.js
import bcrypt from "bcrypt"
import * as userModel from "../models/userModel.js"
import pool from "../db/pool.js"
import jwt from "jsonwebtoken"
export const registerUser = async (req, res) => {
  try {
    const {
      email,
      password,
      tipo_usuario,
      nombre_usuario,
      nombre,
      apellido,
      genero,
      telefono,
      ci
    } = req.body

    // Validaciones básicas
    if (
      !email ||
      !password ||
      !tipo_usuario ||
      !nombre_usuario ||
      !nombre ||
      !apellido ||
      !genero ||
      !telefono ||
      !ci
    ) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" })
    }

    // Regla: pacientes sólo si ya existen en la tabla paciente
    if (tipo_usuario === "paciente") {
      const existePaciente = await userModel.checkPacienteByCI(ci)
      if (!existePaciente) {
        return res.status(400).json({
          error:
            "No se puede registrar como paciente: el paciente no está pre-registrado. Debe ser agregado primero por un médico."
        })
      }
    }

    const password_hash = await bcrypt.hash(password, 10)
    const fecha_actual = new Date()

    const userData = {
      email,
      password_hash,
      tipo_usuario,
      fecha_registro: fecha_actual,
      ultimo_login: fecha_actual,
      esta_activo: true,
      nombre_usuario,
      nombre,
      apellido,
      genero,
      telefono,
      ci
    }

    const nuevoUsuario = await userModel.createUserWithRole(userData)

    return res.status(201).json({
      message: "Usuario registrado con éxito",
      usuario: {
        id_usuario: nuevoUsuario.id_usuario,
        email: nuevoUsuario.email,
        nombre_usuario: nuevoUsuario.nombre_usuario
      }
    })
  } catch (err) {
    console.error("Error registerUser:", err)

    // Manejo de unicidad (email / nombre_usuario)
    if (err.code === "23505") {
      const detail = err.detail || ""
      if (detail.includes("email"))
        return res.status(409).json({ error: "El email ya está registrado" })
      if (detail.includes("nombre_usuario"))
        return res
          .status(409)
          .json({ error: "El nombre de usuario ya está en uso" })
      return res.status(409).json({ error: "Valor duplicado" })
    }

    // Error custom de persona ya asociada: lo lanzamos desde el modelo con code = 'PERSONA_ASOCIADA'
    if (err.code === "PERSONA_ASOCIADA") {
      return res.status(409).json({
        error: err.message || "La persona ya está asociada a otro usuario"
      })
    }

    return res.status(500).json({ error: "Error en el servidor" })
  }
}

export const loginUser = async (req, res) => {
  try {
    const { email, nombre_usuario, password } = req.body

    if ((!email && !nombre_usuario) || !password) {
      return res.status(400).json({ error: "Faltan credenciales" })
    }

    // Buscar usuario
    const q = await pool.query(
      `SELECT id_usuario, email, password_hash, tipo_usuario, 
              nombre_usuario, esta_activo
       FROM usuario
       WHERE (email = $1 OR nombre_usuario = $2) AND esta_activo = true
       LIMIT 1`,
      [email || "", nombre_usuario || ""]
    )

    if (q.rowCount === 0) {
      return res.status(401).json({ error: "Credenciales inválidas o usuario inactivo" })
    }

    const user = q.rows[0]

    // Verificar contraseña
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return res.status(401).json({ error: "Credenciales inválidas" })
    }

    // Generar JWT
    const payload = {
      id_usuario: user.id_usuario,
      nombre_usuario: user.nombre_usuario,
      tipo_usuario: user.tipo_usuario,
      email: user.email,
    }

   const token = jwt.sign(payload, process.env.JWT_SECRET || "dev_secret", { 
  expiresIn: "24h" 
});

       const isProduction = process.env.NODE_ENV === 'production';
    
    // OPCIÓN 1: Para desarrollo local (localhost:5173 -> localhost:4000)
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: false, // ← CAMBIA A false para desarrollo
      sameSite: 'lax', // ← CAMBIA a 'lax' para desarrollo
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
      domain: 'localhost' // ← OPCIONAL pero ayuda
    });

    // Actualizar último login
    await pool.query(
      "UPDATE usuario SET ultimo_login = NOW() WHERE id_usuario = $1",
      [user.id_usuario]
    )

    // ✅ Devolver datos del usuario pero NO el token en el body
    return res.json({
      message: "Login correcto",
      user: {
        id_usuario: user.id_usuario,
        email: user.email,
        tipo_usuario: user.tipo_usuario,
        nombre_usuario: user.nombre_usuario,
        esta_activo: user.esta_activo
      }

    })

  } catch (err) {
    console.error("Error loginUser:", err)
    return res.status(500).json({ error: "Error en el servidor" })
  }
}

export const logoutUser = async (req, res) => {
  try {

   const isProduction = process.env.NODE_ENV === 'production';
    
    res.clearCookie('auth_token', {
      path: '/',
      httpOnly: true,
      secure: false, // ← Igual que en login
      sameSite: 'lax',
      domain: 'localhost'
    });
    return res.json({
      message: "Logout exitoso",
      success: true
    })

  } catch (err) {
    console.error("Error logoutUser:", err)
    return res.status(500).json({ error: "Error en el servidor" })
  }
}