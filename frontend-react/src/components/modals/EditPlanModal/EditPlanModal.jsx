import React, { useEffect, useState } from "react";
import Modal from "../Modal/Modal";
import { useModal } from "../../../hooks/useModal";
import { usePlans } from "../../../hooks/usePlans";
import { useToast } from "../../../hooks/useToast";
import styles from "./EditPlanModal.module.css";

export default function EditPlanModal() {
  const { modals, getModalData, closeModal } = useModal();
  const { updatePlan } = usePlans();
  const { showToast } = useToast();

  const open = !!modals.editPlan;
  const payload = getModalData("editPlan") || {};
  const currentEditPlan = payload.currentEditPlan || null;

  const [formData, setFormData] = useState({
    id_plan: "",
    titulo: "",
    descripcion: "",
    fecha_inicio: "",
    estado: true,
    resumen_egreso: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    if (open && currentEditPlan) {
      const formattedData = {
        id_plan: currentEditPlan.id_plan || currentEditPlan.id || "",
        titulo: currentEditPlan.titulo || "",
        descripcion: currentEditPlan.descripcion || "",
        fecha_inicio: currentEditPlan.fecha_inicio 
          ? currentEditPlan.fecha_inicio.split("T")[0] 
          : "",
        estado: typeof currentEditPlan.estado !== "undefined" 
          ? !!currentEditPlan.estado 
          : true,
        resumen_egreso: currentEditPlan.resumen_egreso || ""
      };
      
      setFormData(formattedData);
      setOriginalData(formattedData);
    } else if (!open) {
      setFormData({ 
        id_plan: "", 
        titulo: "", 
        descripcion: "", 
        fecha_inicio: "", 
        estado: true, 
        resumen_egreso: "" 
      });
      setOriginalData(null);
      setSubmitting(false);
    }
  }, [open, currentEditPlan]);

  if (!open) return null;

  if (open && !currentEditPlan) {
    return (
      <Modal 
        open={open} 
        onClose={() => closeModal("editPlan")} 
        title="Editar Plan de Tratamiento"
        size="md"
      >
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando información del plan...</p>
        </div>
      </Modal>
    );
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
  };

  const handleClear = () => {
    if (originalData) {
      setFormData(originalData);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      showToast("El título del plan es obligatorio", "error");
      return;
    }
    
    if (!formData.descripcion.trim()) {
      showToast("La descripción del plan es obligatoria", "error");
      return;
    }

    if (!formData.id_plan) {
      showToast("No se pudo identificar el plan", "error");
      return;
    }

    setSubmitting(true);
    try {
      await updatePlan(formData.id_plan, {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fecha_inicio: formData.fecha_inicio || undefined,
        estado: formData.estado,
        resumen_egreso: formData.resumen_egreso.trim() || undefined
      });
      
      showToast("Plan actualizado exitosamente", "success");
      closeModal("editPlan");
    } catch (error) {
      console.error("Error actualizando plan:", error);
      showToast(error.message || "Error al actualizar el plan", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const hasChanges = originalData && (
    formData.titulo !== originalData.titulo ||
    formData.descripcion !== originalData.descripcion ||
    formData.fecha_inicio !== originalData.fecha_inicio ||
    formData.estado !== originalData.estado ||
    formData.resumen_egreso !== originalData.resumen_egreso
  );

  const getEstadoLabel = (estado) => {
    return estado ? "Activo" : "Inactivo";
  };

  const getEstadoColor = (estado) => {
    return estado ? "#27ae60" : "#e74c3c";
  };

  return (
    <Modal
      open={open}
      onClose={() => closeModal("editPlan")}
      title="Editar Plan de Tratamiento"
      size="lg"
      loading={submitting}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Sección: Información Básica */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📋</span>
            Información Básica del Plan
          </h3>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="titulo" className={styles.label}>
                Título del Plan *
              </label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                placeholder="Título del plan de tratamiento"
                className={styles.input}
                required
                disabled={submitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="fecha_inicio" className={styles.label}>
                Fecha de Inicio
              </label>
              <input
                type="date"
                id="fecha_inicio"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleInputChange}
                className={styles.input}
                disabled={submitting}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="descripcion" className={styles.label}>
              Descripción Detallada *
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Descripción detallada del plan de tratamiento..."
              className={styles.textarea}
              rows={6}
              required
              disabled={submitting}
            />
            <div className={styles.charCount}>
              <span>{formData.descripcion.length} caracteres</span>
            </div>
          </div>
        </div>

        {/* Sección: Estado y Egreso */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>⚙️</span>
            Estado y Finalización
          </h3>
          
          <div className={styles.statusGrid}>
            <div className={styles.formGroup}>
              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="estado"
                  name="estado"
                  checked={formData.estado}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                  disabled={submitting}
                />
                <label htmlFor="estado" className={styles.checkboxLabel}>
                  <span className={styles.checkboxCustom}></span>
                  <span>Plan Activo</span>
                  <span 
                    className={styles.estadoBadge}
                    style={{ backgroundColor: getEstadoColor(formData.estado) }}
                  >
                    {getEstadoLabel(formData.estado)}
                  </span>
                </label>
              </div>
              <p className={styles.checkboxHelp}>
                Un plan inactivo no aparecerá en las listas activas del paciente.
              </p>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="resumen_egreso" className={styles.label}>
                Resumen de Egreso (Opcional)
              </label>
              <textarea
                id="resumen_egreso"
                name="resumen_egreso"
                value={formData.resumen_egreso}
                onChange={handleInputChange}
                placeholder="Resumen de los resultados del tratamiento al finalizar..."
                className={styles.textarea}
                rows={3}
                disabled={submitting}
              />
              <div className={styles.charCount}>
                <span>{formData.resumen_egreso.length} caracteres</span>
              </div>
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
              {formData.titulo !== originalData.titulo && (
                <div className={styles.changeItem}>
                  <span className={styles.changeLabel}>Título:</span>
                  <span className={styles.changeOld}>{originalData.titulo}</span>
                  <span className={styles.changeArrow}>→</span>
                  <span className={styles.changeNew}>{formData.titulo}</span>
                </div>
              )}
              
              {formData.descripcion !== originalData.descripcion && (
                <div className={styles.changeItem}>
                  <span className={styles.changeLabel}>Descripción:</span>
                  <span className={styles.changeText}>Modificada</span>
                </div>
              )}
              
              {formData.fecha_inicio !== originalData.fecha_inicio && (
                <div className={styles.changeItem}>
                  <span className={styles.changeLabel}>Fecha inicio:</span>
                  <span className={styles.changeOld}>{originalData.fecha_inicio}</span>
                  <span className={styles.changeArrow}>→</span>
                  <span className={styles.changeNew}>{formData.fecha_inicio}</span>
                </div>
              )}
              
              {formData.estado !== originalData.estado && (
                <div className={styles.changeItem}>
                  <span className={styles.changeLabel}>Estado:</span>
                  <span 
                    className={styles.changeOld}
                    style={{ color: getEstadoColor(originalData.estado) }}
                  >
                    {getEstadoLabel(originalData.estado)}
                  </span>
                  <span className={styles.changeArrow}>→</span>
                  <span 
                    className={styles.changeNew}
                    style={{ color: getEstadoColor(formData.estado) }}
                  >
                    {getEstadoLabel(formData.estado)}
                  </span>
                </div>
              )}
              
              {formData.resumen_egreso !== originalData.resumen_egreso && (
                <div className={styles.changeItem}>
                  <span className={styles.changeLabel}>Resumen egreso:</span>
                  <span className={styles.changeText}>Modificado</span>
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
              onClick={() => closeModal("editPlan")}
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