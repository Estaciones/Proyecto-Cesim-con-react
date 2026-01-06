import React, { useEffect, useCallback, useMemo } from "react"
import { useAuthContext } from "../../../../context/AuthContext"
import { useModal } from "../../../../hooks/useModal"
import { useHistory } from "../../../../hooks/useHistory"
import Button from "../../../ui/Button/Button"
import Card from "../../../ui/Card/Card"
import styles from "./Historia.module.css"

export default function Historia({ selectedPatient }) {
  console.log("🟢 Historia - RENDER", {
    selectedPatientId: selectedPatient?.id_paciente,
    // eslint-disable-next-line react-hooks/purity
    timestamp: Date.now()
  })

  const { profile } = useAuthContext()
  const {
    openModal,
    openViewHistoria,
    openEditHistoria,
    openRegistroWithPatient
  } = useModal()

  // Hook centralizado
  const { historia, loading, error, fetchHistoria } = useHistory()

  const load = useCallback(
    async (signal) => {
      console.log("📥 Historia - load function called", {
        selectedPatientId: selectedPatient?.id_paciente,
        profileType: profile?.tipo_usuario
      })

      const params = {}
      if (selectedPatient?.ci) params.ci = selectedPatient.ci
      else if (selectedPatient?.id_paciente)
        params.id_paciente = selectedPatient.id_paciente
      else if (profile?.tipo_usuario === "paciente") {
        if (profile.ci) params.ci = profile.ci
        else if (profile.id_paciente) params.id_paciente = profile.id_paciente
      }

      console.log("📥 Historia - fetch params:", params)
      return fetchHistoria(params, { signal })
    },
    [selectedPatient, profile, fetchHistoria]
  )

  useEffect(() => {
    console.log("🎯 Historia - useEffect ejecutándose")
    const controller = new AbortController()

    // Determinar si hay parámetros válidos antes de llamar
    const hasParams =
      selectedPatient?.ci ||
      selectedPatient?.id_paciente ||
      (profile?.tipo_usuario === "paciente" &&
        (profile.ci || profile.id_paciente))

    console.log("🔍 Historia - hasParams check:", {
      hasParams,
      selectedPatientCI: selectedPatient?.ci,
      selectedPatientId: selectedPatient?.id_paciente,
      profileType: profile?.tipo_usuario,
      profileCI: profile?.ci,
      profilePacienteId: profile?.id_paciente
    })

    if (!hasParams) {
      console.log("⏭️ Historia - No hay parámetros válidos, omitiendo fetch")
      return () => controller.abort()
    }

    console.log("🚀 Historia - Iniciando fetch de historia")
    load(controller.signal).catch((err) => {
      if (err?.name !== "AbortError") {
        console.error("❌ Historia - Error loading historia:", err)
      } else {
        console.log("⏹️ Historia - Fetch abortado")
      }
    })

    return () => {
      console.log("🧹 Historia - Cleanup, aborting controller")
      controller.abort()
    }
  }, [load, selectedPatient, profile])

  const formatShortDate = useCallback((dateString) => {
    if (!dateString) return ""
    const d = new Date(dateString)
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }, [])

  const isPaciente = useMemo(
    () => profile?.tipo_usuario === "paciente",
    [profile]
  )
  const canEditHistoria = useMemo(
    () => profile?.tipo_usuario === "medico",
    [profile]
  )

  const handleNuevoRegistro = useCallback(() => {
    console.log("🟢 Historia - Botón 'Nuevo Registro' clickeado", {
      selectedPatient: selectedPatient,
      hasId: !!selectedPatient?.id_paciente,
      idValue: selectedPatient?.id_paciente
    })

    if (selectedPatient?.id_paciente) {
      console.log(
        "🎯 Historia - Llamando openRegistroWithPatient con ID:",
        selectedPatient.id_paciente
      )
      // Convierte a número para asegurar
      const pacienteId = Number(selectedPatient.id_paciente)
      console.log("🎯 Historia - ID convertido a número:", pacienteId)
      openRegistroWithPatient(pacienteId)
    } else {
      console.log(
        "⚠️ Historia - selectedPatient no tiene id_paciente:",
        selectedPatient
      )
      console.log(
        "🎯 Historia - Llamando openModal('registro') sin paciente específico"
      )
      openModal("registro")
    }
  }, [selectedPatient, openRegistroWithPatient, openModal])

  const handleVerRegistro = useCallback(
    (record) => {
      console.log("👁️ Historia - Ver registro:", record.id_registro || record.id)
      openViewHistoria(record)
    },
    [openViewHistoria]
  )

  const handleEditarRegistro = useCallback(
    (record) => {
      console.log("✏️ Historia - Editar registro:", record.id_registro || record.id)
      openEditHistoria(record)
    },
    [openEditHistoria]
  )

  console.log("📊 Historia - Estado actual:", {
    historiaCount: historia?.length || 0,
    loading,
    error: error ? error.substring(0, 100) : null,
    selectedPatient: selectedPatient?.id_paciente,
    canEditHistoria
  })

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            {isPaciente ? "Mi Historia Clínica" : "Historia Clínica"}
          </h1>
          {selectedPatient && !isPaciente && (
            <div className={styles.patientBadge}>
              <span className={styles.patientName}>
                {selectedPatient.nombre} {selectedPatient.apellido}
              </span>
              <span className={styles.patientCI}>
                CI: {selectedPatient.ci}
              </span>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {canEditHistoria && (
            <Button
              variant="primary"
              onClick={handleNuevoRegistro}
              className={styles.addButton}
              disabled={loading}
            >
              <svg
                className={styles.addIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nuevo Registro
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando historia clínica...</p>
        </div>
      ) : error ? (
        <Card className={styles.emptyCard}>
          <div className={styles.emptyState}>
            <h3>Error</h3>
            <p>{String(error)}</p>
          </div>
        </Card>
      ) : !historia || historia.length === 0 ? (
        <Card className={styles.emptyCard}>
          <div className={styles.emptyState}>
            <svg
              className={styles.emptyIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3>Sin registros</h3>
            <p>
              {isPaciente
                ? "Aún no hay registros en tu historia clínica."
                : "No hay registros en la historia clínica para este paciente."}
            </p>
          </div>
        </Card>
      ) : (
        <div className={styles.grid}>
          {historia.map((record) => (
            <Card
              key={record.id_registro || record.id}
              className={styles.recordCard}
            >
              <div className={styles.cardHeader}>
                <h3 className={styles.recordTitle}>{record.titulo}</h3>
                <div className={styles.cardActions}>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleVerRegistro(record)}
                    className={styles.actionButton}
                  >
                    Ver
                  </Button>
                  {canEditHistoria && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handleEditarRegistro(record)}
                      className={styles.actionButton}
                    >
                      Editar
                    </Button>
                  )}
                </div>
              </div>

              <div className={styles.cardContent}>
                <p className={styles.recordDescription}>
                  {(record.descripcion || "").length > 200
                    ? `${(record.descripcion || "").slice(0, 200)}...`
                    : record.descripcion || ""}
                </p>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.meta}>
                  <div className={styles.metaItem}>
                    <span>
                      Creado: {formatShortDate(record.fecha_creacion)}
                    </span>
                  </div>
                  {record.fecha_actualizacion && (
                    <div className={styles.metaItem}>
                      <span>
                        Actualizado:{" "}
                        {formatShortDate(record.fecha_actualizacion)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}