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

  if (open && !currentViewPres) {
    return (
      <Modal open={open} onClose={() => closeModal("viewPres")} title="Prescripción" size="md">
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Cargando información de la prescripción...</p>
        </div>
      </Modal>
    );
  }

  const isGestor =
    profile?.tipo_usuario === "gestor_casos" ||
    (typeof profile?.tipo_usuario === "string" && profile.tipo_usuario.includes("gestor"));

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

  const getCumplimientoColor = (cumplimiento) => (toBool(cumplimiento) ? "#27ae60" : "#e74c3c");
  const getCumplimientoLabel = (cumplimiento) => (toBool(cumplimiento) ? "Cumplido" : "No cumplido");

  const tipo = currentViewPres.tipo || "Prescripción";

  const handleEdit = () => {
    if (typeof openEditPrescripcion === "function") openEditPrescripcion(currentViewPres);
  };

  return (
    <Modal open={open} onClose={() => closeModal("viewPres")} title={`${tipo} - Detalles`} size="md">
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.left}>
            <div className={styles.tipo}>
              <span className={styles.icon}>{tipo === "Medicacion" ? "💊" : "📝"}</span>
              <div>
                <div className={styles.title}>{tipo}</div>
                <div className={styles.subtitle}>ID: {currentViewPres.id_prescripcion ?? currentViewPres.id}</div>
              </div>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.badge} style={{ backgroundColor: getCumplimientoColor(currentViewPres.cumplimiento) }}>
              {getCumplimientoLabel(currentViewPres.cumplimiento)}
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.label}>Descripciónn</div>
          <div className={styles.text}>{currentViewPres.descripcion || "(sin descripción)"}</div>
        </div>

        <div className={styles.section}>
          <div className={styles.label}>Observaciones</div>
          <div className={styles.text}>{currentViewPres.observaciones || "(sin observaciones)"}</div>
        </div>

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>Frecuencia: {currentViewPres.frecuencia || "-"}</div>
          <div className={styles.metaItem}>Duración: {currentViewPres.duracion || "-"}</div>
        </div>

        <div className={styles.actions}>
          {isGestor && (
            <button type="button" className={styles.editButton} onClick={handleEdit}>
              ✏️ Editar
            </button>
          )}
          <button type="button" className={styles.closeButton} onClick={() => closeModal("viewPres")}>
            ✕ Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
