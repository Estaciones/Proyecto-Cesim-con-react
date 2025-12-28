// src/components/dashboard/sections/Pacientes/Pacientes.jsx
import React, { useEffect, useCallback, useMemo } from "react"
import { useAuthContext } from "../../../../context/AuthContext"
import { useModal } from "../../../../hooks/useModal"
import { usePatients } from "../../../../hooks/usePatients"
import Button from "../../../ui/Button/Button"
import Card from "../../../ui/Card/Card"
import styles from "./Pacientes.module.css"

export default function Pacientes({ onSelectPatient }) {
  const { profile } = useAuthContext()
  const {
    openAsignarGestor,
    openCrearPlanWithPatient,
    openRegistroWithPatient
  } = useModal()

  // hook centralizado
  const { patients, loading, error, fetchPatients } = usePatients()

  // Construir params según tipo de usuario
  const buildParams = useCallback(() => {
    const params = {}
    const tipo = profile?.tipo_usuario
    const idUsuario = profile?.id_usuario

    if (!tipo) return params

    if (tipo === "medico") {
      // Backend debería filtrar por medico_id
      if (idUsuario) params.medico_id = idUsuario
    } else if (
      tipo === "gestor_casos" ||
      (typeof tipo === "string" && tipo.includes("gestor"))
    ) {
      if (idUsuario) params.gestor_id = idUsuario
    } else {
      // otros tipos no deberían acceder a esta vista (ya lo manejas)
    }

    return params
  }, [profile])

  // carga inicial con abort controller (ahora con params)
  useEffect(() => {
    const controller = new AbortController()
    const params = buildParams()

    // Si no hay parámetros (ej. perfil no listo), intentamos reintentar más tarde.
    // Pero si perfil indica que no debe ver pacientes, no hacemos la llamada.
    if (!profile?.tipo_usuario) {
      // esperar hasta que profile esté disponible
      return
    }

    // Si el usuario no puede ver pacientes, no llamar
    if (profile?.tipo_usuario === "paciente") return

    fetchPatients(params, { signal: controller.signal }).catch((err) => {
      if (err && err.name === "AbortError") {
        console.log(
          "Pacientes.jsx - fetch aborted (expected in dev StrictMode)"
        )
      } else {
        console.error("Pacientes.jsx - fetchPatients error:", err)
      }
    })

    return () => controller.abort()
  }, [fetchPatients, buildParams, profile])

  const isPaciente = useMemo(
    () => profile?.tipo_usuario === "paciente",
    [profile]
  )
  const isMedico = useMemo(() => profile?.tipo_usuario === "medico", [profile])
  const canAssignGestor = isMedico
  const canCreatePlan = isMedico

  const handleSelectPatient = useCallback(
    (patient) => {
      if (onSelectPatient) {
        onSelectPatient({
          id_paciente: patient.id_paciente || patient.id,
          ci: patient.ci,
          nombre: patient.nombre,
          apellido: patient.apellido,
          email: patient.email
        })
      }
    },
    [onSelectPatient]
  )

  // filtrado local
  const [searchQuery, setSearchQuery] = React.useState("")
  const filteredPatients = React.useMemo(() => {
    if (!Array.isArray(patients)) return []
    const q = searchQuery.trim().toLowerCase()
    if (!q) return patients
    return patients.filter((p) => {
      const s = `${p.nombre || ""} ${p.apellido || ""} ${p.ci || ""} ${
        p.email || ""
      }`.toLowerCase()
      return s.includes(q)
    })
  }, [patients, searchQuery])

  if (isPaciente) {
    return (
      <section className={styles.container}>
        <div className={styles.accessDenied}>
          <h2>Acceso restringido</h2>
          <p>No tienes permiso para ver esta sección.</p>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            {isMedico ? "Mis Pacientes" : "Pacientes Asignados"}
          </h1>
          <p className={styles.subtitle}>
            {isMedico
              ? "Gestiona y administra tus pacientes"
              : "Pacientes bajo tu gestión"}
          </p>
        </div>

        <div className={styles.actions}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Buscar por nombre, CI o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={styles.clearButton}
                aria-label="Limpiar búsqueda">
                ✖
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando lista de pacientes...</p>
        </div>
      ) : error ? (
        <Card className={styles.emptyCard}>
          <div className={styles.emptyState}>
            <h3>Error</h3>
            <p>{String(error)}</p>
          </div>
        </Card>
      ) : filteredPatients.length === 0 ? (
        <Card className={styles.emptyCard}>
          <div className={styles.emptyState}>
            <h3>
              {searchQuery
                ? "No se encontraron pacientes"
                : "No hay pacientes asignados"}
            </h3>
            <p>
              {searchQuery
                ? "No hay pacientes que coincidan con tu búsqueda."
                : isMedico
                ? "Comienza agregando nuevos pacientes a tu lista."
                : "Aún no tienes pacientes asignados."}
            </p>
          </div>
        </Card>
      ) : (
        <div className={styles.grid}>
          {filteredPatients.map((patient) => (
            <Card
              key={patient.id_paciente || patient.id}
              className={styles.patientCard}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  {patient.nombre?.charAt(0) || "P"}
                </div>
                <div className={styles.patientInfo}>
                  <h3 className={styles.patientName}>
                    {patient.nombre} {patient.apellido}
                  </h3>
                  <div className={styles.patientMeta}>
                    <span className={styles.patientCI}>CI: {patient.ci}</span>
                    {patient.email && (
                      <span className={styles.patientEmail}>
                        {patient.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.cardContent}>
                {patient.direccion && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoText}>{patient.direccion}</span>
                  </div>
                )}
                {patient.telefono && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoText}>{patient.telefono}</span>
                  </div>
                )}
                {patient.alergias && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoText}>
                      Alergias: {patient.alergias}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.actions}>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleSelectPatient(patient)}
                    className={styles.actionButton}>
                    Ver detalles
                  </Button>

                  {canAssignGestor && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() =>
                        openAsignarGestor(patient.id_paciente || patient.id)
                      }
                      className={styles.actionButton}>
                      Asignar gestor
                    </Button>
                  )}

                  {canCreatePlan && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() =>
                        openCrearPlanWithPatient(
                          patient.id_paciente || patient.id
                        )
                      }
                      className={styles.actionButton}>
                      Crear plan
                    </Button>
                  )}

                  {isMedico && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() =>
                        openRegistroWithPatient(
                          patient.id_paciente || patient.id
                        )
                      }
                      className={styles.actionButton}>
                      Nuevo Registro
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredPatients.length > 0 && (
        <div className={styles.footer}>
          <div className={styles.stats}>
            <span className={styles.stat}>
              {filteredPatients.length} paciente
              {filteredPatients.length !== 1 ? "s" : ""}
            </span>
            {searchQuery && (
              <span className={styles.statHint}>
                Filtrados por: "{searchQuery}"
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
