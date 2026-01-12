// AsignarGestorModal (corregido)
import React, { useEffect, useState, useCallback } from "react"
import Modal from "../Modal/Modal"
import { useModal } from "../../../hooks/useModal"
import { usePatients } from "../../../hooks/usePatients"
import { useToast } from "../../../hooks/useToast"
import styles from "./AsignarGestorModal.module.css"

export default function AsignarGestorModal() {
  const { modals, closeModal, modalData } = useModal()
  const { assignGestor, fetchGestores } = usePatients()
  const { showToast } = useToast()

  const open = !!modals.asignarGestor
  const { currentAsignarPacienteId } = modalData?.asignarGestor || {}

  const [gestores, setGestores] = useState([])
  const [selectedGestor, setSelectedGestor] = useState("")
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadGestoresData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchGestores()
      setGestores(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error cargando gestores:", error)
      showToast("Error al cargar la lista de gestores", "error")
      setGestores([])
    } finally {
      setLoading(false)
    }
  }, [fetchGestores, showToast])

  useEffect(() => {
    if (open) {
      loadGestoresData()
      setSelectedGestor("")
    }
  }, [open, loadGestoresData])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedGestor) {
      showToast("Selecciona un gestor de casos", "error")
      return
    }

    if (!currentAsignarPacienteId) {
      showToast("No se pudo identificar al paciente", "error")
      return
    }

    setSubmitting(true)
    try {
      await assignGestor({
        id_gestor: Number(selectedGestor),
        id_paciente: currentAsignarPacienteId
      })

      showToast("Gestor asignado", "success")
      closeModal("asignarGestor")
    } catch (error) {
      console.error("Error asignando gestor:", error)
      showToast(error.message || "Error al asignar gestor", "error")
    } finally {
      setSubmitting(false)
    }
  }

  // eslint-disable-next-line no-unused-vars
  const handleClear = () => {
    setSelectedGestor("")
  }

  const selectedGestorName =
    gestores.find((g) => String(g.id_gestor) === String(selectedGestor))?.nombre || ""

  return (
    <Modal
      open={open}
      onClose={() => closeModal("asignarGestor")}
      title="Asignar Gestor de Casos"
      size="md"
      loading={submitting}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* ... resto del JSX igual ... */}
        <div className={styles.summaryInfo}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total de gestores disponibles:</span>
            <span className={styles.summaryValue}>{gestores.length}</span>
          </div>
          {selectedGestor && (
            <div className={styles.selectedInfo}>
              <span className={styles.selectedLabel}>Gestor seleccionado:</span>
              <span className={styles.selectedValue}>
                {selectedGestorName}
              </span>
            </div>
          )}
        </div>
        {/* ... botones, etc. ... */}
      </form>
    </Modal>
  )
}
