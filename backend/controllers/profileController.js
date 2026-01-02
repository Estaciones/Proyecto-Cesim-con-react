// backend/controllers/profileController.js
import pool from "../db/pool.js"

/* ---------- PROFILE ---------- */
export const getProfile = async (req, res) => {
  try {
    // Intenta obtener id a través de query ?id= (útil en pruebas)
    const id = req.query.id
    if (!id) {
      // Sin id: respondemos 204 para que el frontend use localStorage como fallback
      return res.status(204).end()
    }

    /**
     * Objetivo:
     * - Devolver datos del usuario + persona (si existe)
     * - Intentar devolver id_paciente asociado al usuario.
     *   Primero intentamos por pa.id_usuario = u.id_usuario;
     *   si no hay, intentamos encontrar paciente por CI (pa_ci).
     *
     * Esto cubre ambos esquemas: tabla `paciente` que referencia al usuario
     * por id_usuario o por CI en la tabla persona.
     */
    const q = await pool.query(
      `SELECT u.id_usuario,
       u.email,
       u.tipo_usuario,
       u.nombre_usuario,
       p.ci,
       p.nombre AS persona_nombre,
       p.apellido,
       p.telefono,
       pa_ci.id_paciente AS id_paciente
FROM usuario u
LEFT JOIN persona p ON p.id_usuario = u.id_usuario
LEFT JOIN paciente pa_ci ON pa_ci.ci = p.ci
WHERE u.id_usuario = $1
LIMIT 1`,
      [id]
    )

    if (q.rowCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" })
    }

    const row = q.rows[0]
    return res.json({
      id_usuario: row.id_usuario,
      email: row.email,
      tipo_usuario: row.tipo_usuario,
      nombre_usuario: row.nombre_usuario,
      ci: row.ci,
      nombre: row.persona_nombre,
      apellido: row.apellido,
      telefono: row.telefono,
      // id_paciente será null si no existe asociación
      id_paciente: row.id_paciente || null
    })
  } catch (err) {
    console.error("getProfile", err)
    return res.status(500).json({ error: "Error en servidor" })
  }
}

export const updateProfile = async (req, res) => {
  const client = await pool.connect()
  try {
    const id = req.params.id
    const { email, nombre_usuario, nombre, apellido, telefono } = req.body

    // Validar que haya algo para actualizar
    if (!email && !nombre_usuario && !nombre && !apellido && !telefono) {
      return res.status(400).json({ error: "No hay datos para actualizar" })
    }

    await client.query("BEGIN")

    // Verificar si el usuario existe
    const userCheck = await client.query(
      "SELECT id_usuario FROM usuario WHERE id_usuario = $1 FOR UPDATE",
      [id]
    )
    if (userCheck.rowCount === 0) {
      await client.query("ROLLBACK")
      return res.status(404).json({ error: "Usuario no encontrado" })
    }

    // Construir queries dinámicamente
    if (email || nombre_usuario) {
      const sets = []
      const values = []
      let index = 1

      if (email) {
        sets.push(`email = $${index}`)
        values.push(email)
        index++
      }
      if (nombre_usuario) {
        sets.push(`nombre_usuario = $${index}`)
        values.push(nombre_usuario)
        index++
      }

      values.push(id)
      const query = `UPDATE usuario SET ${sets.join(
        ", "
      )} WHERE id_usuario = $${index}`
      await client.query(query, values)
    }

    // Actualizar persona si hay datos
    if (nombre || apellido || telefono) {
      const sets = []
      const values = []
      let index = 1

      if (nombre) {
        sets.push(`nombre = $${index}`)
        values.push(nombre)
        index++
      }
      if (apellido) {
        sets.push(`apellido = $${index}`)
        values.push(apellido)
        index++
      }
      if (telefono) {
        sets.push(`telefono = $${index}`)
        values.push(telefono)
        index++
      }

      values.push(id)
      const query = `UPDATE persona SET ${sets.join(
        ", "
      )} WHERE id_usuario = $${index}`
      await client.query(query, values)
    }

    await client.query("COMMIT")
    return res.json({ ok: true })
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("updateProfile", err)
    return res.status(500).json({ error: "Error en servidor" })
  } finally {
    client.release()
  }
}
