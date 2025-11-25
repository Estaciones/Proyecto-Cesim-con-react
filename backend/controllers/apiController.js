// backend/controllers/apiController.js
import pool from "../db/pool.js"

/**
 * Nota: todas las respuestas son JSON.
 * Se usan queries parametrizadas para evitar inyección.
 */

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

// Crear paciente (persona + paciente) y asignarlo al médico (medico_paciente)
export const createPatient = async (req, res) => {
  const client = await pool.connect()
  try {
    const {
      ci,
      nombre,
      apellido,
      genero,
      telefono,
      direccion,
      alergias,
      condiciones_cronicas,
      contacto_emergencia_nombre,
      contacto_emergencia_telefono,
      id_medico // obligatorio: id del médico que asigna
    } = req.body

    // Validación mínima
    if (!ci || !nombre || !apellido || !id_medico) {
      return res.status(400).json({
        error: "Faltan datos obligatorios: ci, nombre_apellido o id_medico"
      })
    }

    await client.query("BEGIN")

    // 1) Verificar si ya existe paciente con ese CI -> evitar duplicados
    const existsPatient = await client.query(
      "SELECT id_paciente FROM paciente WHERE ci = $1 LIMIT 1",
      [ci]
    )
    if (existsPatient.rowCount > 0) {
      await client.query("ROLLBACK")
      return res.status(409).json({ error: "Ya existe un paciente con ese CI" })
    }

    // 2) Persona: si existe actualizar datos (sin tocar id_usuario), si no existe insertar
    const personaQ = await client.query(
      "SELECT ci, id_usuario FROM persona WHERE ci = $1 FOR UPDATE",
      [ci]
    )
    if (personaQ.rowCount > 0) {
      // actualizamos datos de persona (no sobreescribimos id_usuario)
      await client.query(
        `UPDATE persona SET nombre=$1, apellido=$2, genero=$3, telefono=$4 WHERE ci=$5`,
        [nombre, apellido, genero || null, telefono || null, ci]
      )
    } else {
      // insertamos persona con id_usuario NULL (medico lo crea antes de que paciente tenga usuario)
      await client.query(
        `INSERT INTO persona (ci, nombre, apellido, genero, telefono, id_usuario)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [ci, nombre, apellido, genero || null, telefono || null, null]
      )
    }

    // 3) Insertar en paciente. Intentamos usar DEFAULT para id_paciente (si es SERIAL/IDENTITY).
    // Si tu tabla NO tiene id_paciente autoincremental, deberás cambiar esto según tu esquema.
    const insertPacienteText = `
      INSERT INTO paciente (direccion, alergias, condiciones_cronicas, contacto_emergencia_nombre, contacto_emergencia_telefono, ci)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id_paciente `

    const insertPacienteValues = [
      direccion || "",
      alergias || "",
      condiciones_cronicas || "",
      contacto_emergencia_nombre || "",
      contacto_emergencia_telefono || "",
      ci
    ]
    const pacienteRes = await client.query(
      insertPacienteText,
      insertPacienteValues
    )
    const id_paciente = pacienteRes.rows[0].id_paciente

    // 4) Obtener medico_ci (necesario para FK compuesta medico_paciente)
    const medicoQ = await client.query(
      "SELECT ci FROM medico WHERE id_medico = $1 LIMIT 1",
      [id_medico]
    )
    if (medicoQ.rowCount === 0) {
      await client.query("ROLLBACK")
      return res.status(404).json({ error: "Médico no encontrado" })
    }
    const medico_ci = medicoQ.rows[0].ci

    // 5) Insertar asignación en medico_paciente (fecha actual)
    const fecha = new Date()
    await client.query(
      `INSERT INTO medico_paciente (id_medico, medico_ci, id_paciente, paciente_ci, fecha_asignacion)
       VALUES ($1,$2,$3,$4,$5)`,
      [id_medico, medico_ci, id_paciente, ci, fecha]
    )

    await client.query("COMMIT")
    return res.status(201).json({ ok: true, id_paciente, ci })
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {})
    console.error("createPatient", err)
    // conflicto por unicidad puede caer aquí
    if (err.code === "23505") {
      return res.status(409).json({ error: "Registro duplicado" })
    }
    return res.status(500).json({ error: "Error en servidor" })
  } finally {
    client.release()
  }
}

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
      // devolver vacío si no hay filtro
      return res.json([])
    }
    return res.json(q.rows)
  } catch (err) {
    console.error("getHistoria", err)
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
    return res.status(201).json({ id_registro: insert.rows[0].id_registro })
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
      // si no hay filtro, devolver vacío (o podrías devolver todos si admin)
      return res.json([])
    }

    const plans = q.rows
    // por cada plan, traer sus prescripciones
    const planIds = plans.map((p) => p.id_plan)
    if (planIds.length === 0) return res.json([])

    const presq = await pool.query(
      `SELECT id_prescripcion, descripcion, frecuencia, duracion, tipo, observaciones, fecha_actualizacion, fecha_creacion, cumplimiento, plan_tratamientoid_plan
       FROM prescripcion WHERE plan_tratamientoid_plan = ANY($1::int[]) ORDER BY fecha_creacion ASC`,
      [planIds]
    )

    const presByPlan = {}
    presq.rows.forEach((pr) => {
      const pid = pr.plan_tratamientoid_plan
      if (!presByPlan[pid]) presByPlan[pid] = []
      presByPlan[pid].push(pr)
    })

    // attach
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

    const medicoQuery = await client.query(
      "SELECT ci FROM medico WHERE id_medico = $1 LIMIT 1",
      [id_medico]
    )
    if (medicoQuery.rowCount === 0) {
      await client.query("ROLLBACK")
      return res.status(404).json({ error: "Médico no encontrado" })
    }
    const medico_ci = medicoQuery.rows[0].ci

    const pacienteQuery = await client.query(
      "SELECT ci FROM paciente WHERE id_paciente = $1 LIMIT 1",
      [id_paciente]
    )
    if (pacienteQuery.rowCount === 0) {
      await client.query("ROLLBACK")
      return res.status(404).json({ error: "Paciente no encontrado" })
    }
    const paciente_ci = pacienteQuery.rows[0].ci
    await client.query("BEGIN")

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

    await client.query("BEGIN")

    const insertPlan = await client.query(
      `INSERT INTO plan_tratamiento (id_medico, medico_ci, id_paciente, paciente_ci, titulo, descripcion, fecha_inicio, fecha_fin, estado, resumen_egreso)
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

    // insertar prescripciones si vienen
    if (Array.isArray(prescripciones) && prescripciones.length > 0) {
      const insertPresText = `INSERT INTO prescripcion (descripcion, frecuencia, duracion, tipo, observaciones, fecha_creacion, cumplimiento, plan_tratamientoid_plan)
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
    return res.status(201).json({ id_plan })
  } catch (err) {
    await client.query("ROLLBACK")
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

    // Solo aceptamos estos campos para actualizar desde UI del médico
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

    // Validación: si envían fecha_inicio, que no sea anterior a hoy
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

    // Construir dinámicamente SET y valores
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

    // actualización
    const sql = `UPDATE plan_tratamiento SET ${sets.join(
      ", "
    )} WHERE id_plan = $${ix} RETURNING id_plan, titulo, descripcion, fecha_inicio, estado, resumen_egreso`
    values.push(id)

    const upd = await client.query(sql, values)
    if (upd.rowCount === 0)
      return res.status(404).json({ error: "Plan no encontrado" })

    return res.json({ ok: true, plan: upd.rows[0] })
  } catch (err) {
    console.error("patchPlanTratamiento", err)
    return res.status(500).json({ error: "Error en servidor" })
  } finally {
    client.release()
  }
}

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

export const patchPrescripcion = async (req, res) => {
  try {
    const id = req.params.id
    const { descripcion, observaciones, cumplimiento } = req.body
    const fecha_actualizacion = new Date()
    const update = await pool.query(
      `UPDATE prescripcion SET descripcion = COALESCE($1, descripcion), observaciones = COALESCE($2, observaciones), cumplimiento = COALESCE($3, cumplimiento), fecha_actualizacion = $4
       WHERE id_prescripcion = $5 RETURNING id_prescripcion`,
      [descripcion, observaciones, cumplimiento, fecha_actualizacion, id]
    )
    if (update.rowCount === 0)
      return res.status(404).json({ error: "No encontrado" })
    return res.json({ ok: true })
  } catch (err) {
    console.error("patchPrescripcion", err)
    return res.status(500).json({ error: "Error en servidor" })
  }
}

/* ---------- PACIENTES (medico / gestor) ---------- */
export const getPacientes = async (req, res) => {
  try {
    const { medico_id, gestor_id } = req.query

    let rows
    if (medico_id) {
      // unir medico_paciente -> paciente -> persona
      const q = await pool.query(
        `SELECT pa.id_paciente, pa.direccion, pa.alergias, pa.condiciones_cronicas, pa.contacto_emergencia_nombre,
                pa.contacto_emergencia_telefono, pa.ci, per.nombre, per.apellido, per.telefono, u.email
         FROM medico_paciente mp
         JOIN paciente pa ON mp.id_paciente = pa.id_paciente AND mp.paciente_ci = pa.ci
         LEFT JOIN persona per ON pa.ci = per.ci
         LEFT JOIN usuario u ON per.id_usuario = u.id_usuario
         WHERE mp.id_medico = $1`,
        [medico_id]
      )
      rows = q.rows
    } else if (gestor_id) {
      const q = await pool.query(
        `SELECT pa.id_paciente, pa.direccion, pa.alergias, pa.condiciones_cronicas, pa.contacto_emergencia_nombre,
                pa.contacto_emergencia_telefono, pa.ci, per.nombre, per.apellido, per.telefono, u.email
         FROM gestor_casos_paciente gp
         JOIN paciente pa ON gp.id_paciente = pa.id_paciente AND gp.paciente_ci = pa.ci
         LEFT JOIN persona per ON pa.ci = per.ci
         LEFT JOIN usuario u ON per.id_usuario = u.id_usuario
         WHERE gp.id_gestor = $1`,
        [gestor_id]
      )
      rows = q.rows
    } else {
      // devolver todos los pacientes básicos (limitado)
      const q = await pool.query(
        `SELECT pa.id_paciente, pa.ci, per.nombre, per.apellido, pa.direccion FROM paciente pa LEFT JOIN persona per ON pa.ci = per.ci LIMIT 200`
      )
      rows = q.rows
    }
    return res.json(rows)
  } catch (err) {
    console.error("getPacientes", err)
    return res.status(500).json({ error: "Error en servidor" })
  }
}

/* ---------- GESTORES ---------- */
export const getGestores = async (req, res) => {
  try {
    const q = await pool.query(
      `SELECT g.id_gestor, g.ci, per.nombre, per.apellido, g.capacidad_maxima
       FROM gestor_casos g
       LEFT JOIN persona per ON g.ci = per.ci`
    )
    return res.json(
      q.rows.map((r) => ({
        id_gestor: r.id_gestor,
        ci: r.ci,
        nombre: r.nombre,
        apellido: r.apellido,
        capacidad_maxima: r.capacidad_maxima
      }))
    )
  } catch (err) {
    console.error("getGestores", err)
    return res.status(500).json({ error: "Error en servidor" })
  }
}

/* ---------- ASIGNAR GESTOR ---------- */
export const postAsignarGestor = async (req, res) => {
  const client = await pool.connect()
  try {
    const { id_gestor, id_paciente } = req.body
    if (!id_gestor || !id_paciente)
      return res.status(400).json({ error: "Faltan datos" })

    // obtener ci del paciente
    const qp = await client.query(
      "SELECT ci FROM paciente WHERE id_paciente = $1 LIMIT 1",
      [id_paciente]
    )
    if (qp.rowCount === 0)
      return res.status(404).json({ error: "Paciente no encontrado" })
    const paciente_ci = qp.rows[0].ci

    await client.query("BEGIN")

    // insertar en gestor_casos_paciente (si no existe ya)
    // usamos fecha actual
    const fecha = new Date()
    // revisar duplicado
    const exists = await client.query(
      `SELECT 1 FROM gestor_casos_paciente WHERE id_gestor = $1 AND id_paciente = $2 AND gestor_casos_ci = $3 AND paciente_ci = $4 LIMIT 1`,
      [
        id_gestor,
        id_paciente,
        (
          await client.query(
            "SELECT ci FROM gestor_casos WHERE id_gestor = $1 LIMIT 1",
            [id_gestor]
          )
        ).rows[0].ci,
        paciente_ci
      ]
    )
    if (exists.rowCount > 0) {
      await client.query("ROLLBACK")
      return res.status(409).json({ error: "Ya asignado" })
    }

    // obtener gestor ci
    const gq = await client.query(
      "SELECT ci FROM gestor_casos WHERE id_gestor = $1 LIMIT 1",
      [id_gestor]
    )
    if (gq.rowCount === 0) {
      await client.query("ROLLBACK")
      return res.status(404).json({ error: "Gestor no encontrado" })
    }
    const gestor_ci = gq.rows[0].ci

    await client.query(
      `INSERT INTO gestor_casos_paciente (id_gestor, gestor_casos_ci, id_paciente, paciente_ci, fecha_asignacion)
       VALUES ($1,$2,$3,$4,$5)`,
      [id_gestor, gestor_ci, id_paciente, paciente_ci, fecha]
    )

    await client.query("COMMIT")
    return res.status(201).json({ ok: true })
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {})
    console.error("postAsignarGestor", err)
    return res.status(500).json({ error: "Error en servidor" })
  } finally {
    client.release()
  }
}


