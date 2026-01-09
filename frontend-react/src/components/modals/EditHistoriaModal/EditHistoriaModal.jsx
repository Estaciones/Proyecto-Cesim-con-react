import React, { useEffect, useState } from "react"
import Modal from "../Modal/Modal"
import { useModal } from "../../../hooks/useModal"
import { useHistory } from "../../../hooks/useHistory"
import { useToast } from "../../../hooks/useToast"
import styles from "./EditHistoriaModal.module.css"

export default function EditHistoriaModal() {
  const { modals, closeModal, modalData } = useModal()
  const { updateRegistro } = useHistory()
  const { showToast } = useToast()

  const open = modals.editHistoria
  const { currentEditHistoria } = modalData

  const [formData, setFormData] = useState({
    recordId: "",
    titulo: "",
    descripcion: "",
    tipo: "general"
  })

  const [submitting, setSubmitting] = useState(false)
  const [recordInfo, setRecordInfo] = useState(null)


  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getRecordInfo = () => {
    if (!currentEditHistoria) return null

    const fechaCreacion = currentEditHistoria.fecha_creacion
      ? new Date(currentEditHistoria.fecha_creacion).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      : "No disponible"

    const fechaActualizacion = currentEditHistoria.fecha_actualizacion
      ? new Date(currentEditHistoria.fecha_actualizacion).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      : "No disponible"

    return { fechaCreacion, fechaActualizacion }
  }

  useEffect(() => {
    if (open && currentEditHistoria) {
      setFormData({
        recordId:
          currentEditHistoria.id_registro || currentEditHistoria.id || "",
        titulo: currentEditHistoria.titulo || "",
        descripcion: currentEditHistoria.descripcion || "",
        tipo: currentEditHistoria.tipo || "general"
      })
      setRecordInfo(getRecordInfo())
    } else {
      setFormData({
        recordId: "",
        titulo: "",
        descripcion: "",
        tipo: "general"
      })
      setRecordInfo(null)
    }
  }, [open, currentEditHistoria, getRecordInfo])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleClear = () => {
    if (currentEditHistoria) {
      setFormData({
        recordId: currentEditHistoria.id_registro || currentEditHistoria.id || "",
        titulo: currentEditHistoria.titulo || "",
        descripcion: currentEditHistoria.descripcion || "",
        tipo: currentEditHistoria.tipo || "general"
      })
    }
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

    if (!formData.recordId) {
      showToast("No se pudo identificar el registro", "error")
      return
    }

    setSubmitting(true)
    try {
      await updateRegistro(formData.recordId, {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tipo: formData.tipo
      })

      showToast("Registro actualizado exitosamente", "success")
      closeModal("editHistoria")
    } catch (error) {
      console.error("Error actualizando historia:", error)
      showToast(error.message || "Error al actualizar el registro", "error")
    } finally {
      setSubmitting(false)
    }
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
    return tipos[tipo] || tipo
  }

  return (
    <Modal
      open={open}
      onClose={() => closeModal("editHistoria")}
      title="Editar Registro de Historia Clínica"
      size="lg"
      loading={submitting}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Sección: Información del Registro */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📝</span>
            Información del Registro
          </h3>
          
          {recordInfo && (
            <div className={styles.recordInfo}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <span className={styles.infoIcon}>📅</span>
                    Creado:
                  </span>
                  <span className={styles.infoValue}>
                    {recordInfo.fechaCreacion}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <span className={styles.infoIcon}>🔄</span>
                    Última actualización:
                  </span>
                  <span className={styles.infoValue}>
                    {recordInfo.fechaActualizacion}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="titulo" className={styles.label}>
                Título del Registro *
              </label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                placeholder="Título del registro clínico"
                className={styles.input}
                required
                disabled={submitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="tipo" className={styles.label}>
                Tipo de Registro
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                className={styles.select}
                disabled={submitting}
              >
                <option value="general">General</option>
                <option value="consulta">Consulta</option>
                <option value="evaluacion">Evaluación</option>
                <option value="seguimiento">Seguimiento</option>
                <option value="tratamiento">Tratamiento</option>
                <option value="diagnostico">Diagnóstico</option>
              </select>
              <div className={styles.selectedTipo}>
                <span className={styles.tipoBadge}>
                  {getTipoLabel(formData.tipo)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Descripción Detallada */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📄</span>
            Descripción Detallada
          </h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="descripcion" className={styles.label}>
              Descripción Detallada *
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Descripción detallada del registro..."
              className={styles.textarea}
              rows={8}
              required
              disabled={submitting}
            />
            <div className={styles.textInfo}>
              <div className={styles.charCount}>
                <span>{formData.descripcion.length} caracteres</span>
              </div>
              <div className={styles.lineCount}>
                <span>{formData.descripcion.split('\n').length} líneas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Vista Previa */}
        {formData.titulo && (
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>👁️</span>
              Vista Previa
            </h3>
            
            <div className={styles.preview}>
              <div className={styles.previewHeader}>
                <h4 className={styles.previewTitle}>{formData.titulo}</h4>
                <span className={styles.previewTipo}>
                  {getTipoLabel(formData.tipo)}
                </span>
              </div>
              <div className={styles.previewContent}>
                {formData.descripcion.split('\n').map((line, index) => (
                  <p key={index} className={styles.previewParagraph}>
                    {line || <br />}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={handleClear}
            className={styles.secondaryButton}
            disabled={submitting}
          >
            Restaurar Original
          </button>

          <div className={styles.primaryActions}>
            <button
              type="button"
              onClick={() => closeModal("editHistoria")}
              className={styles.cancelButton}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
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
  )
}