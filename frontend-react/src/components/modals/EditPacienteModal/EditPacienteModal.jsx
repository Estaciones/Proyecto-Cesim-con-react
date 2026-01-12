import React, { useEffect, useState } from "react"
import Modal from "../Modal/Modal"
import { useModal } from "../../../hooks/useModal"
import { usePatients } from "../../../hooks/usePatients"
import { useToast } from "../../../hooks/useToast"
import styles from "./EditPacienteModal.module.css"

export default function EditPacienteModal() {
  const { modals, closeModal, modalData } = useModal()
  const { updatePatient } = usePatients()
  const { showToast } = useToast()

  const open = !!modals.editPaciente
  const patient = modalData.editPaciente?.currentPatientData

  const [formData, setFormData] = useState({
    direccion: "",
    alergias: "",
    condiciones_cronicas: "",
    contacto_emergencia_nombre: "",
    contacto_emergencia_telefono: "",
    telefono: "",
    email: "",
    genero: "",
    fecha_nacimiento: ""
  })

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open && patient) {
      setFormData({
        direccion: patient.direccion || "",
        alergias: patient.alergias || "",
        condiciones_cronicas: patient.condiciones_cronicas || "",
        contacto_emergencia_nombre: patient.contacto_emergencia_nombre || "",
        contacto_emergencia_telefono: patient.contacto_emergencia_telefono || "",
        telefono: patient.telefono || "",
        email: patient.email || "",
        genero: patient.genero || "",
        fecha_nacimiento: patient.fecha_nacimiento || ""
      })
    }
  }, [open, patient])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (
      name === "telefono" ||
      name === "contacto_emergencia_telefono"
    ) {
      const numericValue = value.replace(/\D/g, "")
      setFormData((prev) => ({ ...prev, [name]: numericValue }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const validateForm = () => {
    if (formData.telefono && formData.telefono.length < 7) {
      showToast("El teléfono debe tener al menos 7 dígitos", "error")
      return false
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      showToast("El email no es válido", "error")
      return false
    }

    if (
      formData.contacto_emergencia_telefono &&
      formData.contacto_emergencia_telefono.length < 7
    ) {
      showToast(
        "El teléfono de emergencia debe tener al menos 7 dígitos",
        "error"
      )
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!patient?.id_paciente) {
      showToast("No se pudo identificar al paciente", "error")
      return
    }

    setSubmitting(true)
    try {
      const pacienteData = {
        ...formData
      }

      await updatePatient(patient.id_paciente, pacienteData)
      showToast("Paciente actualizado exitosamente", "success")
      closeModal("editPaciente")
    } catch (error) {
      console.error("Error actualizando paciente:", error)
      showToast(error.message || "Error al actualizar paciente", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const handleClear = () => {
    if (patient) {
      setFormData({
        direccion: patient.direccion || "",
        alergias: patient.alergias || "",
        condiciones_cronicas: patient.condiciones_cronicas || "",
        contacto_emergencia_nombre: patient.contacto_emergencia_nombre || "",
        contacto_emergencia_telefono: patient.contacto_emergencia_telefono || "",
        telefono: patient.telefono || "",
        email: patient.email || "",
        genero: patient.genero || "",
        fecha_nacimiento: patient.fecha_nacimiento || ""
      })
    }
  }

  if (!patient) return null

  return (
    <Modal
      open={open}
      onClose={() => closeModal("editPaciente")}
      title={`Editar Paciente: ${patient.nombre} ${patient.apellido}`}
      size="lg"
      loading={submitting}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.patientInfoHeader}>
          <div className={styles.patientBasicInfo}>
            <h4 className={styles.patientName}>
              {patient.nombre} {patient.apellido}
            </h4>
            <p className={styles.patientCI}>CI: {patient.ci}</p>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>👤</span>
            Información Básica
          </h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="genero" className={styles.label}>
                Género
              </label>
              <select
                id="genero"
                name="genero"
                value={formData.genero}
                onChange={handleInputChange}
                className={styles.select}
                disabled={submitting}
              >
                <option value="">Seleccione</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="fecha_nacimiento" className={styles.label}>
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleInputChange}
                className={styles.input}
                max={new Date().toISOString().split("T")[0]}
                disabled={submitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="telefono" className={styles.label}>
                Teléfono
              </label>
              <input
                type="text"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="Ingrese el teléfono"
                className={styles.input}
                maxLength="10"
                disabled={submitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Ingrese el email"
                className={styles.input}
                disabled={submitting}
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🏥</span>
            Información de Contacto y Salud
          </h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="direccion" className={styles.label}>
                Dirección
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                placeholder="Ingrese la dirección completa"
                className={styles.input}
                disabled={submitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="alergias" className={styles.label}>
                Alergias Conocidas
              </label>
              <input
                type="text"
                id="alergias"
                name="alergias"
                value={formData.alergias}
                onChange={handleInputChange}
                placeholder="Ej: Penicilina, Ibuprofeno"
                className={styles.input}
                disabled={submitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="condiciones_cronicas" className={styles.label}>
                Condiciones Crónicas
              </label>
              <input
                type="text"
                id="condiciones_cronicas"
                name="condiciones_cronicas"
                value={formData.condiciones_cronicas}
                onChange={handleInputChange}
                placeholder="Ej: Diabetes, Hipertensión"
                className={styles.input}
                disabled={submitting}
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🆘</span>
            Contacto de Emergencia
          </h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label
                htmlFor="contacto_emergencia_nombre"
                className={styles.label}
              >
                Nombre del Contacto
              </label>
              <input
                type="text"
                id="contacto_emergencia_nombre"
                name="contacto_emergencia_nombre"
                value={formData.contacto_emergencia_nombre}
                onChange={handleInputChange}
                placeholder="Nombre completo del contacto"
                className={styles.input}
                disabled={submitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label
                htmlFor="contacto_emergencia_telefono"
                className={styles.label}
              >
                Teléfono de Emergencia
              </label>
              <input
                type="text"
                id="contacto_emergencia_telefono"
                name="contacto_emergencia_telefono"
                value={formData.contacto_emergencia_telefono}
                onChange={handleInputChange}
                placeholder="Teléfono de contacto"
                className={styles.input}
                maxLength="10"
                disabled={submitting}
              />
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={handleClear}
            className={styles.secondaryButton}
            disabled={submitting}
          >
            Restaurar
          </button>

          <div className={styles.primaryActions}>
            <button
              type="button"
              onClick={() => closeModal("editPaciente")}
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
                  Actualizando...
                </>
              ) : (
                "Actualizar Paciente"
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}