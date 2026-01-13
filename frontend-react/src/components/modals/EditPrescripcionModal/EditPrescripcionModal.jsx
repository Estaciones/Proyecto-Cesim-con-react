import React, { useEffect, useState } from "react";
import Modal from "../Modal/Modal";
import { useModal } from "../../../hooks/useModal";
import { usePlans } from "../../../hooks/usePlans";
import { useToast } from "../../../hooks/useToast";
import styles from "./EditPresModal.module.css";

export default function EditPresModal() {
  const { modals, getModalData, closeModal } = useModal();
  const { updatePrescription } = usePlans();
  const { showToast } = useToast();

  const open = !!modals.editPres;
  const payload = getModalData("editPres") || {};
  const currentEditPres = payload.currentEditPres || null;

  const [formData, setFormData] = useState({
    presId: "",
    observaciones: "",       // aquí representamos la "operación"
    cumplimiento: "false"
  });

  const [originalData, setOriginalData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && currentEditPres) {
      const formatted = {
        presId: currentEditPres.id_prescripcion || currentEditPres.id || "",
        observaciones: currentEditPres.observaciones || "",
        cumplimiento: currentEditPres.cumplimiento ? "true" : "false"
      };
      setFormData(formatted);
      setOriginalData(formatted);
    } else if (!open) {
      setFormData({ presId: "", observaciones: "", cumplimiento: "false" });
      setOriginalData(null);
      setSubmitting(false);
    }
  }, [open, currentEditPres]);

  if (!open) return null;

  if (open && !currentEditPres) {
    return (
      <Modal open={open} onClose={() => closeModal("editPres")} title="Editar Prescripción" size="md">
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Cargando información de la prescripción...</p>
        </div>
      </Modal>
    );
  }

  const hasChanges =
    originalData &&
    (formData.observaciones !== originalData.observaciones ||
      formData.cumplimiento !== originalData.cumplimiento);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.observaciones.trim()) {
      showToast("La observaciónn es obligatoria", "error");
      return;
    }

    if (!formData.presId) {
      showToast("No se pudo identificar la prescripción", "error");
      return;
    }

    if (!hasChanges) {
      showToast("No hay cambios para guardar", "info");
      return;
    }

    setSubmitting(true);
    try {
      await updatePrescription(formData.presId, {
        observaciones: formData.observaciones,
        cumplimiento: formData.cumplimiento === "true"
      });

      showToast("Prescripción actualizada", "success");
      closeModal("editPres");
    } catch (error) {
      console.error("Error actualizando prescripción:", error);
      showToast(error?.message || "Error al actualizar la prescripción", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getCumplimientoLabel = (value) => (value === "true" ? "Cumplido" : "No cumplido");

  return (
    <Modal
      open={open}
      onClose={() => closeModal("editPres")}
      title={`Editar ${currentEditPres?.tipo || "Prescripción"}`}
      size="md"
      loading={submitting}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Encabezado contextual (solo lectura) */}
        <div className={styles.contextSection}>
          <div className={styles.labelSmall}>ID</div>
          <div className={styles.readOnly}>{currentEditPres.id_prescripcion ?? currentEditPres.id}</div>

          <div className={styles.labelSmall}>Tipo</div>
          <div className={styles.readOnly}>{currentEditPres.tipo || "-"}</div>

          <div className={styles.labelSmall}>Descripción</div>
          <div className={styles.readOnlyMultiline}>{currentEditPres.descripcion || "(sin descripcion)"}</div>

          <div className={styles.labelSmall}>Frecuencia / Duración</div>
          <div className={styles.readOnly}>
            {currentEditPres.frecuencia || "-"} {currentEditPres.duracion ? ` / ${currentEditPres.duracion}` : ""}
          </div>
        </div>

        {/* Editables: Observación y Cumplimiento */}
        <div className={styles.formSection}>
          <label className={styles.label}>Observaciones *</label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleInputChange}
            className={styles.textarea}
            rows={3}
            required
            disabled={submitting}
            placeholder={currentEditPres.observaciones}
          />

          <div className={styles.inlineRow}>
            <div>
              <label className={styles.label}>Estado de cumplimiento</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="cumplimiento"
                    value="true"
                    checked={formData.cumplimiento === "true"}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                  <span className={styles.radioText}>Cumplido</span>
                </label>

                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="cumplimiento"
                    value="false"
                    checked={formData.cumplimiento === "false"}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                  <span className={styles.radioText}>No cumplido</span>
                </label>
              </div>
            </div>

            <div className={styles.statusPreview}>
              <div className={styles.labelSmall}>Previsualización</div>
              <div
                className={styles.badgePreview}
                style={{ backgroundColor: formData.cumplimiento === "true" ? "#27ae60" : "#e74c3c" }}
              >
                {getCumplimientoLabel(formData.cumplimiento)}
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className={styles.formActions}>
          <button type="button" onClick={() => closeModal("editPres")} className={styles.cancelButton} disabled={submitting}>
            Cancelar
          </button>

          <div className={styles.primaryActions}>
            <button type="submit" className={styles.submitButton} disabled={submitting || !hasChanges}>
              {submitting ? <><span className={styles.spinner}></span> Guardando...</> : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
