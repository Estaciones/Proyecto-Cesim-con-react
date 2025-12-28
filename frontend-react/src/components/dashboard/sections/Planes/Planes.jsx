import React, { useEffect, useCallback, useMemo } from "react"
import { useAuthContext } from "../../../../context/AuthContext"
import { useModal } from "../../../../hooks/useModal"
import { usePlans } from "../../../../hooks/usePlans"
import Button from "../../../ui/Button/Button"
import Card from "../../../ui/Card/Card"
import styles from "./Planes.module.css"

export default function Planes({ selectedPatient }) {
  const { profile } = useAuthContext()
  const { openModal, openCrearPlanWithPatient } = useModal()

  // hook centralizado
  const { plans, loading, error, fetchPlans } = usePlans()

  // Construir parámetros de búsqueda
  const buildParams = useCallback(() => {
    const params = {}
    if (selectedPatient?.ci) {
      params.ci = selectedPatient.ci
    } else if (selectedPatient?.id_paciente) {
      params.id_paciente = selectedPatient.id_paciente
    } else if (profile?.tipo_usuario === "paciente") {
      if (profile.ci) params.ci = profile.ci
      else if (profile.id_paciente) params.id_paciente = profile.id_paciente
    }
    return params
  }, [selectedPatient, profile])

  // carga inicial con abort controller
  useEffect(() => {
    const params = buildParams()
    // Solo hacer fetch si hay parámetros válidos
    if (!params.ci && !params.id_paciente) {
      // Si no hay parámetros, no hacemos la llamada
      return
    }

    const controller = new AbortController()
    // Llamada con signal: le decimos al hook que NO reutilice la promesa existente
    fetchPlans(params, { signal: controller.signal }).catch((err) => {
      if (err && err.name === "AbortError") {
        console.log("Planes.jsx - fetch aborted (expected in dev StrictMode)")
      } else {
        console.error("Planes.jsx - fetchPlans error:", err)
      }
    })

    return () => {
      controller.abort()
    }
  }, [fetchPlans, buildParams])

  const handleViewPlan = (plan) => {
    openModal("viewPlan", { currentViewPlan: plan })
  }

  const isPaciente = useMemo(
    () => profile?.tipo_usuario === "paciente",
    [profile]
  )
  const isMedico = useMemo(() => profile?.tipo_usuario === "medico", [profile])

  // Filtrado local (opcional, si quieres agregar búsqueda en el futuro)
  const [searchQuery, setSearchQuery] = React.useState("")
  const filteredPlans = React.useMemo(() => {
    if (!Array.isArray(plans)) return []
    const q = searchQuery.trim().toLowerCase()
    if (!q) return plans
    return plans.filter((p) => {
      const s = `${p.titulo || ""} ${p.descripcion || ""}`.toLowerCase()
      return s.includes(q)
    })
  }, [plans, searchQuery])

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            {isPaciente ? "Mis Planes de Tratamiento" : "Planes de Tratamiento"}
          </h1>
          {selectedPatient && !isPaciente && (
            <div className={styles.patientBadge}>
              <span className={styles.patientName}>
                {selectedPatient.nombre} {selectedPatient.apellido}
              </span>
              <span className={styles.patientCI}>CI: {selectedPatient.ci}</span>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {/* Podrías agregar un buscador si lo deseas */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Buscar por título o descripción..."
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

          {isMedico && (
            <Button
              variant="primary"
              onClick={() =>
                selectedPatient?.id_paciente
                  ? openCrearPlanWithPatient(selectedPatient.id_paciente)
                  : openModal("crearPlan")
              }
              className={styles.addButton}
              disabled={loading}>
              Crear Plan
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando planes de tratamiento...</p>
        </div>
      ) : error ? (
        <Card className={styles.emptyCard}>
          <div className={styles.emptyState}>
            <h3>Error</h3>
            <p>{String(error)}</p>
          </div>
        </Card>
      ) : filteredPlans.length === 0 ? (
        <Card className={styles.emptyCard}>
          <div className={styles.emptyState}>
            <h3>
              {searchQuery
                ? "No se encontraron planes"
                : "No hay planes de tratamiento"}
            </h3>
            <p>
              {searchQuery
                ? "No hay planes que coincidan con tu búsqueda."
                : isPaciente
                ? "Aún no tienes planes de tratamiento asignados."
                : "No hay planes para este paciente."}
            </p>
          </div>
        </Card>
      ) : (
        <div className={styles.grid}>
          {filteredPlans.map((plan) => (
            <Card key={plan.id_plan} className={styles.planCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.planTitle}>{plan.titulo}</h3>
                <div className={styles.planStatus}>
                  <span
                    className={`${styles.statusBadge} ${
                      plan.estado ? styles.statusActive : styles.statusInactive
                    }`}>
                    {plan.estado ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <p className={styles.planDescription}>
                  {plan.descripcion || "Sin descripción"}
                </p>

                <div className={styles.planDates}>
                  <div className={styles.dateItem}>
                    <span className={styles.dateLabel}>Inicio:</span>
                    <span className={styles.dateValue}>
                      {plan.fecha_inicio
                        ? new Date(plan.fecha_inicio).toLocaleDateString(
                            "es-ES"
                          )
                        : "No definida"}
                    </span>
                  </div>
                  {plan.fecha_fin && (
                    <div className={styles.dateItem}>
                      <span className={styles.dateLabel}>Fin:</span>
                      <span className={styles.dateValue}>
                        {new Date(plan.fecha_fin).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.planMeta}>
                  <span className={styles.metaItem}>
                    📋 {plan.prescripciones?.length || 0} prescripciones
                  </span>
                  {plan.medico_ci && (
                    <span className={styles.metaItem}>👨‍⚕️ {plan.medico_ci}</span>
                  )}
                </div>
              </div>

              <div className={styles.cardActions}>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handleViewPlan(plan)}>
                  Ver detalles
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredPlans.length > 0 && (
        <div className={styles.footer}>
          <div className={styles.stats}>
            <span className={styles.stat}>
              {filteredPlans.length} plan
              {filteredPlans.length !== 1 ? "es" : ""}
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
