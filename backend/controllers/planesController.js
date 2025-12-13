import pool from "../db/pool.js"

/* ---------- PLAN DE TRATAMIENTO (con prescripciones) ---------- */
export const getPlanes = async (req, res) => {
  try {
    const { id_paciente, ci } = req.query
    let q
    if (id_paciente) {
      q = await pool.query(
        `SELECT * FROM plan_tratamiento WHERE id_paciente = $1 ORDER BY fecha_inicio DESC`,
        [id_paciente]
      )
    } else if (ci) {
      q = await pool.query(
        `SELECT * FROM plan_tratamiento WHERE paciente_ci = $1 ORDER BY fecha_inicio DESC`,
        [ci]
      )
    } else {
      return res.json([])
    }

    const plans = q.rows
    const planIds = plans.map((p) => p.id_plan)
    if (planIds.length === 0) return res.json([])

    const presq = await pool.query(
      `SELECT id_prescripcion, descripcion, frecuencia, duracion, tipo, observaciones, 
       fecha_actualizacion, fecha_creacion, cumplimiento, plan_tratamientoid_plan
       FROM prescripcion WHERE plan_tratamientoid_plan = ANY($1::int[]) ORDER BY fecha_creacion ASC`,
      [planIds]
    )

    const presByPlan = {}
    presq.rows.forEach((pr) => {
      const pid = pr.plan_tratamientoid_plan
      if (!presByPlan[pid]) presByPlan[pid] = []
      presByPlan[pid].push(pr)
    })

    const result = plans.map((p) => ({
      ...p,
      prescripciones: presByPlan[p.id_plan] || []
    }))
    return res.json(result)
  } catch (err) {
    console.error("getPlanes", err)
    return res.status(500).json({ error: "Error en servidor" })
  }
}

export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params
    const q = await pool.query(
      `SELECT * FROM plan_tratamiento WHERE id_plan = $1 LIMIT 1`,
      [id]
    )

    if (q.rowCount === 0)
      return res.status(404).json({ error: "Plan no encontrado" })

    const plan = q.rows[0]

    // Obtener prescripciones del plan
    const presq = await pool.query(
      `SELECT * FROM prescripcion WHERE plan_tratamientoid_plan = $1 ORDER BY fecha_creacion ASC`,
      [id]
    )

    plan.prescripciones = presq.rows
    return res.json(plan)
  } catch (err) {
    console.error("getPlanById", err)
    return res.status(500).json({ error: "Error en servidor" })
  }
}

export const postPlanTratamiento = async (req, res) => {
  const client = await pool.connect()
  try {
    const {
      id_medico,
      id_paciente,
      titulo,
      descripcion,
      fecha_inicio,
      prescripciones
    } = req.body

    if (
      !id_medico ||
      !id_paciente ||
      !titulo ||
      !descripcion ||
      !fecha_inicio
    ) {
      return res.status(400).json({ error: "Faltan datos requeridos" })
    }

    // Validaciones antes de BEGIN
    const inicio = new Date(fecha_inicio)
    if (isNaN(inicio.getTime()))
      return res.status(400).json({ error: "Fecha inválida" })

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    inicio.setHours(0, 0, 0, 0)
    if (inicio < hoy) {
      return res
        .status(400)
        .json({ error: "La fecha de inicio no puede ser anterior a hoy" })
    }

    // Verificar médico y paciente
    const medicoQuery = await client.query(
      "SELECT ci FROM medico WHERE id_medico = $1 LIMIT 1",
      [id_medico]
    )
    if (medicoQuery.rowCount === 0) {
      return res.status(404).json({ error: "Médico no encontrado" })
    }

    const pacienteQuery = await client.query(
      "SELECT ci FROM paciente WHERE id_paciente = $1 LIMIT 1",
      [id_paciente]
    )
    if (pacienteQuery.rowCount === 0) {
      return res.status(404).json({ error: "Paciente no encontrado" })
    }

    const medico_ci = medicoQuery.rows[0].ci
    const paciente_ci = pacienteQuery.rows[0].ci

    await client.query("BEGIN")

    try {
      const insertPlan = await client.query(
        `INSERT INTO plan_tratamiento (id_medico, medico_ci, id_paciente, paciente_ci, 
         titulo, descripcion, fecha_inicio, fecha_fin, estado, resumen_egreso)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id_plan`,
        [
          id_medico,
          medico_ci,
          id_paciente,
          paciente_ci,
          titulo,
          descripcion,
          fecha_inicio,
          null,
          true,
          ""
        ]
      )

      const id_plan = insertPlan.rows[0].id_plan

      // Insertar prescripciones si vienen
      if (Array.isArray(prescripciones) && prescripciones.length > 0) {
        const insertPresText = `INSERT INTO prescripcion (descripcion, frecuencia, duracion, tipo, 
                                observaciones, fecha_creacion, cumplimiento, plan_tratamientoid_plan)
                                VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id_prescripcion`
        for (const pr of prescripciones) {
          const now = new Date()
          await client.query(insertPresText, [
            pr.descripcion || "",
            pr.frecuencia || null,
            pr.duracion || null,
            pr.tipo || "",
            pr.observaciones || null,
            now,
            false,
            id_plan
          ])
        }
      }

      await client.query("COMMIT")
      return res.status(201).json({ ok: true, id_plan })
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    }
  } catch (err) {
    console.error("postPlanTratamiento", err)
    return res.status(500).json({ error: "Error en servidor" })
  } finally {
    client.release()
  }
}

export const patchPlanTratamiento = async (req, res) => {
  const client = await pool.connect()
  try {
    const id = Number(req.params.id)
    if (!id) return res.status(400).json({ error: "ID inválido" })

    const { titulo, descripcion, fecha_inicio, estado, resumen_egreso } =
      req.body

    if (
      !titulo &&
      !descripcion &&
      !fecha_inicio &&
      typeof estado === "undefined" &&
      !resumen_egreso
    ) {
      return res.status(400).json({ error: "Nada para actualizar" })
    }

    // Validación de fecha antes de BEGIN
    if (fecha_inicio) {
      const inicio = new Date(fecha_inicio)
      if (isNaN(inicio.getTime()))
        return res.status(400).json({ error: "Fecha inválida" })

      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      inicio.setHours(0, 0, 0, 0)
      if (inicio < hoy)
        return res
          .status(400)
          .json({ error: "La fecha de inicio no puede ser anterior a hoy" })
    }

    // Verificar existencia antes de BEGIN
    const planCheck = await client.query(
      "SELECT id_plan FROM plan_tratamiento WHERE id_plan = $1",
      [id]
    )
    if (planCheck.rowCount === 0) {
      return res.status(404).json({ error: "Plan no encontrado" })
    }

    await client.query("BEGIN")

    try {
      // Construir dinámicamente SET
      const sets = []
      const values = []
      let ix = 1

      if (titulo) {
        sets.push(`titulo = $${ix++}`)
        values.push(titulo)
      }
      if (descripcion) {
        sets.push(`descripcion = $${ix++}`)
        values.push(descripcion)
      }
      if (fecha_inicio) {
        sets.push(`fecha_inicio = $${ix++}`)
        values.push(fecha_inicio)
      }
      if (typeof estado !== "undefined") {
        sets.push(`estado = $${ix++}`)
        values.push(!!estado)
      }
      if (resumen_egreso) {
        sets.push(`resumen_egreso = $${ix++}`)
        values.push(resumen_egreso)
      }

      values.push(id)
      const sql = `UPDATE plan_tratamiento SET ${sets.join(", ")} 
                   WHERE id_plan = $${ix} 
                   RETURNING id_plan, titulo, descripcion, fecha_inicio, estado, resumen_egreso`

      const upd = await client.query(sql, values)

      if (upd.rowCount === 0) {
        await client.query("ROLLBACK")
        return res.status(404).json({ error: "Plan no encontrado" })
      }

      await client.query("COMMIT")
      return res.json({ ok: true, plan: upd.rows[0] })
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    }
  } catch (err) {
    console.error("patchPlanTratamiento", err)
    return res.status(500).json({ error: "Error en servidor" })
  } finally {
    client.release()
  }
}

export const deletePlanTratamiento = async (req, res) => {
  const client = await pool.connect()
  try {
    const { id } = req.params

    // Verificar existencia
    const planCheck = await client.query(
      "SELECT id_plan FROM plan_tratamiento WHERE id_plan = $1",
      [id]
    )
    if (planCheck.rowCount === 0) {
      return res.status(404).json({ error: "Plan no encontrado" })
    }

    await client.query("BEGIN")

    try {
      // Eliminar prescripciones primero
      await client.query(
        "DELETE FROM prescripcion WHERE plan_tratamientoid_plan = $1",
        [id]
      )

      // Eliminar plan
      await client.query("DELETE FROM plan_tratamiento WHERE id_plan = $1", [
        id
      ])

      await client.query("COMMIT")
      return res.json({ ok: true, id_plan: id })
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    }
  } catch (err) {
    console.error("deletePlanTratamiento", err)
    return res.status(500).json({ error: "Error en servidor" })
  } finally {
    client.release()
  }
}
