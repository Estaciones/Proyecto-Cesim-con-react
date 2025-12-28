import React, { useEffect, useState } from "react"
import Modal from "../Modal/Modal"
import { useModal } from "../../../hooks/useModal"
import { usePlans } from "../../../hooks/usePlans"
import { useToast } from "../../../hooks/useToast"
import styles from "./EditPlanModal.module.css"

export default function EditPlanModal() {
  const { modals, closeModal, modalData } = useModal()
  const { updatePlan } = usePlans()
  const { showToast } = useToast()

  const open = modals.editPlan
  const { currentEditPlan } = modalData

  const [formData, setFormData] = useState({
    planId: "",
    titulo: "",
    descripcion: "",
    fecha_inicio: "",
    estado: "activo",
    resumen_egreso: ""
  })

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open && currentEditPlan) {
      setFormData({
        planId: currentEditPlan.id_plan || currentEditPlan.id || "",
        titulo: currentEditPlan.titulo || "",
        descripcion: currentEditPlan.descripcion || "",
        fecha_inicio: currentEditPlan.fecha_inicio
          ? new Date(currentEditPlan.fecha_inicio).toISOString().split("T")[0]
          : "",
        estado: currentEditPlan.estado || "activo",
        resumen_egreso: currentEditPlan.resumen_egreso || ""
      })
    } else {
      setFormData({
        planId: "",
        titulo: "",
        descripcion: "",
        fecha_inicio: "",
        estado: "activo",
        resumen_egreso: ""
      })
    }
  }, [open, currentEditPlan])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.titulo.trim()) {
      showToast("El título es obligatorio", "error")
      return
    }

    if (!formData.descripcion.trim()) {
      showToast("La descripción es obligatoria", "error")
      return
    }

    if (!formData.fecha_inicio) {
      showToast("La fecha de inicio es obligatoria", "error")
      return
    }

    if (!formData.planId) {
      showToast("No se pudo identificar el plan", "error")
      return
    }

    setSubmitting(true)
    try {
      await updatePlan(formData.planId, {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fecha_inicio: formData.fecha_inicio,
        estado: formData.estado,
        resumen_egreso: formData.resumen_egreso
      })

      showToast("Plan actualizado", "success")
      closeModal("editPlan")
    } catch (error) {
      console.error("Error actualizando plan:", error)
      showToast(error.message || "Error al actualizar el plan", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const getPlanInfo = () => {
    if (!currentEditPlan) return null

    const fechaCreacion = currentEditPlan.fecha_creacion
      ? new Date(currentEditPlan.fecha_creacion).toLocaleString()
      : "No disponible"

    return { fechaCreacion }
  }

  const planInfo = getPlanInfo()

  return (
    <Modal
      open={open}
      onClose={() => closeModal("editPlan")}
      title="Editar Plan de Tratamiento"
      size="lg">
      <form onSubmit={handleSubmit} className={styles.form}>
        {planInfo && (
          <div className={styles.planInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Creado:</span>
              <span className={styles.infoValue}>{planInfo.fechaCreacion}</span>
            </div>
          </div>
        )}

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
              Fecha de Inicio *
            </label>
            <input
              type="date"
              id="fecha_inicio"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleInputChange}
              className={styles.input}
              required
              disabled={submitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="estado" className={styles.label}>
              Estado *
            </label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              className={styles.select}
              required
              disabled={submitting}>
              <option value="activo">Activo</option>
              <option value="pendiente">Pendiente</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
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
            placeholder="Descripción detallada del plan..."
            className={styles.textarea}
            rows={8}
            required
            disabled={submitting}
          />
        </div>

        {formData.estado === "completado" && (
          <div className={styles.formGroup}>
            <label htmlFor="resumen_egreso" className={styles.label}>
              Resumen de Egreso
            </label>
            <textarea
              id="resumen_egreso"
              name="resumen_egreso"
              value={formData.resumen_egreso}
              onChange={handleInputChange}
              placeholder="Resumen del egreso o finalización del tratamiento..."
              className={styles.textarea}
              rows={4}
              disabled={submitting}
            />
          </div>
        )}

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => closeModal("editPlan")}
            className={styles.cancelButton}
            disabled={submitting}>
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting}>
            {submitting ? (
              <>
                <span className={styles.spinner}></span>
                Guardando cambios...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}
