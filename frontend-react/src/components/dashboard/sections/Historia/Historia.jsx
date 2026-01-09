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
  const { openRegistroWithPatient } = useModal()
  const { historia, loading, error, fetchHistoria } = useHistory()

  const isPaciente = useMemo(
    () => profile?.tipo_usuario === "paciente",
    [profile]
  )
  
  const canEditHistoria = useMemo(
    () => profile?.tipo_usuario === "medico",
    [profile]
  )

  const loadHistoria = useCallback(
    async (signal) => {
      console.log("📥 Historia - load function called", {
        selectedPatientId: selectedPatient?.id_paciente,
        profileType: profile?.tipo_usuario
      })

      const params = {}
      if (selectedPatient?.ci) {
        params.ci = selectedPatient.ci
      } else if (selectedPatient?.id_paciente) {
        params.id_paciente = selectedPatient.id_paciente
      } else if (isPaciente) {
        if (profile?.ci) params.ci = profile.ci
        else if (profile?.id_paciente) params.id_paciente = profile.id_paciente
      }

      console.log("📥 Historia - fetch params:", params)
      return fetchHistoria(params, { signal })
    },
    [selectedPatient, profile, isPaciente, fetchHistoria]
  )

  useEffect(() => {
    console.log("🎯 Historia - useEffect ejecutándose")
    const controller = new AbortController()

    // Determinar si hay parámetros válidos antes de llamar
    const hasParams =
      selectedPatient?.ci ||
      selectedPatient?.id_paciente ||
      (isPaciente && (profile?.ci || profile?.id_paciente))

    console.log("🔍 Historia - hasParams check:", {
      hasParams,
      selectedPatientCI: selectedPatient?.ci,
      selectedPatientId: selectedPatient?.id_paciente,
      isPaciente,
      profileCI: profile?.ci,
      profilePacienteId: profile?.id_paciente
    })

    if (!hasParams) {
      console.log("⏭️ Historia - No hay parámetros válidos, omitiendo fetch")
      return () => controller.abort()
    }

    console.log("🚀 Historia - Iniciando fetch de historia")
    loadHistoria(controller.signal).catch((err) => {
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
  }, [loadHistoria, selectedPatient, profile, isPaciente])

  const formatShortDate = useCallback((dateString) => {
    if (!dateString) return ""
    const d = new Date(dateString)
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }, [])

  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return ""
    const d = new Date(dateString)
    return d.toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }, [])

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
      const pacienteId = Number(selectedPatient.id_paciente)
      console.log("🎯 Historia - ID convertido a número:", pacienteId)
      openRegistroWithPatient(pacienteId)
    }
  }, [selectedPatient, openRegistroWithPatient])

  const getTipoIcon = (tipo) => {
    const icons = {
      "consulta": "🩺",
      "evaluacion": "📊",
      "seguimiento": "📋",
      "tratamiento": "💊",
      "diagnostico": "🔍",
      "default": "📝"
    }
    return icons[tipo] || icons["default"]
  }

  const getTipoLabel = (tipo) => {
    const tipos = {
      "general": "General",
      "consulta": "Consulta",
      "evaluacion": "Evaluación",
      "seguimiento": "Seguimiento",
      "tratamiento": "Tratamiento",
      "diagnostico": "Diagnóstico"
    }
    return tipos[tipo] || tipo || "General"
  }

  const getTipoColor = (tipo) => {
    const colors = {
      "general": "#6c8981",
      "consulta": "#3498db",
      "evaluacion": "#9b59b6",
      "seguimiento": "#2ecc71",
      "tratamiento": "#e67e22",
      "diagnostico": "#e74c3c"
    }
    return colors[tipo] || colors["general"]
  }

  console.log("📊 Historia - Estado actual:", {
    historiaCount: historia?.length || 0,
    loading,
    error: error ? error.substring(0, 100) : null,
    selectedPatient: selectedPatient?.id_paciente,
    canEditHistoria
  })

  return (
    <section className={styles.container}>
      {/* Encabezado */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              <span className={styles.titleIcon}>📋</span>
              {isPaciente ? "Mi Historia Clínica" : "Historia Clínica"}
            </h1>
            
            {selectedPatient && !isPaciente && (
              <div className={styles.patientInfo}>
                <div className={styles.patientAvatar}>
                  {selectedPatient.nombre?.charAt(0) || "P"}
                </div>
                <div className={styles.patientDetails}>
                  <span className={styles.patientName}>
                    {selectedPatient.nombre} {selectedPatient.apellido}
                  </span>
                  <span className={styles.patientCI}>
                    CI: {selectedPatient.ci}
                  </span>
                </div>
              </div>
            )}
          </div>

          {canEditHistoria && (
            <div className={styles.actions}>
              <Button
                variant="primary"
                onClick={handleNuevoRegistro}
                className={styles.addButton}
                disabled={loading || !selectedPatient}
                title={!selectedPatient ? "Selecciona un paciente primero" : "Crear nuevo registro"}
              >
                <span className={styles.addIcon}>+</span>
                Nuevo Registro
              </Button>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        {!loading && !error && historia?.length > 0 && (
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>📋</span>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{historia.length}</span>
                <span className={styles.statLabel}>registros</span>
              </div>
            </div>
            
            <div className={styles.statItem}>
              <span className={styles.statIcon}>📅</span>
              <div className={styles.statContent}>
                <span className={styles.statValue}>
                  {formatShortDate(historia[0]?.fecha_creacion)}
                </span>
                <span className={styles.statLabel}>más reciente</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contenido Principal */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Cargando historia clínica...</p>
          </div>
        ) : error ? (
          <Card className={styles.errorCard}>
            <div className={styles.errorContent}>
              <span className={styles.errorIcon}>⚠️</span>
              <h3 className={styles.errorTitle}>Error al cargar</h3>
              <p className={styles.errorMessage}>{String(error)}</p>
            </div>
          </Card>
        ) : !historia || historia.length === 0 ? (
          <Card className={styles.emptyCard}>
            <div className={styles.emptyContent}>
              <span className={styles.emptyIcon}>📝</span>
              <h3 className={styles.emptyTitle}>
                {isPaciente 
                  ? "Aún no hay registros en tu historia clínica" 
                  : "No hay registros para este paciente"}
              </h3>
              <p className={styles.emptyDescription}>
                {isPaciente
                  ? "Los registros médicos aparecerán aquí cuando sean creados por tu médico."
                  : "Puedes comenzar a agregar registros médicos para este paciente."}
              </p>
              {canEditHistoria && selectedPatient && (
                <Button
                  variant="primary"
                  onClick={handleNuevoRegistro}
                  className={styles.emptyAction}
                >
                  Crear Primer Registro
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className={styles.recordsGrid}>
            {historia.map((record) => (
              <Card
                key={record.id_registro || record.id}
                className={styles.recordCard}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.recordType}>
                    <span 
                      className={styles.typeIcon}
                      style={{ color: getTipoColor(record.tipo) }}
                    >
                      {getTipoIcon(record.tipo)}
                    </span>
                    <span 
                      className={styles.typeBadge}
                      style={{ backgroundColor: getTipoColor(record.tipo) }}
                    >
                      {getTipoLabel(record.tipo)}
                    </span>
                  </div>
                  
                  <div className={styles.cardActions}>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => console.log("Ver registro:", record.id)}
                      className={styles.actionButton}
                    >
                      <span className={styles.actionIcon}>👁️</span>
                      Ver
                    </Button>
                    {canEditHistoria && (
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => console.log("Editar registro:", record.id)}
                        className={styles.actionButton}
                      >
                        <span className={styles.actionIcon}>✏️</span>
                        Editar
                      </Button>
                    )}
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.recordTitle}>{record.titulo}</h3>
                  
                  <p className={styles.recordDescription}>
                    {(record.descripcion || "").length > 180
                      ? `${(record.descripcion || "").slice(0, 180)}...`
                      : record.descripcion || "Sin descripción"}
                  </p>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.recordMeta}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>📅</span>
                      <span className={styles.metaText}>
                        Creado: {formatDateTime(record.fecha_creacion)}
                      </span>
                    </div>
                    
                    {record.fecha_actualizacion && 
                     record.fecha_actualizacion !== record.fecha_creacion && (
                      <div className={styles.metaItem}>
                        <span className={styles.metaIcon}>🔄</span>
                        <span className={styles.metaText}>
                          Actualizado: {formatDateTime(record.fecha_actualizacion)}
                        </span>
                      </div>
                    )}
                  </div>

                  {record.medico_ci && (
                    <div className={styles.recordAuthor}>
                      <span className={styles.authorIcon}>👨‍⚕️</span>
                      <span className={styles.authorText}>
                        Dr. {record.medico_ci}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}