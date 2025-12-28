// src/components/modals/ViewPlanModal/ViewPlanModal.jsx
import React from "react"
import Modal from "../Modal/Modal"
import { useModal } from "../../../hooks/useModal"
import styles from "./ViewPlanModal.module.css"

export default function ViewPlanModal() {
  const { modals, closeModal, modalData } = useModal()

  const open = modals.viewPlan
  const { currentViewPlan } = modalData

  const formatDate = (dateString) => {
    if (!dateString) return "No disponible"

    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  const getEstadoLabel = (estado) => {
    // Si estado es booleano
    if (typeof estado === "boolean") {
      return estado ? "Activo" : "Inactivo"
    }

    // Si es string (para compatibilidad)
    const estados = {
      activo: "Activo",
      completado: "Completado",
      cancelado: "Cancelado",
      pendiente: "Pendiente"
    }
    return estados[estado] || estado || "No especificado"
  }

  const getEstadoClass = (estado) => {
    // Si es booleano
    if (typeof estado === "boolean") {
      return estado ? styles.estadoActivo : styles.estadoCancelado
    }

    // Si es string
    switch (estado) {
      case "activo":
        return styles.estadoActivo
      case "completado":
        return styles.estadoCompletado
      case "cancelado":
        return styles.estadoCancelado
      default:
        return styles.estadoPendiente
    }
  }

  if (!currentViewPlan) return null

  return (
    <Modal
      open={open}
      onClose={() => closeModal("viewPlan")}
      title={currentViewPlan.titulo || "Plan de Tratamiento"}
      size="lg">
      <div className={styles.content}>
        <div className={styles.planHeader}>
          <div className={styles.headerContent}>
            <div className={styles.planStatus}>
              <span
                className={`${styles.estadoBadge} ${getEstadoClass(
                  currentViewPlan.estado
                )}`}>
                {getEstadoLabel(currentViewPlan.estado)}
              </span>
            </div>

            <div className={styles.planDates}>
              <div className={styles.dateItem}>
                <span className={styles.dateLabel}>Fecha de inicio:</span>
                <span className={styles.dateValue}>
                  {formatDate(currentViewPlan.fecha_inicio)}
                </span>
              </div>

              {currentViewPlan.fecha_fin && (
                <div className={styles.dateItem}>
                  <span className={styles.dateLabel}>Fecha de fin:</span>
                  <span className={styles.dateValue}>
                    {formatDate(currentViewPlan.fecha_fin)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.metadata}>
          <div className={styles.metaGrid}>
            {currentViewPlan.medico_ci && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Médico responsable:</span>
                <span className={styles.metaValue}>
                  {currentViewPlan.medico_ci}
                </span>
              </div>
            )}

            {currentViewPlan.paciente_ci && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Paciente:</span>
                <span className={styles.metaValue}>
                  {currentViewPlan.paciente_ci}
                </span>
              </div>
            )}

            {currentViewPlan.creado_por && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Creado por:</span>
                <span className={styles.metaValue}>
                  {currentViewPlan.creado_por}
                </span>
              </div>
            )}

            {currentViewPlan.ultima_actualizacion && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Última actualización:</span>
                <span className={styles.metaValue}>
                  {new Date(
                    currentViewPlan.ultima_actualizacion
                  ).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.descriptionSection}>
          <h3 className={styles.sectionTitle}>Descripción del Plan</h3>
          <div className={styles.descriptionContent}>
            {currentViewPlan.descripcion ? (
              <div className={styles.descriptionText}>
                {currentViewPlan.descripcion.split("\n").map((line, index) => (
                  <p key={index} className={styles.descriptionParagraph}>
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <div className={styles.noDescription}>
                No hay descripción disponible para este plan.
              </div>
            )}
          </div>
        </div>

        <div className={styles.prescripcionesSection}>
          <h3 className={styles.sectionTitle}>
            Prescripciones (
            {Array.isArray(currentViewPlan.prescripciones)
              ? currentViewPlan.prescripciones.length
              : 0}
            )
          </h3>

          {Array.isArray(currentViewPlan.prescripciones) &&
          currentViewPlan.prescripciones.length > 0 ? (
            <div className={styles.prescripcionesList}>
              {currentViewPlan.prescripciones.map((pres, index) => (
                <div
                  key={pres.id_prescripcion || pres.id || index}
                  className={styles.prescripcionItem}>
                  <div className={styles.prescripcionHeader}>
                    <span className={styles.prescripcionIndex}>
                      #{index + 1}
                    </span>
                    <span className={styles.prescripcionType}>
                      {pres.tipo || "Prescripción"}
                    </span>
                    <span
                      className={`${styles.prescripcionStatus} ${
                        pres.cumplimiento
                          ? styles.statusCumplido
                          : styles.statusPendiente
                      }`}>
                      {pres.cumplimiento ? "Cumplido" : "Pendiente"}
                    </span>
                  </div>

                  <div className={styles.prescripcionContent}>
                    <p className={styles.prescripcionDescription}>
                      {pres.descripcion}
                    </p>

                    {(pres.frecuencia || pres.duracion) && (
                      <div className={styles.prescripcionMeta}>
                        {pres.frecuencia && (
                          <div className={styles.metaItem}>
                            <span className={styles.metaIcon}>🔄</span>
                            <span>{pres.frecuencia}</span>
                          </div>
                        )}

                        {pres.duracion && (
                          <div className={styles.metaItem}>
                            <span className={styles.metaIcon}>⏱️</span>
                            <span>{pres.duracion}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {pres.observaciones && (
                      <div className={styles.prescripcionObservaciones}>
                        <strong>Observaciones:</strong> {pres.observaciones}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noPrescripciones}>
              No hay prescripciones registradas para este plan.
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            onClick={() => closeModal("viewPlan")}
            className={styles.closeButton}>
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  )
}
