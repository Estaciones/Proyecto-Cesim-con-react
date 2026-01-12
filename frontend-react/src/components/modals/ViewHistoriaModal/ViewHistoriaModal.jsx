import React from "react";
import Modal from "../Modal/Modal";
import { useModal } from "../../../hooks/useModal";
import styles from "./ViewHistoriaModal.module.css"; // Usaré los mismos estilos que ViewPaciente

export default function ViewHistoriaModal() {
  const { modals, closeModal, modalData } = useModal();

  const open = !!modals.viewHistoria;
  const record = modalData.viewHistoria?.currentViewHistoria;

  console.log("📋 ViewHistoriaModal - Datos recibidos:", record);

  const formatDate = (dateString) => {
    if (!dateString) return "No disponible";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const getTipoLabel = (tipo) => {
    const tipos = {
      general: "General",
      consulta: "Consulta",
      evaluacion: "Evaluación",
      seguimiento: "Seguimiento",
      tratamiento: "Tratamiento",
      diagnostico: "Diagnóstico"
    };
    return tipos[tipo] || tipo || "No especificado";
  };

  if (!record) {
    return (
      <Modal
        open={open}
        onClose={() => closeModal("viewHistoria")}
        title="Registro de Historia Clínica"
        size="lg"
      >
        <div className={styles.container}>
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>⚠️</span>
            <h3>No hay datos del registro</h3>
            <p>No se pudo cargar la información del registro.</p>
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => closeModal("viewHistoria")}
              className={styles.closeButton}
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={() => closeModal("viewHistoria")}
      title={`Registro de Historia Clínica: ${record.titulo || "Sin título"}`}
      size="lg"
    >
      <div className={styles.container}>
        {/* Información del Registro */}
        <div className={styles.patientInfoHeader}>
          <div className={styles.patientBasicInfo}>
            <h4 className={styles.patientName}>
              {record.titulo || "Registro sin título"}
            </h4>
            <p className={styles.patientCI}>
              <span className={styles.infoLabel}>ID:</span> {record.id_registro || record.id || "No especificado"}
            </p>
          </div>
        </div>

        {/* Sección 1: Información Básica */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📋</span>
            Información del Registro
          </h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tipo de Registro</label>
              <div className={styles.readonlyField}>
                {getTipoLabel(record.tipo)}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Fecha de Creación</label>
              <div className={styles.readonlyField}>
                {formatDate(record.fecha_creacion)}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Última Actualización</label>
              <div className={styles.readonlyField}>
                {record.fecha_actualizacion && record.fecha_actualizacion !== record.fecha_creacion
                  ? formatDate(record.fecha_actualizacion)
                  : "Sin actualizaciones"}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Médico Responsable</label>
              <div className={styles.readonlyField}>
                {record.medico_ci || "No especificado"}
              </div>
            </div>
          </div>
        </div>

        {/* Sección 2: Descripción del Registro */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📄</span>
            Descripción del Registro
          </h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>Descripción Detallada</label>
            <div className={`${styles.readonlyField} ${styles.descriptionField}`}>
              {record.descripcion ? (
                <div className={styles.descriptionContent}>
                  {record.descripcion.split("\n").map((line, index) => (
                    <p key={index} className={styles.descriptionParagraph}>
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                "Sin descripción"
              )}
            </div>
          </div>
        </div>

        {/* Sección 3: Estadísticas del Contenido */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📊</span>
            Estadísticas del Contenido
          </h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Caracteres</label>
              <div className={styles.readonlyField}>
                {record.descripcion?.length || 0} caracteres
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Líneas</label>
              <div className={styles.readonlyField}>
                {record.descripcion?.split('\n').length || 0} líneas
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Tipo de Contenido</label>
              <div className={styles.readonlyField}>
                {record.descripcion?.length > 0 ? "Con texto" : "Sin texto"}
              </div>
            </div>
          </div>
        </div>

        {/* Acciones del modal */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => closeModal("viewHistoria")}
            className={styles.closeButton}
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}