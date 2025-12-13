import pool from "../db/pool.js"

/* ---------- PACIENTES ---------- */
export const getPacientes = async (req, res) => {
  try {
    const { medico_id, gestor_id } = req.query

    let rows
    if (medico_id) {
      const q = await pool.query(
        `SELECT pa.id_paciente, pa.direccion, pa.alergias, pa.condiciones_cronicas, pa.contacto_emergencia_nombre,
                pa.contacto_emergencia_telefono, pa.ci, per.nombre, per.apellido, per.telefono, per.genero
         FROM medico_paciente mp
         JOIN paciente pa ON mp.id_paciente = pa.id_paciente AND mp.paciente_ci = pa.ci
         LEFT JOIN persona per ON pa.ci = per.ci
         WHERE mp.id_medico = $1`,
        [medico_id]
      )
      rows = q.rows
    } else if (gestor_id) {
      const q = await pool.query(
        `SELECT pa.id_paciente, pa.direccion, pa.alergias, pa.condiciones_cronicas, pa.contacto_emergencia_nombre,
                pa.contacto_emergencia_telefono, pa.ci, per.nombre, per.apellido, per.telefono, per.genero
         FROM gestor_casos_paciente gp
         JOIN paciente pa ON gp.id_paciente = pa.id_paciente AND gp.paciente_ci = pa.ci
         LEFT JOIN persona per ON pa.ci = per.ci
         WHERE gp.id_gestor = $1`,
        [gestor_id]
      )
      rows = q.rows
    } else {
      const q = await pool.query(
        `SELECT pa.id_paciente, pa.ci, per.nombre, per.apellido, pa.direccion 
         FROM paciente pa 
         LEFT JOIN persona per ON pa.ci = per.ci 
         LIMIT 200`
      )
      rows = q.rows
    }
    return res.json(rows)
  } catch (err) {
    console.error("getPacientes", err)
    return res.status(500).json({ error: "Error en servidor" })
  }
}

export const getPacienteById = async (req, res) => {
  try {
    const { id } = req.params
    const q = await pool.query(
      `SELECT pa.id_paciente, pa.direccion, pa.alergias, pa.condiciones_cronicas, 
              pa.contacto_emergencia_nombre, pa.contacto_emergencia_telefono, pa.ci,
              per.nombre, per.apellido, per.telefono, per.genero
       FROM paciente pa
       LEFT JOIN persona per ON pa.ci = per.ci
       WHERE pa.id_paciente = $1
       LIMIT 1`,
      [id]
    )

    if (q.rowCount === 0)
      return res.status(404).json({ error: "Paciente no encontrado" })

    return res.json(q.rows[0])
  } catch (err) {
    console.error("getPacienteById", err)
    return res.status(500).json({ error: "Error en servidor" })
  }
}

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
      id_medico
    } = req.body

    // Validación corregida
    if (!ci || !nombre || !apellido || !id_medico) {
      return res.status(400).json({
        error: "Faltan datos obligatorios: ci, nombre, apellido o id_medico"
      })
    }

    // Verificaciones antes de BEGIN
    const existsPatient = await client.query(
      "SELECT id_paciente FROM paciente WHERE ci = $1 LIMIT 1",
      [ci]
    )
    if (existsPatient.rowCount > 0) {
      return res.status(409).json({ error: "Ya existe un paciente con ese CI" })
    }

    const medicoCheck = await client.query(
      "SELECT ci FROM medico WHERE id_medico = $1 LIMIT 1",
      [id_medico]
    )
    if (medicoCheck.rowCount === 0) {
      return res.status(404).json({ error: "Médico no encontrado" })
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

      // Insertar paciente
      const pacienteRes = await client.query(
        `INSERT INTO paciente (direccion, alergias, condiciones_cronicas, 
         contacto_emergencia_nombre, contacto_emergencia_telefono, ci)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id_paciente`,
        [
          direccion || "",
          alergias || "",
          condiciones_cronicas || "",
          contacto_emergencia_nombre || "",
          contacto_emergencia_telefono || "",
          ci
        ]
      )

      const id_paciente = pacienteRes.rows[0].id_paciente
      const medico_ci = medicoCheck.rows[0].ci

      // Insertar asignación médico-paciente
      const fecha = new Date()
      await client.query(
        `INSERT INTO medico_paciente (id_medico, medico_ci, id_paciente, paciente_ci, fecha_asignacion)
         VALUES ($1,$2,$3,$4,$5)`,
        [id_medico, medico_ci, id_paciente, ci, fecha]
      )

      await client.query("COMMIT")
      return res.status(201).json({ ok: true, id_paciente, ci })
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    }
  } catch (err) {
    console.error("createPatient", err)
    if (err.code === "23505") {
      return res.status(409).json({ error: "Registro duplicado" })
    }
    return res.status(500).json({ error: "Error en servidor" })
  } finally {
    client.release()
  }
}

export const updatePatient = async (req, res) => {
  const client = await pool.connect()
  try {
    const { id } = req.params
    const {
      direccion,
      alergias,
      condiciones_cronicas,
      contacto_emergencia_nombre,
      contacto_emergencia_telefono
    } = req.body

    if (
      !direccion &&
      !alergias &&
      !condiciones_cronicas &&
      !contacto_emergencia_nombre &&
      !contacto_emergencia_telefono
    ) {
      return res.status(400).json({ error: "No hay datos para actualizar" })
    }

    await client.query("BEGIN")

    try {
      // Verificar existencia
      const pacienteQ = await client.query(
        "SELECT id_paciente FROM paciente WHERE id_paciente = $1 FOR UPDATE",
        [id]
      )
      if (pacienteQ.rowCount === 0) {
        await client.query("ROLLBACK")
        return res.status(404).json({ error: "Paciente no encontrado" })
      }

      // Construir query dinámica
      const sets = []
      const values = []
      let index = 1

      if (direccion !== undefined) {
        sets.push(`direccion = $${index}`)
        values.push(direccion)
        index++
      }
      if (alergias !== undefined) {
        sets.push(`alergias = $${index}`)
        values.push(alergias)
        index++
      }
      if (condiciones_cronicas !== undefined) {
        sets.push(`condiciones_cronicas = $${index}`)
        values.push(condiciones_cronicas)
        index++
      }
      if (contacto_emergencia_nombre !== undefined) {
        sets.push(`contacto_emergencia_nombre = $${index}`)
        values.push(contacto_emergencia_nombre)
        index++
      }
      if (contacto_emergencia_telefono !== undefined) {
        sets.push(`contacto_emergencia_telefono = $${index}`)
        values.push(contacto_emergencia_telefono)
        index++
      }

      values.push(id)
      const query = `UPDATE paciente SET ${sets.join(
        ", "
      )} WHERE id_paciente = $${index} RETURNING id_paciente`

      const updateResult = await client.query(query, values)

      if (updateResult.rowCount === 0) {
        await client.query("ROLLBACK")
        return res.status(404).json({ error: "Paciente no encontrado" })
      }

      await client.query("COMMIT")
      return res.json({ ok: true, id_paciente: id })
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    }
  } catch (err) {
    console.error("updatePatient", err)
    return res.status(500).json({ error: "Error en servidor" })
  } finally {
    client.release()
  }
}

export const deletePatient = async (req, res) => {
  const client = await pool.connect()
  try {
    const { id } = req.params

    // Verificar existencia antes de transacción
    const pacienteCheck = await client.query(
      "SELECT id_paciente FROM paciente WHERE id_paciente = $1",
      [id]
    )
    if (pacienteCheck.rowCount === 0) {
      return res.status(404).json({ error: "Paciente no encontrado" })
    }

    await client.query("BEGIN")

    try {
      // Eliminar asignaciones
      await client.query("DELETE FROM medico_paciente WHERE id_paciente = $1", [
        id
      ])

      await client.query(
        "DELETE FROM gestor_casos_paciente WHERE id_paciente = $1",
        [id]
      )

      // Eliminar paciente
      await client.query("DELETE FROM paciente WHERE id_paciente = $1", [id])

      await client.query("COMMIT")
      return res.json({ ok: true })
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    }
  } catch (err) {
    console.error("deletePatient", err)
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
