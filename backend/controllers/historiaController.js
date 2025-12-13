import pool from "../db/pool.js"

/* ---------- HISTORIA CLINICA ---------- */
export const getHistoria = async (req, res) => {
  try {
    const { id_paciente, ci } = req.query
    let q
    if (id_paciente) {
      q = await pool.query(
        `SELECT id_registro, titulo, descripcion, fecha_creacion, fecha_actualizacion, id_paciente, ci
         FROM historia_clinica WHERE id_paciente = $1 ORDER BY fecha_creacion DESC`,
        [id_paciente]
      )
    } else if (ci) {
      q = await pool.query(
        `SELECT id_registro, titulo, descripcion, fecha_creacion, fecha_actualizacion, id_paciente, ci
         FROM historia_clinica WHERE ci = $1 ORDER BY fecha_creacion DESC`,
        [ci]
      )
    } else {
      return res.json([])
    }
    return res.json(q.rows)
  } catch (err) {
    console.error("getHistoria", err)
    return res.status(500).json({ error: "Error en servidor" })
  }
}

export const getHistoriaById = async (req, res) => {
  try {
    const { id } = req.params
    const q = await pool.query(
      `SELECT id_registro, titulo, descripcion, fecha_creacion, fecha_actualizacion, id_paciente, ci
       FROM historia_clinica WHERE id_registro = $1 LIMIT 1`,
      [id]
    )

    if (q.rowCount === 0)
      return res.status(404).json({ error: "Registro no encontrado" })

    return res.json(q.rows[0])
  } catch (err) {
    console.error("getHistoriaById", err)
    return res.status(500).json({ error: "Error en servidor" })
  }
}

export const postHistoria = async (req, res) => {
  try {
    const { id_paciente, ci, titulo, descripcion } = req.body
    if (!titulo || !descripcion || (!id_paciente && !ci)) {
      return res.status(400).json({ error: "Faltan datos requeridos" })
    }

    const fecha = new Date()
    const insert = await pool.query(
      `INSERT INTO historia_clinica (titulo, descripcion, fecha_creacion, id_paciente, ci)
       VALUES ($1,$2,$3,$4,$5) RETURNING id_registro`,
      [titulo, descripcion, fecha, id_paciente || null, ci || null]
    )
    return res
      .status(201)
      .json({ ok: true, id_registro: insert.rows[0].id_registro })
  } catch (err) {
    console.error("postHistoria", err)
    return res.status(500).json({ error: "Error en servidor" })
  }
}

export const patchHistoria = async (req, res) => {
  try {
    const id = req.params.id
    const { titulo, descripcion } = req.body
    if (!titulo && !descripcion)
      return res.status(400).json({ error: "Nada para actualizar" })

    const fecha_actualizacion = new Date()
    const update = await pool.query(
      `UPDATE historia_clinica
       SET titulo = COALESCE($1, titulo),
           descripcion = COALESCE($2, descripcion),
           fecha_actualizacion = $3
       WHERE id_registro = $4
       RETURNING id_registro, fecha_actualizacion`,
      [titulo, descripcion, fecha_actualizacion, id]
    )

    if (update.rowCount === 0)
      return res.status(404).json({ error: "Registro no encontrado" })

    return res.json({
      ok: true,
      id_registro: update.rows[0].id_registro,
      fecha_actualizacion: update.rows[0].fecha_actualizacion
    })
  } catch (err) {
    console.error("patchHistoria", err)
    return res.status(500).json({ error: "Error en servidor" })
  }
}

export const deleteHistoria = async (req, res) => {
  try {
    const { id } = req.params
    const del = await pool.query(
      "DELETE FROM historia_clinica WHERE id_registro = $1 RETURNING id_registro",
      [id]
    )

    if (del.rowCount === 0)
      return res.status(404).json({ error: "Registro no encontrado" })

    return res.json({ ok: true, id_registro: id })
  } catch (err) {
    console.error("deleteHistoria", err)
    return res.status(500).json({ error: "Error en servidor" })
  }
}
