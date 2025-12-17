// src/components/modals/ViewHistoriaModal/ViewHistoriaModal.jsx
import React from "react"
import Modal from "../Modal/Modal"
import { useModal } from "../../../hooks/useModal"
import styles from "./ViewHistoriaModal.module.css"

export default function ViewHistoriaModal() {
  const { modals, closeModal, modalData } = useModal()

  const open = modals.viewHistoria
  const { currentViewHistoria } = modalData

  const formatDate = (dateString) => {
    if (!dateString) return "No disponible"

    const date = new Date(dateString)
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getTipoLabel = (tipo) => {
    const tipos = {
      general: "General",
      consulta: "Consulta",
      evaluacion: "Evaluación",
      seguimiento: "Seguimiento",
      tratamiento: "Tratamiento",
      diagnostico: "Diagnóstico"
    }

    return tipos[tipo] || tipo || "No especificado"
  }

  if (!currentViewHistoria) return null

  return (
    <Modal
      open={open}
      onClose={() => closeModal("viewHistoria")}
      title={currentViewHistoria.titulo || "Registro de Historia Clínica"}
      size="lg">
      <div className={styles.content}>
        <div className={styles.metadata}>
          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Tipo:</span>
              <span className={styles.metaValue}>
                <span
                  className={`${styles.tipoBadge} ${
                    styles[currentViewHistoria.tipo || "general"]
                  }`}>
                  {getTipoLabel(currentViewHistoria.tipo)}
                </span>
              </span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Creado:</span>
              <span className={styles.metaValue}>
                {formatDate(currentViewHistoria.fecha_creacion)}
              </span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Última actualización:</span>
              <span className={styles.metaValue}>
                {formatDate(currentViewHistoria.fecha_actualizacion)}
              </span>
            </div>

            {currentViewHistoria.medico_ci && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Médico responsable:</span>
                <span className={styles.metaValue}>
                  {currentViewHistoria.medico_ci}
                </span>
              </div>
            )}

            {currentViewHistoria.paciente_ci && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Paciente:</span>
                <span className={styles.metaValue}>
                  {currentViewHistoria.paciente_ci}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.descriptionSection}>
          <h3 className={styles.sectionTitle}>Descripción del Registro</h3>
          <div className={styles.descriptionContent}>
            {currentViewHistoria.descripcion ? (
              <div className={styles.descriptionText}>
                {currentViewHistoria.descripcion
                  .split("\n")
                  .map((line, index) => (
                    <p key={index} className={styles.descriptionParagraph}>
                      {line}
                    </p>
                  ))}
              </div>
            ) : (
              <div className={styles.noDescription}>
                No hay descripción disponible para este registro.
              </div>
            )}
          </div>
        </div>

        {currentViewHistoria.observaciones && (
          <div className={styles.observacionesSection}>
            <h3 className={styles.sectionTitle}>Observaciones Adicionales</h3>
            <div className={styles.observacionesContent}>
              <p className={styles.observacionesText}>
                {currentViewHistoria.observaciones}
              </p>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button
            onClick={() => closeModal("viewHistoria")}
            className={styles.closeButton}>
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  )
}
