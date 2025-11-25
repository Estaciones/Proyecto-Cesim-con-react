// backend/models/userModel.js
import pool from "../db/pool.js"

/**
 * checkPacienteByCI(ci) -> devuelve true si existe al menos una fila en paciente con ese ci
 */
export const checkPacienteByCI = async (ci) => {
  // Ajusta nombres de columna según tu esquema; aquí suponemos que paciente tiene columna "ci"
  const q = await pool.query("SELECT 1 FROM paciente WHERE ci = $1 LIMIT 1", [
    ci
  ])
  return q.rowCount > 0
}

/**
 * createUserWithRole(data)
 * - Inserta usuario
 * - Bloquea/crea persona y le asigna id_usuario
 * - Inserta fila en medico o gestor_casos si corresponde
 * TODO: ajustar columnas concretas si tu esquema difiere.
 */
export const createUserWithRole = async (data) => {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    // 1) Insertar en usuario
    const insertUsuarioText = `
      INSERT INTO usuario (email, password_hash, tipo_usuario, fecha_registro, ultimo_login, esta_activo, nombre_usuario)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id_usuario, email, nombre_usuario
    `
    const insertUsuarioValues = [
      data.email,
      data.password_hash,
      data.tipo_usuario,
      data.fecha_registro,
      data.ultimo_login,
      data.esta_activo,
      data.nombre_usuario
    ]
    const usuarioRes = await client.query(
      insertUsuarioText,
      insertUsuarioValues
    )
    const id_usuario = usuarioRes.rows[0].id_usuario

    // 2) Persona: lock-if-exists
    const personaSelect = await client.query(
      "SELECT ci, id_usuario FROM persona WHERE ci = $1 FOR UPDATE",
      [data.ci]
    )

    if (personaSelect.rowCount > 0) {
      const persona = personaSelect.rows[0]
      if (persona.id_usuario) {
        // La persona ya está vinculada a otro usuario -> no permitimos registro
        // Lanzamos error controlado para el controlador
        const err = new Error(
          `La persona con CI ${data.ci} ya está asociada a un usuario`
        )
        err.code = "PERSONA_ASOCIADA"
        throw err
      } else {
        // persona existe y no está asociada: actualizamos sus datos y le asignamos id_usuario
        await client.query(
          `UPDATE persona SET nombre=$1, apellido=$2, genero=$3, telefono=$4, id_usuario=$5 WHERE ci=$6`,
          [
            data.nombre,
            data.apellido,
            data.genero,
            data.telefono,
            id_usuario,
            data.ci
          ]
        )
      }
    } else {
      // persona no existe: la insertamos vinculada al nuevo usuario
      await client.query(
        `INSERT INTO persona (ci, nombre, apellido, genero, telefono, id_usuario)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          data.ci,
          data.nombre,
          data.apellido,
          data.genero,
          data.telefono,
          id_usuario
        ]
      )
    }

    // 3) Según tipo_usuario: insertar en tabla correspondiente (si aplica)
    if (data.tipo_usuario === "medico") {
      // opcional: verificar si ya existe un registro de medico para ese CI
      const existsMed = await client.query(
        "SELECT id_medico, ci FROM medico WHERE ci = $1 LIMIT 1",
        [data.ci]
      )
      if (existsMed.rowCount > 0) {
        // Si ya existe un medico con ese CI y además está asociado a otro id_medico (o ya existe),
        // podríamos decidir si rechazamos o no. Aquí vamos a intentar insertar usando id_usuario como id_medico,
        // pero si existe conflicto fallará y hará rollback.
        // Para mayor seguridad, si ya existe y su id_medico != id_usuario, lanzamos conflicto:
        const row = existsMed.rows[0]
        if (row.id_medico && row.id_medico !== id_usuario) {
          const err = new Error(
            `Ya existe un registro de médico para CI ${data.ci} (id_medico ${row.id_medico}).`
          )
          err.code = "MEDICO_EXISTENTE"
          throw err
        } else if (row.id_medico === id_usuario) {
          // ya está creado con el mismo id_usuario: no hacemos nada
        } else {
          // si no tiene id_medico (raro), intentamos insertar
          await client.query(
            `INSERT INTO medico (id_medico, especialidad, ci) VALUES ($1, $2, $3)`,
            [id_usuario, "", data.ci]
          )
        }
      } else {
        // no existe -> insertamos
        await client.query(
          `INSERT INTO medico (id_medico, especialidad, ci) VALUES ($1, $2, $3)`,
          [id_usuario, "", data.ci]
        )
      }
    } else if (
      data.tipo_usuario === "gestor_casos" ||
      data.tipo_usuario === "gestor_cuidados"
    ) {
      const existsGest = await client.query(
        "SELECT id_gestor, ci FROM gestor_casos WHERE ci = $1 LIMIT 1",
        [data.ci]
      )
      if (existsGest.rowCount > 0) {
        const row = existsGest.rows[0]
        if (row.id_gestor && row.id_gestor !== id_usuario) {
          const err = new Error(
            `Ya existe un registro de gestor para CI ${data.ci} (id_gestor ${row.id_gestor}).`
          )
          err.code = "GESTOR_EXISTENTE"
          throw err
        } else if (row.id_gestor === id_usuario) {
          // ya está creado con el mismo id, OK
        } else {
          await client.query(
            `INSERT INTO gestor_casos (id_gestor, capacidad_maxima, ci) VALUES ($1, $2, $3)`,
            [id_usuario, 0, data.ci]
          )
        }
      } else {
        await client.query(
          `INSERT INTO gestor_casos (id_gestor, capacidad_maxima, ci) VALUES ($1, $2, $3)`,
          [id_usuario, 10, data.ci]
        )
      }
    } else if (data.tipo_usuario === "paciente") {
      // Aquí no insertamos en paciente porque asumimos que ya existe;
      // podríamos actualizar la fila paciente para vincularla con id_usuario si tienes esa columna.
      // Ejemplo (descomentar si existe columna id_usuario en paciente):
      await client.query("UPDATE persona SET id_usuario = $1 WHERE ci = $2", [
        id_usuario,
        data.ci
      ])
    }

    await client.query("COMMIT")
    return {
      id_usuario,
      email: usuarioRes.rows[0].email,
      nombre_usuario: usuarioRes.rows[0].nombre_usuario
    }
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}
