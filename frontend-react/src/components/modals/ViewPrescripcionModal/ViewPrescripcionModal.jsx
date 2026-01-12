import React from "react";
import Modal from "../Modal/Modal";
import { useModal } from "../../../hooks/useModal";
import { useAuthContext } from "../../../context/AuthContext";
import styles from "./ViewPrescripcionModal.module.css";

export default function ViewPrescripcionModal() {
  const { modals, getModalData, closeModal, openEditPrescripcion } = useModal();
  const { profile } = useAuthContext();

  const open = !!modals.viewPres;
  const payload = getModalData("viewPres") || {};
  const currentViewPres = payload.currentViewPres || null;

  if (!open) return null;

  if (!currentViewPres) {
    return (
      <Modal 
        open={open} 
        onClose={() => closeModal("viewPres")} 
        title="Prescripción"
        size="md"
      >
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando información de la prescripción...</p>
        </div>
      </Modal>
    );
  }

  const isGestor = profile?.tipo_usuario === "gestor_casos" || 
                  (typeof profile?.tipo_usuario === "string" && profile.tipo_usuario.includes("gestor"));
  const isMedico = profile?.tipo_usuario === "medico";

  const toBool = (v) => {
    if (v === true || v === 1) return true;
    if (v === false || v === 0) return false;
    if (typeof v === "string") {
      const s = v.trim().toLowerCase();
      if (s === "true" || s === "1") return true;
      if (s === "false" || s === "0" || s === "") return false;
    }
    return Boolean(v);
  };

  const handleEdit = () => {
    openEditPrescripcion(currentViewPres);
  };

  // eslint-disable-next-line no-unused-vars
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
      return dateString;
    }
  };

  const getCumplimientoColor = (cumplimiento) => {
    return toBool(cumplimiento) ? "#27ae60" : "#e74c3c";
  };

  const getCumplimientoLabel = (cumplimiento) => {
    return toBool(cumplimiento) ? "Cumplido" : "No cumplido";
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      "Tratamiento": "💉",
      "Indicacion": "📋",
      "Medicacion": "💊",
      "Ejercicio": "🏃",
      "Dieta": "🍎",
      "default": "📝"
    };
    return icons[tipo] || icons["default"];
  };

  const tipo = currentViewPres.tipo || "Prescripción";
  const tipoIcon = getTipoIcon(tipo);

  return (
    <Modal
      open={open}
      onClose={() => closeModal("viewPres")}
      title={`${tipo} - Detalles`}
      size="md"
    >
      <div className={styles.content}>
        {/* Encabezado */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <div className={styles.tipoDisplay}>
                <span className={styles.tipoIcon}>{tipoIcon}</span>
                <h1 className={styles.title}>{tipo}</h1>
              </div>
              <div className={styles.subtitle}>
                <span 
                  className={styles.cumplimientoBadge}
                  style={{ backgroundColor: getCumplimientoColor(currentViewPres.cumplimiento) }}
                >
                  {getCumplimientoLabel(currentViewPres.cumplimiento)}
                </span>
                {currentViewPres.id_prescripcion && (
                  <span className={styles.idBadge}>ID: {currentViewPres.id_prescripcion}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ... resto del componente sin cambios funcionales ... */}

        <div className={styles.actionsSection}>
          <div className={styles.actions}>
            {isGestor && (
              <button
                type="button"
                onClick={handleEdit}
                className={styles.editButton}
              >
                <span className={styles.buttonIcon}>✏️</span>
                Editar Prescripción
              </button>
            )}
            
            {(isMedico && !isGestor) && (
              <button
                type="button"
                onClick={() => {
                  // Aquí normalmente llamarías a una función para ver el plan completo
                }}
                className={styles.viewPlanButton}
              >
                <span className={styles.buttonIcon}>📋</span>
                Ver Plan Completo
              </button>
            )}
            
            <button
              type="button"
              onClick={() => closeModal("viewPres")}
              className={styles.closeButton}
            >
              <span className={styles.buttonIcon}>✕</span>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
