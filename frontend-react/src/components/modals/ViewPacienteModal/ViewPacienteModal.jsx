import React, { useEffect, useState } from "react"
import Modal from "../Modal/Modal"
import { useModal } from "../../../hooks/useModal"
import styles from "./ViewPacienteModal.module.css"

export default function ViewPacienteModal() {
  const { modals, closeModal, modalData } = useModal()

  const open = !!modals.viewPaciente
  const patient = modalData.viewPaciente?.currentPatientData

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

  useEffect(() => {
    if (open && patient) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  if (!patient) return null

  const getGeneroTexto = (genero) => {
    switch(genero) {
      case 'M': return 'Masculino'
      case 'F': return 'Femenino'
      case 'O': return 'Otro'
      default: return 'No especificado'
    }
  }

  const formatFecha = (fecha) => {
    if (!fecha) return 'No especificada'
    const date = new Date(fecha)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <Modal
      open={open}
      onClose={() => closeModal("viewPaciente")}
      title={`Información del Paciente: ${patient.nombre} ${patient.apellido}`}
      size="lg"
    >
      <div className={styles.container}>
        {/* Información del paciente */}
        <div className={styles.patientInfoHeader}>
          <div className={styles.patientBasicInfo}>
            <h4 className={styles.patientName}>
              {patient.nombre} {patient.apellido}
            </h4>
            <p className={styles.patientCI}>
              <span className={styles.infoLabel}>CI:</span> {patient.ci || "No especificado"}
            </p>
          </div>
        </div>

        {/* Sección 1: Información Básica */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>👤</span>
            Información Básica
          </h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Género</label>
              <div className={styles.readonlyField}>
                {getGeneroTexto(formData.genero)}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Fecha de Nacimiento</label>
              <div className={styles.readonlyField}>
                {formatFecha(formData.fecha_nacimiento)}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Teléfono</label>
              <div className={styles.readonlyField}>
                {formData.telefono || "No especificado"}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <div className={styles.readonlyField}>
                {formData.email || "No especificado"}
              </div>
            </div>
          </div>
        </div>

        {/* Sección 2: Información de Contacto y Salud */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🏥</span>
            Información de Contacto y Salud
          </h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Dirección</label>
              <div className={styles.readonlyField}>
                {formData.direccion || "No especificada"}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Alergias Conocidas</label>
              <div className={styles.readonlyField}>
                {formData.alergias || "No especificadas"}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Condiciones Crónicas</label>
              <div className={styles.readonlyField}>
                {formData.condiciones_cronicas || "No especificadas"}
              </div>
            </div>
          </div>
        </div>

        {/* Sección 3: Contacto de Emergencia */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🆘</span>
            Contacto de Emergencia
          </h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre del Contacto</label>
              <div className={styles.readonlyField}>
                {formData.contacto_emergencia_nombre || "No especificado"}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Teléfono de Emergencia</label>
              <div className={styles.readonlyField}>
                {formData.contacto_emergencia_telefono || "No especificado"}
              </div>
            </div>
          </div>
        </div>

        {/* Acciones del modal */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => closeModal("viewPaciente")}
            className={styles.closeButton}
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  )
}