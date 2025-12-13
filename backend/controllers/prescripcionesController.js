import pool from "../db/pool.js"

/* ---------- PRESCRIPCION ---------- */
export const getPrescripcion = async (req, res) => {
  try {
    const id = req.params.id
    const q = await pool.query(
      "SELECT * FROM prescripcion WHERE id_prescripcion = $1 LIMIT 1",
      [id]
    )
    if (q.rowCount === 0)
      return res.status(404).json({ error: "Prescripción no encontrada" })
    return res.json(q.rows[0])
  } catch (err) {
    console.error("getPrescripcion", err)
    return res.status(500).json({ error: "Error en servidor" })
  }
}

export const createPrescripcion = async (req, res) => {
  try {
    const {
      descripcion,
      frecuencia,
      duracion,
      tipo,
      observaciones,
      plan_tratamientoid_plan
    } = req.body

    if (!descripcion || !plan_tratamientoid_plan) {
      return res.status(400).json({
        error: "Faltan datos requeridos: descripcion y plan_tratamientoid_plan"
      })
    }

    const fecha_creacion = new Date()
    const insert = await pool.query(
      `INSERT INTO prescripcion (descripcion, frecuencia, duracion, tipo, observaciones, 
       fecha_creacion, cumplimiento, plan_tratamientoid_plan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_prescripcion`,
      [
        descripcion,
        frecuencia || null,
        duracion || null,
        tipo || "",
        observaciones || null,
        fecha_creacion,
        false,
        plan_tratamientoid_plan
      ]
    )

    return res.status(201).json({
      ok: true,
      id_prescripcion: insert.rows[0].id_prescripcion
    })
  } catch (err) {
    console.error("createPrescripcion", err)
    return res.status(500).json({ error: "Error en servidor" })
  }
}

export const patchPrescripcion = async (req, res) => {
  try {
    const id = req.params.id
    const { descripcion, observaciones, cumplimiento } = req.body

    if (!descripcion && !observaciones && typeof cumplimiento === "undefined") {
      return res.status(400).json({ error: "Nada para actualizar" })
    }

    const fecha_actualizacion = new Date()
    const update = await pool.query(
      `UPDATE prescripcion 
       SET descripcion = COALESCE($1, descripcion), 
           observaciones = COALESCE($2, observaciones), 
           cumplimiento = COALESCE($3, cumplimiento), 
           fecha_actualizacion = $4
       WHERE id_prescripcion = $5 
       RETURNING id_prescripcion`,
      [descripcion, observaciones, cumplimiento, fecha_actualizacion, id]
    )

    if (update.rowCount === 0)
      return res.status(404).json({ error: "Prescripción no encontrada" })

    return res.json({ ok: true })
  } catch (err) {
    console.error("patchPrescripcion", err)
    return res.status(500).json({ error: "Error en servidor" })
  }
}

export const deletePrescripcion = async (req, res) => {
  try {
    const { id } = req.params
    const del = await pool.query(
      "DELETE FROM prescripcion WHERE id_prescripcion = $1 RETURNING id_prescripcion",
      [id]
    )

    if (del.rowCount === 0)
      return res.status(404).json({ error: "Prescripción no encontrada" })

    return res.json({ ok: true, id_prescripcion: id })
  } catch (err) {
    console.error("deletePrescripcion", err)
    return res.status(500).json({ error: "Error en servidor" })
  }
}
