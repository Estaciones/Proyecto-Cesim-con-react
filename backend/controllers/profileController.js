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

    const q = await pool.query(
      `SELECT u.id_usuario, u.email, u.tipo_usuario, u.nombre_usuario,
              p.ci, p.nombre as persona_nombre, p.apellido, p.telefono
       FROM usuario u
       LEFT JOIN persona p ON p.id_usuario = u.id_usuario
       WHERE u.id_usuario = $1
       LIMIT 1`,
      [id]
    )

    if (q.rowCount === 0)
      return res.status(404).json({ error: "Usuario no encontrado" })

    const row = q.rows[0]
    return res.json({
      id_usuario: row.id_usuario,
      email: row.email,
      tipo_usuario: row.tipo_usuario,
      nombre_usuario: row.nombre_usuario,
      ci: row.ci,
      nombre: row.persona_nombre,
      apellido: row.apellido,
      telefono: row.telefono
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
