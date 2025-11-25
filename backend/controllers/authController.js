// backend/controllers/authController.js
import bcrypt from "bcrypt"
import * as userModel from "../models/userModel.js"
import pool from "../db/pool.js"

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
      return res
        .status(409)
        .json({
          error: err.message || "La persona ya está asociada a otro usuario"
        })
    }

    return res.status(500).json({ error: "Error en el servidor" })
  }
}

export const loginUser = async (req, res) => {
  try {
    // Recibimos tanto email como nombre_usuario (frontend envía ambos)
    const { email, nombre_usuario, password } = req.body

    if ((!email && !nombre_usuario) || !password) {
      return res.status(400).json({ error: "Faltan credenciales" })
    }

    // buscamos por email o nombre_usuario
    const q = await pool.query(
      `SELECT id_usuario, email, password_hash, tipo_usuario, nombre_usuario
       FROM usuario
       WHERE email = $1 OR nombre_usuario = $2
       LIMIT 1`,
      [email || "", nombre_usuario || ""]
    )

    if (q.rowCount === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" })
    }

    const user = q.rows[0]

    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return res.status(401).json({ error: "Credenciales inválidas" })
    }

    // Si llegamos aquí, autenticación correcta.
    // Por ahora devolvemos datos básicos del usuario.
    // En el futuro puedes generar JWT y setear cookie httpOnly.
    return res.json({
      message: "Login correcto",
      user: {
        id_usuario: user.id_usuario,
        email: user.email,
        tipo_usuario: user.tipo_usuario,
        nombre_usuario: user.nombre_usuario
      }
    })
  } catch (err) {
    console.error("Error loginUser:", err)
    return res.status(500).json({ error: "Error en el servidor" })
  }
}