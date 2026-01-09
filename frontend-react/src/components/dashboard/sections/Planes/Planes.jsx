import React, { useEffect, useCallback, useMemo, useState } from "react"
import { useAuthContext } from "../../../../context/AuthContext"
import { useModal } from "../../../../hooks/useModal"
import { usePlans } from "../../../../hooks/usePlans"
import Button from "../../../ui/Button/Button"
import Card from "../../../ui/Card/Card"
import styles from "./Planes.module.css"

export default function Planes({ selectedPatient }) {
  const { profile } = useAuthContext()
  const { openCrearPlanWithPatient, openViewPlan } = useModal()
  const { plans, loading, error, fetchPlans } = usePlans()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlan, setSelectedPlan] = useState(null)

  const isPaciente = useMemo(() => profile?.tipo_usuario === "paciente", [profile])
  const isMedico = useMemo(() => profile?.tipo_usuario === "medico", [profile])
  const isGestor = useMemo(() => 
    profile?.tipo_usuario === "gestor_casos" || 
    (typeof profile?.tipo_usuario === "string" && profile.tipo_usuario.includes("gestor")),
    [profile]
  )

  const buildParams = useCallback(() => {
    const params = {}
    
    if (selectedPatient?.ci) {
      params.ci = selectedPatient.ci
    } else if (selectedPatient?.id_paciente) {
      params.id_paciente = selectedPatient.id_paciente
    } else if (isPaciente) {
      if (profile?.ci) params.ci = profile.ci
      else if (profile?.id_paciente) params.id_paciente = profile.id_paciente
    } else if (isMedico) {
      params.medico_id = profile?.id_usuario
    } else if (isGestor) {
      params.gestor_id = profile?.id_usuario
    }

    return params
  }, [selectedPatient, profile, isPaciente, isMedico, isGestor])

  useEffect(() => {
    const controller = new AbortController()
    const params = buildParams()

    const hasValidParams = 
      params.ci || 
      params.id_paciente || 
      params.medico_id || 
      params.gestor_id

    if (!hasValidParams) {
      console.log("⏭️ Planes - No hay parámetros válidos, omitiendo fetch")
      return () => controller.abort()
    }

    console.log("🚀 Planes - Iniciando fetch con params:", params)
    
    fetchPlans(params, { signal: controller.signal }).catch((err) => {
      if (err?.name !== "AbortError") {
        console.error("❌ Planes - Error fetching plans:", err)
      }
    })

    return () => controller.abort()
  }, [fetchPlans, buildParams])

  const handleViewPlan = useCallback((plan) => {
    console.log("👁️ Planes - Ver plan:", plan.id_plan)
    openViewPlan(plan)
  }, [openViewPlan])

  const handleCreatePlan = useCallback(() => {
    if (selectedPatient?.id_paciente) {
      openCrearPlanWithPatient(selectedPatient.id_paciente)
    } else {
      openCrearPlanWithPatient(undefined)
    }
  }, [selectedPatient, openCrearPlanWithPatient])

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "No definida"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    } catch {
      return "Fecha inválida"
    }
  }, [])

  const getStatusBadge = (estado) => {
    const isActive = estado === true || estado === "activo" || estado === 1
    
    return (
      <span 
        className={`${styles.statusBadge} ${isActive ? styles.statusActive : styles.statusInactive}`}
        title={isActive ? "Plan activo" : "Plan inactivo"}
      >
        {isActive ? "Activo" : "Inactivo"}
      </span>
    )
  }

  const getPlanIcon = (tipo) => {
    const icons = {
      "rehabilitacion": "🏃",
      "postoperatorio": "🩹",
      "medicacion": "💊",
      "dieta": "🍎",
      "ejercicio": "💪",
      "default": "📋"
    }
    
    return icons[tipo] || icons["default"]
  }

  const getPlanColor = (estado) => {
    return estado ? "#27ae60" : "#e74c3c"
  }

  const filteredPlans = useMemo(() => {
    if (!Array.isArray(plans)) return []
    const query = searchQuery.trim().toLowerCase()
    if (!query) return plans

    return plans.filter((plan) => {
      if (!plan) return false
      
      const searchString = `
        ${plan.titulo || ""} 
        ${plan.descripcion || ""}
        ${plan.medico_ci || ""}
      `.toLowerCase()
      
      return searchString.includes(query)
    })
  }, [plans, searchQuery])

  console.log("📊 Planes - Estado actual:", {
    plansCount: filteredPlans.length,
    loading,
    error: error ? error.substring(0, 100) : null,
    selectedPatient: selectedPatient?.id_paciente
  })

  return (
    <section className={styles.container}>
      {/* Encabezado */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              <span className={styles.titleIcon}>💊</span>
              {isPaciente ? "Mis Planes de Tratamiento" : "Planes de Tratamiento"}
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

          <div className={styles.headerActions}>
            {/* Barra de Búsqueda */}
            <div className={styles.searchContainer}>
              <div className={styles.searchWrapper}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Buscar por título, descripción o médico..."
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
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Botón Crear Plan (solo para médicos) */}
            {isMedico && (
              <Button
                variant="primary"
                onClick={handleCreatePlan}
                className={styles.createButton}
                disabled={loading}
                title={selectedPatient ? 
                  `Crear plan para ${selectedPatient.nombre}` : 
                  "Crear plan general"
                }
              >
                <span className={styles.buttonIcon}>+</span>
                Crear Plan
              </Button>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        {!loading && !error && filteredPlans.length > 0 && (
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>📋</span>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{filteredPlans.length}</span>
                <span className={styles.statLabel}>planes</span>
              </div>
            </div>
            
            <div className={styles.statItem}>
              <span className={styles.statIcon}>✅</span>
              <div className={styles.statContent}>
                <span className={styles.statValue}>
                  {filteredPlans.filter(p => p.estado).length}
                </span>
                <span className={styles.statLabel}>activos</span>
              </div>
            </div>
            
            <div className={styles.statItem}>
              <span className={styles.statIcon}>💊</span>
              <div className={styles.statContent}>
                <span className={styles.statValue}>
                  {filteredPlans.reduce((acc, plan) => 
                    acc + (Array.isArray(plan.prescripciones) ? plan.prescripciones.length : 0), 0
                  )}
                </span>
                <span className={styles.statLabel}>prescripciones</span>
              </div>
            </div>
            
            {searchQuery && (
              <div className={styles.statItem}>
                <span className={styles.statIcon}>🔍</span>
                <div className={styles.statContent}>
                  <span className={styles.statValue}>"{searchQuery}"</span>
                  <span className={styles.statLabel}>búsqueda</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contenido Principal */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Cargando planes de tratamiento...</p>
          </div>
        ) : error ? (
          <Card className={styles.errorCard}>
            <div className={styles.errorContent}>
              <span className={styles.errorIcon}>⚠️</span>
              <h3 className={styles.errorTitle}>Error al cargar</h3>
              <p className={styles.errorMessage}>{String(error)}</p>
              <Button
                variant="secondary"
                onClick={() => fetchPlans(buildParams())}
                className={styles.retryButton}
              >
                Reintentar
              </Button>
            </div>
          </Card>
        ) : filteredPlans.length === 0 ? (
          <Card className={styles.emptyCard}>
            <div className={styles.emptyContent}>
              <span className={styles.emptyIcon}>
                {searchQuery ? "🔍" : "📋"}
              </span>
              <h3 className={styles.emptyTitle}>
                {searchQuery ? "No se encontraron planes" : "No hay planes de tratamiento"}
              </h3>
              <p className={styles.emptyDescription}>
                {searchQuery
                  ? "No hay planes que coincidan con tu búsqueda."
                  : isPaciente
                  ? "Aún no tienes planes de tratamiento asignados."
                  : "No hay planes para este paciente."}
              </p>
              {isMedico && !searchQuery && (
                <Button
                  variant="primary"
                  onClick={handleCreatePlan}
                  className={styles.emptyAction}
                >
                  Crear Primer Plan
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className={styles.plansGrid}>
            {filteredPlans.map((plan) => (
              <Card
                key={plan.id_plan}
                className={`${styles.planCard} ${
                  selectedPlan?.id_plan === plan.id_plan ? styles.selected : ""
                }`}
                onClick={() => setSelectedPlan(plan)}
              >
                {/* Encabezado del Plan */}
                <div className={styles.cardHeader}>
                  <div className={styles.planIcon} style={{ color: getPlanColor(plan.estado) }}>
                    {getPlanIcon(plan.tipo)}
                  </div>
                  
                  <div className={styles.planTitleSection}>
                    <h3 className={styles.planTitle} title={plan.titulo}>
                      {plan.titulo}
                    </h3>
                    <div className={styles.planMeta}>
                      {getStatusBadge(plan.estado)}
                      {plan.medico_ci && (
                        <span className={styles.planMedico}>
                          <span className={styles.metaIcon}>👨‍⚕️</span>
                          Dr. {plan.medico_ci}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Descripción del Plan */}
                <div className={styles.cardBody}>
                  <p className={styles.planDescription}>
                    {plan.descripcion || "Sin descripción"}
                  </p>

                  {/* Fechas */}
                  <div className={styles.planDates}>
                    <div className={styles.dateItem}>
                      <span className={styles.dateIcon}>📅</span>
                      <div className={styles.dateContent}>
                        <span className={styles.dateLabel}>Inicio:</span>
                        <span className={styles.dateValue}>{formatDate(plan.fecha_inicio)}</span>
                      </div>
                    </div>
                    
                    {plan.fecha_fin && (
                      <div className={styles.dateItem}>
                        <span className={styles.dateIcon}>🏁</span>
                        <div className={styles.dateContent}>
                          <span className={styles.dateLabel}>Fin estimado:</span>
                          <span className={styles.dateValue}>{formatDate(plan.fecha_fin)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Prescripciones */}
                  <div className={styles.prescriptionsSection}>
                    <div className={styles.prescriptionsHeader}>
                      <span className={styles.prescriptionsIcon}>💊</span>
                      <span className={styles.prescriptionsTitle}>Prescripciones</span>
                      <span className={styles.prescriptionsCount}>
                        {Array.isArray(plan.prescripciones) ? plan.prescripciones.length : 0}
                      </span>
                    </div>
                    
                    {Array.isArray(plan.prescripciones) && plan.prescripciones.length > 0 ? (
                      <div className={styles.prescriptionsList}>
                        {plan.prescripciones.slice(0, 3).map((pres, index) => (
                          <div key={index} className={styles.prescriptionItem}>
                            <span className={styles.prescriptionIcon}>•</span>
                            <span className={styles.prescriptionText} title={pres.descripcion}>
                              {pres.tipo || "Prescripción"}: {pres.descripcion?.slice(0, 60)}
                              {pres.descripcion?.length > 60 ? "..." : ""}
                            </span>
                          </div>
                        ))}
                        {plan.prescripciones.length > 3 && (
                          <div className={styles.morePrescriptions}>
                            +{plan.prescripciones.length - 3} más...
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={styles.noPrescriptions}>
                        No hay prescripciones en este plan.
                      </div>
                    )}
                  </div>

                  {/* Resumen de Egreso */}
                  {plan.resumen_egreso && (
                    <div className={styles.egresoSection}>
                      <div className={styles.egresoHeader}>
                        <span className={styles.egresoIcon}>✅</span>
                        <span className={styles.egresoTitle}>Resumen de Egreso</span>
                      </div>
                      <p className={styles.egresoText}>
                        {plan.resumen_egreso.slice(0, 100)}
                        {plan.resumen_egreso.length > 100 ? "..." : ""}
                      </p>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className={styles.cardFooter}>
                  <div className={styles.footerActions}>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewPlan(plan)
                      }}
                      className={styles.actionButton}
                    >
                      <span className={styles.buttonIcon}>👁️</span>
                      Ver Detalles
                    </Button>

                    {(isMedico || isGestor) && (
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log("Editar plan:", plan.id_plan)
                        }}
                        className={styles.actionButton}
                      >
                        <span className={styles.buttonIcon}>✏️</span>
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}