// src/components/modals/NuevoPacienteModal/NuevoPacienteModal.jsx
import React, { useEffect, useState } from "react"
import Modal from "../Modal/Modal"
import { useModal } from "../../../hooks/useModal"
import { usePatients } from "../../../hooks/usePatients"
import { useToast } from "../../../hooks/useToast"
import { useAuthContext } from "../../../context/AuthContext"
import styles from "./NuevoPacienteModal.module.css"

export default function NuevoPacienteModal() {
  const { modals, closeModal } = useModal()
  const { createPatient } = usePatients()
  const { profile } = useAuthContext()
  const { showToast } = useToast()

  const open = modals.nuevoPaciente

  const [formData, setFormData] = useState({
    ci: "",
    nombre: "",
    apellido: "",
    genero: "",
    telefono: "",
    direccion: "",
    alergias: "",
    condiciones_cronicas: "",
    contacto_emergencia_nombre: "",
    contacto_emergencia_telefono: "",
    email: "",
    fecha_nacimiento: ""
  })

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setFormData({
        ci: "",
        nombre: "",
        apellido: "",
        genero: "",
        telefono: "",
        direccion: "",
        alergias: "",
        condiciones_cronicas: "",
        contacto_emergencia_nombre: "",
        contacto_emergencia_telefono: "",
        email: "",
        fecha_nacimiento: ""
      })
    }
  }, [open])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (
      name === "ci" ||
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
    if (!formData.ci || !formData.nombre || !formData.apellido) {
      showToast("CI, nombre y apellido son obligatorios", "error")
      return false
    }

    if (formData.ci.length < 10 || formData.ci.length > 11) {
      showToast("El CI debe tener entre 10 y 11 dígitos", "error")
      return false
    }

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

    if (!profile?.id_usuario) {
      showToast("No se pudo identificar al médico responsable", "error")
      return
    }

    setSubmitting(true)
    try {
      const pacienteData = {
        ...formData,
        id_medico: profile.id_usuario
      }

      await createPatient(pacienteData)
      showToast("Paciente creado y asignado", "success")
      closeModal("nuevoPaciente")
    } catch (error) {
      console.error("Error creando paciente:", error)
      showToast(error.message || "Error al crear paciente", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const handleClear = () => {
    setFormData({
      ci: "",
      nombre: "",
      apellido: "",
      genero: "",
      telefono: "",
      direccion: "",
      alergias: "",
      condiciones_cronicas: "",
      contacto_emergencia_nombre: "",
      contacto_emergencia_telefono: "",
      email: "",
      fecha_nacimiento: ""
    })
  }

  return (
    <Modal
      open={open}
      onClose={() => closeModal("nuevoPaciente")}
      title="Registrar Nuevo Paciente"
      size="lg">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Información Básica</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="ci" className={styles.label}>
                Carnet de Identidad (CI) *
              </label>
              <input
                type="text"
                id="ci"
                name="ci"
                value={formData.ci}
                onChange={handleInputChange}
                placeholder="Ingrese el CI (10-11 dígitos)"
                className={styles.input}
                maxLength="11"
                required
                disabled={submitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="nombre" className={styles.label}>
                Nombres *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ingrese los nombres"
                className={styles.input}
                required
                disabled={submitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="apellido" className={styles.label}>
                Apellidos *
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                placeholder="Ingrese los apellidos"
                className={styles.input}
                required
                disabled={submitting}
              />
            </div>

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
                disabled={submitting}>
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
          <h3 className={styles.sectionTitle}>Contacto de Emergencia</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label
                htmlFor="contacto_emergencia_nombre"
                className={styles.label}>
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
                className={styles.label}>
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

        <div className={styles.requiredInfo}>
          <span className={styles.requiredMark}>*</span> Campos obligatorios
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearButton}
            disabled={submitting}>
            Limpiar
          </button>

          <div className={styles.actionButtons}>
            <button
              type="button"
              onClick={() => closeModal("nuevoPaciente")}
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
                  Registrando...
                </>
              ) : (
                "Registrar Paciente"
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
