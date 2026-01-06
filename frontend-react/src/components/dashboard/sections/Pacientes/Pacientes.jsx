// src/components/dashboard/sections/Pacientes/Pacientes.jsx
import React, { useEffect, useCallback, useMemo, useState } from "react"
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
  const { patients, loading, error, fetchPatients } = usePatients()

  // Estado local para búsqueda
  const [searchQuery, setSearchQuery] = useState("")

  // Construir params según tipo de usuario
  const buildParams = useCallback(() => {
    const params = {}
    const tipo = profile?.tipo_usuario
    const idUsuario = profile?.id_usuario

    if (!tipo) return params

    if (tipo === "medico") {
      if (idUsuario) params.medico_id = idUsuario
    } else if (
      tipo === "gestor_casos" ||
      (typeof tipo === "string" && tipo.includes("gestor"))
    ) {
      if (idUsuario) params.gestor_id = idUsuario
    }
    // Para otros tipos, no agregamos filtros

    return params
  }, [profile])

  // carga inicial con abort controller
  useEffect(() => {
    const controller = new AbortController()
    const params = buildParams()

    // Si no hay perfil o es paciente, no hacer fetch
    if (!profile?.tipo_usuario || profile?.tipo_usuario === "paciente") {
      return
    }

    fetchPatients(params, { signal: controller.signal }).catch((err) => {
      if (err && err.name === "AbortError") {
        console.log("Fetch abortado (modo estricto)")
      } else {
        console.error("Error fetchPatients:", err)
      }
    })

    return () => controller.abort()
  }, [fetchPatients, buildParams, profile])

  const isPaciente = useMemo(
    () => profile?.tipo_usuario === "paciente",
    [profile]
  )
  
  const isMedico = useMemo(() => profile?.tipo_usuario === "medico", [profile])
  
  // Solo médicos pueden asignar gestor y crear planes
  const canAssignGestor = isMedico
  const canCreatePlan = isMedico

  const handleSelectPatient = useCallback(
    (patient, openTo = null) => {
      console.log("👤 Pacientes - Seleccionando paciente:", {
        id: patient.id_paciente,
        nombre: patient.nombre,
        openTo,
      })

      if (onSelectPatient) {
        onSelectPatient({
          id_paciente: patient.id_paciente || patient.id,
          ci: patient.ci,
          nombre: patient.nombre,
          apellido: patient.apellido,
          email: patient.email,
        })
      }

      // Determinar qué acción realizar basado en openTo
      switch (openTo) {
        case "registro":
          console.log("📝 Abriendo registro para:", patient.id_paciente)
          openRegistroWithPatient(Number(patient.id_paciente || patient.id))
          break
        case "crearPlan":
          openCrearPlanWithPatient(patient.id_paciente || patient.id)
          break
        case "asignarGestor":
          openAsignarGestor(patient.id_paciente || patient.id)
          break
        default:
          // Solo "Ver detalles" - no abrir ningún modal
          break
      }
    },
    [onSelectPatient, openRegistroWithPatient, openCrearPlanWithPatient, openAsignarGestor]
  )

  // filtrado local
  const filteredPatients = useMemo(() => {
    if (!Array.isArray(patients)) return []
    const q = searchQuery.trim().toLowerCase()
    if (!q) return patients
    
    return patients.filter((p) => {
      const searchString = `${p.nombre || ""} ${p.apellido || ""} ${p.ci || ""} ${
        p.email || ""
      }`.toLowerCase()
      return searchString.includes(q)
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
                aria-label="Limpiar búsqueda"
              >
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
              className={styles.patientCard}
            >
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
                    className={styles.actionButton}
                  >
                    Ver detalles
                  </Button>

                  {/* Botón de Asignar Gestor (solo para médicos) */}
                  {canAssignGestor && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handleSelectPatient(patient, "asignarGestor")}
                      className={styles.actionButton}
                    >
                      Asignar gestor
                    </Button>
                  )}

                  {/* Botón de Crear Plan (solo para médicos) */}
                  {canCreatePlan && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handleSelectPatient(patient, "crearPlan")}
                      className={styles.actionButton}
                    >
                      Crear plan
                    </Button>
                  )}

                  {/* Botón de Nuevo Registro (solo para médicos) */}
                  {isMedico && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handleSelectPatient(patient, "registro")}
                      className={styles.actionButton}
                    >
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