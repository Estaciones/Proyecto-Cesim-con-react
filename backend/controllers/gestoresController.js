import pool from "../db/pool.js"

/* ---------- GESTORES ---------- */
export const getGestores = async (req, res) => {
  try {
    const q = await pool.query(
      `SELECT g.id_gestor, g.ci, per.nombre, per.apellido, g.capacidad_maxima
       FROM gestor_casos g
       LEFT JOIN persona per ON g.ci = per.ci`
    )
    return res.json(q.rows)
  } catch (err) {
    console.error("getGestores", err)
    return res.status(500).json({ error: "Error en servidor" })
  }
}

export const getGestorById = async (req, res) => {
  try {
    const { id } = req.params
    const q = await pool.query(
      `SELECT g.id_gestor, g.ci, g.capacidad_maxima, per.nombre, per.apellido, per.telefono, per.genero
       FROM gestor_casos g
       LEFT JOIN persona per ON g.ci = per.ci
       WHERE g.id_gestor = $1 LIMIT 1`,
      [id]
    )

    if (q.rowCount === 0)
      return res.status(404).json({ error: "Gestor no encontrado" })

    return res.json(q.rows[0])
  } catch (err) {
    console.error("getGestorById", err)
    return res.status(500).json({ error: "Error en servidor" })
  }
}

export const createGestor = async (req, res) => {
  const client = await pool.connect()
  try {
    const { ci, nombre, apellido, genero, telefono, capacidad_maxima } =
      req.body

    if (!ci || !nombre || !apellido || !capacidad_maxima) {
      return res.status(400).json({
        error:
          "Faltan datos obligatorios: ci, nombre, apellido, capacidad_maxima"
      })
    }

    // Verificar si ya existe gestor con ese CI
    const existsGestor = await client.query(
      "SELECT id_gestor FROM gestor_casos WHERE ci = $1 LIMIT 1",
      [ci]
    )
    if (existsGestor.rowCount > 0) {
      return res.status(409).json({ error: "Ya existe un gestor con ese CI" })
    }

    await client.query("BEGIN")

    try {
      // Persona: actualizar o insertar
      const personaQ = await client.query(
        "SELECT ci FROM persona WHERE ci = $1 FOR UPDATE",
        [ci]
      )

      if (personaQ.rowCount > 0) {
        await client.query(
          `UPDATE persona SET nombre=$1, apellido=$2, genero=$3, telefono=$4 WHERE ci=$5`,
          [nombre, apellido, genero || null, telefono || null, ci]
        )
      } else {
        await client.query(
          `INSERT INTO persona (ci, nombre, apellido, genero, telefono, id_usuario) 
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [ci, nombre, apellido, genero || null, telefono || null, null]
        )
      }

      // Insertar en gestor_casos
      const insertGestor = await client.query(
        `INSERT INTO gestor_casos (ci, capacidad_maxima) 
         VALUES ($1, $2) RETURNING id_gestor`,
        [ci, capacidad_maxima]
      )

      await client.query("COMMIT")
      return res.status(201).json({
        ok: true,
        id_gestor: insertGestor.rows[0].id_gestor
      })
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    }
  } catch (err) {
    console.error("createGestor", err)
    if (err.code === "23505") {
      return res.status(409).json({ error: "Registro duplicado" })
    }
    return res.status(500).json({ error: "Error en servidor" })
  } finally {
    client.release()
  }
}

export const updateGestor = async (req, res) => {
  const client = await pool.connect()
  try {
    const { id } = req.params
    const { capacidad_maxima } = req.body

    if (capacidad_maxima === undefined) {
      return res.status(400).json({ error: "No hay datos para actualizar" })
    }

    // Verificar existencia
    const gestorCheck = await client.query(
      "SELECT id_gestor FROM gestor_casos WHERE id_gestor = $1",
      [id]
    )
    if (gestorCheck.rowCount === 0) {
      return res.status(404).json({ error: "Gestor no encontrado" })
    }

    await client.query("BEGIN")

    try {
      const update = await client.query(
        `UPDATE gestor_casos SET capacidad_maxima = $1 
         WHERE id_gestor = $2 RETURNING id_gestor`,
        [capacidad_maxima, id]
      )

      if (update.rowCount === 0) {
        await client.query("ROLLBACK")
        return res.status(404).json({ error: "Gestor no encontrado" })
      }

      await client.query("COMMIT")
      return res.json({ ok: true, id_gestor: id })
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    }
  } catch (err) {
    console.error("updateGestor", err)
    return res.status(500).json({ error: "Error en servidor" })
  } finally {
    client.release()
  }
}

export const deleteGestor = async (req, res) => {
  const client = await pool.connect()
  try {
    const { id } = req.params

    // Verificar existencia
    const gestorCheck = await client.query(
      "SELECT id_gestor FROM gestor_casos WHERE id_gestor = $1",
      [id]
    )
    if (gestorCheck.rowCount === 0) {
      return res.status(404).json({ error: "Gestor no encontrado" })
    }

    await client.query("BEGIN")

    try {
      // Eliminar asignaciones primero
      await client.query(
        "DELETE FROM gestor_casos_paciente WHERE id_gestor = $1",
        [id]
      )

      // Eliminar gestor
      await client.query("DELETE FROM gestor_casos WHERE id_gestor = $1", [id])

      await client.query("COMMIT")
      return res.json({ ok: true, id_gestor: id })
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    }
  } catch (err) {
    console.error("deleteGestor", err)
    if (err.code === "23503") {
      return res.status(409).json({
        error: "No se puede eliminar porque tiene registros relacionados"
      })
    }
    return res.status(500).json({ error: "Error en servidor" })
  } finally {
    client.release()
  }
}

/* ---------- ASIGNAR GESTOR ---------- */
export const postAsignarGestor = async (req, res) => {
  const client = await pool.connect()
  try {
    const { id_gestor, id_paciente } = req.body
    if (!id_gestor || !id_paciente)
      return res.status(400).json({ error: "Faltan datos" })

    // Verificaciones antes de BEGIN
    const pacienteCheck = await client.query(
      "SELECT ci FROM paciente WHERE id_paciente = $1 LIMIT 1",
      [id_paciente]
    )
    if (pacienteCheck.rowCount === 0)
      return res.status(404).json({ error: "Paciente no encontrado" })

    const paciente_ci = pacienteCheck.rows[0].ci

    const gestorCheck = await client.query(
      "SELECT ci FROM gestor_casos WHERE id_gestor = $1 LIMIT 1",
      [id_gestor]
    )
    if (gestorCheck.rowCount === 0) {
      return res.status(404).json({ error: "Gestor no encontrado" })
    }
    const gestor_ci = gestorCheck.rows[0].ci

    // Verificar si ya está asignado
    const exists = await client.query(
      `SELECT 1 FROM gestor_casos_paciente 
       WHERE id_gestor = $1 AND id_paciente = $2 LIMIT 1`,
      [id_gestor, id_paciente]
    )
    if (exists.rowCount > 0) {
      return res.status(409).json({ error: "Ya asignado" })
    }

    await client.query("BEGIN")

    try {
      // Insertar asignación
      const fecha = new Date()
      await client.query(
        `INSERT INTO gestor_casos_paciente (id_gestor, gestor_casos_ci, id_paciente, paciente_ci, fecha_asignacion)
         VALUES ($1,$2,$3,$4,$5)`,
        [id_gestor, gestor_ci, id_paciente, paciente_ci, fecha]
      )

      await client.query("COMMIT")
      return res.status(201).json({ ok: true })
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    }
  } catch (err) {
    console.error("postAsignarGestor", err)
    return res.status(500).json({ error: "Error en servidor" })
  } finally {
    client.release()
  }
}

export const deleteAsignacionGestor = async (req, res) => {
  const client = await pool.connect()
  try {
    const { id_gestor, id_paciente } = req.body
    if (!id_gestor || !id_paciente)
      return res.status(400).json({ error: "Faltan datos" })

    // Verificar si la asignación existe
    const asignacionCheck = await client.query(
      `SELECT 1 FROM gestor_casos_paciente 
       WHERE id_gestor = $1 AND id_paciente = $2 LIMIT 1`,
      [id_gestor, id_paciente]
    )
    if (asignacionCheck.rowCount === 0) {
      return res.status(404).json({ error: "Asignación no encontrada" })
    }

    await client.query("BEGIN")

    try {
      // Eliminar asignación
      await client.query(
        `DELETE FROM gestor_casos_paciente 
         WHERE id_gestor = $1 AND id_paciente = $2`,
        [id_gestor, id_paciente]
      )

      await client.query("COMMIT")
      return res.json({ ok: true })
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    }
  } catch (err) {
    console.error("deleteAsignacionGestor", err)
    return res.status(500).json({ error: "Error en servidor" })
  } finally {
    client.release()
  }
}
