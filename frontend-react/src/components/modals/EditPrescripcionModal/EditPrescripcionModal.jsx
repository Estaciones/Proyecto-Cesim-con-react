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
    descripcion: "",
    observaciones: "",
    cumplimiento: "false",
    frecuencia: "",
    duracion: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    if (open && currentEditPres) {
      const formattedData = {
        presId: currentEditPres.id_prescripcion || currentEditPres.id || "",
        descripcion: currentEditPres.descripcion || "",
        observaciones: currentEditPres.observaciones || "",
        cumplimiento: currentEditPres.cumplimiento ? "true" : "false",
        frecuencia: currentEditPres.frecuencia || "",
        duracion: currentEditPres.duracion || ""
      };
      
      setFormData(formattedData);
      setOriginalData(formattedData);
    } else if (!open) {
      setFormData({ 
        presId: "", 
        descripcion: "", 
        observaciones: "", 
        cumplimiento: "false", 
        frecuencia: "", 
        duracion: "" 
      });
      setOriginalData(null);
      setSubmitting(false);
    }
  }, [open, currentEditPres]);

  if (!open) return null;

  if (open && !currentEditPres) {
    return (
      <Modal 
        open={open} 
        onClose={() => closeModal("editPres")} 
        title="Editar Prescripción"
        size="md"
      >
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando información de la prescripción...</p>
        </div>
      </Modal>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleClear = () => {
    if (originalData) {
      setFormData(originalData);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.descripcion.trim()) {
      showToast("La descripción es obligatoria", "error");
      return;
    }

    if (!formData.presId) {
      showToast("No se pudo identificar la prescripción", "error");
      return;
    }

    setSubmitting(true);
    try {
      await updatePrescription(formData.presId, {
        descripcion: formData.descripcion,
        observaciones: formData.observaciones.trim() || undefined,
        cumplimiento: formData.cumplimiento === "true",
        frecuencia: formData.frecuencia.trim() || undefined,
        duracion: formData.duracion.trim() || undefined
      });
      
      showToast("Prescripción actualizada exitosamente", "success");
      closeModal("editPres");
    } catch (error) {
      console.error("Error actualizando prescripción:", error);
      showToast(error.message || "Error al actualizar la prescripción", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const hasChanges = originalData && (
    formData.descripcion !== originalData.descripcion ||
    formData.observaciones !== originalData.observaciones ||
    formData.cumplimiento !== originalData.cumplimiento ||
    formData.frecuencia !== originalData.frecuencia ||
    formData.duracion !== originalData.duracion
  );

  const getCumplimientoLabel = (value) => {
    return value === "true" ? "Cumplido" : "No cumplido";
  };

  const getCumplimientoColor = (value) => {
    return value === "true" ? "#27ae60" : "#e74c3c";
  };

  const getTipoPrescripcion = () => {
    return currentEditPres?.tipo || "Prescripción";
  };

  return (
    <Modal
      open={open}
      onClose={() => closeModal("editPres")}
      title={`Editar ${getTipoPrescripcion()}`}
      size="md"
      loading={submitting}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Sección: Información de la Prescripción */}
        <div className={styles.formSection}>
          <div className={styles.prescripcionHeader}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>💊</span>
              {getTipoPrescripcion()}
            </h3>
            {currentEditPres?.tipo && (
              <span className={styles.tipoBadge}>{currentEditPres.tipo}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="descripcion" className={styles.label}>
              Descripción *
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Descripción detallada de la prescripción..."
              className={styles.textarea}
              rows={4}
              required
              disabled={submitting}
            />
            <div className={styles.charCount}>
              <span>{formData.descripcion.length} caracteres</span>
            </div>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="frecuencia" className={styles.label}>
                Frecuencia
              </label>
              <input
                type="text"
                id="frecuencia"
                name="frecuencia"
                value={formData.frecuencia}
                onChange={handleInputChange}
                placeholder="Ej: 3 veces al día"
                className={styles.input}
                disabled={submitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="duracion" className={styles.label}>
                Duración
              </label>
              <input
                type="text"
                id="duracion"
                name="duracion"
                value={formData.duracion}
                onChange={handleInputChange}
                placeholder="Ej: 7 días"
                className={styles.input}
                disabled={submitting}
              />
            </div>
          </div>
        </div>

        {/* Sección: Observaciones y Estado */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📝</span>
            Observaciones y Estado
          </h3>

          <div className={styles.formGroup}>
            <label htmlFor="observaciones" className={styles.label}>
              Observaciones Adicionales
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              placeholder="Observaciones o notas adicionales..."
              className={styles.textarea}
              rows={3}
              disabled={submitting}
            />
            <div className={styles.charCount}>
              <span>{formData.observaciones.length} caracteres</span>
            </div>
          </div>

          <div className={styles.cumplimientoSection}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Estado de Cumplimiento
              </label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="cumplimiento"
                    value="true"
                    checked={formData.cumplimiento === "true"}
                    onChange={handleInputChange}
                    className={styles.radioInput}
                    disabled={submitting}
                  />
                  <span 
                    className={styles.radioCustom}
                    style={{
                      borderColor: formData.cumplimiento === "true" ? "#27ae60" : "#dee2e6",
                      backgroundColor: formData.cumplimiento === "true" ? "#27ae60" : "transparent"
                    }}
                  ></span>
                  <span className={styles.radioText}>
                    <span className={styles.radioStatus}>Cumplido</span>
                    <span className={styles.radioHelp}>La prescripción fue completada</span>
                  </span>
                </label>

                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="cumplimiento"
                    value="false"
                    checked={formData.cumplimiento === "false"}
                    onChange={handleInputChange}
                    className={styles.radioInput}
                    disabled={submitting}
                  />
                  <span 
                    className={styles.radioCustom}
                    style={{
                      borderColor: formData.cumplimiento === "false" ? "#e74c3c" : "#dee2e6",
                      backgroundColor: formData.cumplimiento === "false" ? "#e74c3c" : "transparent"
                    }}
                  ></span>
                  <span className={styles.radioText}>
                    <span className={styles.radioStatus}>No cumplido</span>
                    <span className={styles.radioHelp}>La prescripción está pendiente</span>
                  </span>
                </label>
              </div>
            </div>

            <div className={styles.cumplimientoBadge}>
              <span 
                className={styles.badge}
                style={{ 
                  backgroundColor: getCumplimientoColor(formData.cumplimiento),
                  color: "white"
                }}
              >
                {getCumplimientoLabel(formData.cumplimiento)}
              </span>
            </div>
          </div>
        </div>

        {/* Sección: Cambios Realizados */}
        {hasChanges && originalData && (
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>🔄</span>
              Cambios Realizados
            </h3>
            
            <div className={styles.changesList}>
              {formData.descripcion !== originalData.descripcion && (
                <div className={styles.changeItem}>
                  <span className={styles.changeLabel}>Descripción:</span>
                  <span className={styles.changeText}>Modificada</span>
                </div>
              )}
              
              {formData.frecuencia !== originalData.frecuencia && (
                <div className={styles.changeItem}>
                  <span className={styles.changeLabel}>Frecuencia:</span>
                  <span className={styles.changeOld}>{originalData.frecuencia || "Sin especificar"}</span>
                  <span className={styles.changeArrow}>→</span>
                  <span className={styles.changeNew}>{formData.frecuencia || "Sin especificar"}</span>
                </div>
              )}
              
              {formData.duracion !== originalData.duracion && (
                <div className={styles.changeItem}>
                  <span className={styles.changeLabel}>Duración:</span>
                  <span className={styles.changeOld}>{originalData.duracion || "Sin especificar"}</span>
                  <span className={styles.changeArrow}>→</span>
                  <span className={styles.changeNew}>{formData.duracion || "Sin especificar"}</span>
                </div>
              )}
              
              {formData.observaciones !== originalData.observaciones && (
                <div className={styles.changeItem}>
                  <span className={styles.changeLabel}>Observaciones:</span>
                  <span className={styles.changeText}>Modificadas</span>
                </div>
              )}
              
              {formData.cumplimiento !== originalData.cumplimiento && (
                <div className={styles.changeItem}>
                  <span className={styles.changeLabel}>Estado:</span>
                  <span 
                    className={styles.changeOld}
                    style={{ color: getCumplimientoColor(originalData.cumplimiento) }}
                  >
                    {getCumplimientoLabel(originalData.cumplimiento)}
                  </span>
                  <span className={styles.changeArrow}>→</span>
                  <span 
                    className={styles.changeNew}
                    style={{ color: getCumplimientoColor(formData.cumplimiento) }}
                  >
                    {getCumplimientoLabel(formData.cumplimiento)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={handleClear}
            className={styles.secondaryButton}
            disabled={submitting || !hasChanges}
          >
            Restaurar Original
          </button>

          <div className={styles.primaryActions}>
            <button
              type="button"
              onClick={() => closeModal("editPres")}
              className={styles.cancelButton}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting || !hasChanges}
              title={!hasChanges ? "No hay cambios para guardar" : ""}
            >
              {submitting ? (
                <>
                  <span className={styles.spinner}></span>
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}