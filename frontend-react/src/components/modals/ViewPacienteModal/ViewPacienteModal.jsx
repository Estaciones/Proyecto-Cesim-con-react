import React, { useEffect, useState } from "react"
import Modal from "../Modal/Modal"
import { useModal } from "../../../hooks/useModal"
import styles from "./ViewPacienteModal.module.css"

export default function ViewPacienteModal() {
  const { modals, closeModal, modalData } = useModal()

  const open = !!modals.viewPaciente
  const patient = modalData.viewPaciente?.currentPatientData

  console.log("📋 ViewPacienteModal - patient data:", patient) // Para depuración
  console.log("📋 ViewPacienteModal - género raw:", patient?.genero) // Ver el valor crudo

  const [formData, setFormData] = useState({
    direccion: "",
    alergias: "",
    condiciones_cronicas: "",
    contacto_emergencia_nombre: "",
    contacto_emergencia_telefono: "",
    telefono: "",
    email: "",
    genero: ""
  })

  useEffect(() => {
    if (open && patient) {
      console.log("🔄 ViewPacienteModal - Setting form data from patient:", patient)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        direccion: patient.direccion || "",
        alergias: patient.alergias || "",
        condiciones_cronicas: patient.condiciones_cronicas || "",
        contacto_emergencia_nombre: patient.contacto_emergencia_nombre || "",
        contacto_emergencia_telefono: patient.contacto_emergencia_telefono || "",
        telefono: patient.telefono || "",
        email: patient.email || "",
        genero: patient.genero || ""
      })
    }
  }, [open, patient])

  const getGeneroTexto = (genero) => {
    // Limpiar el valor: remover espacios en blanco y convertir a mayúscula
    const generoLimpio = genero ? genero.trim().toUpperCase() : ''
    
    console.log("🔍 getGeneroTexto - valor limpio:", generoLimpio, "original:", genero)
    
    switch(generoLimpio) {
      case 'M': return 'Masculino'
      case 'F': return 'Femenino'
      case 'O': return 'Otro'
      default: return 'No especificado'
    }
  }

  if (!patient) {
    console.log("❌ ViewPacienteModal - No patient data available")
    return null
  }

  return (
    <Modal
      open={open}
      onClose={() => closeModal("viewPaciente")}
      title={`Información del Paciente: ${patient.nombre || ''} ${patient.apellido || ''}`}
      size="lg"
    >
      <div className={styles.container}>
        {/* Información del paciente */}
        <div className={styles.patientInfoHeader}>
          <div className={styles.patientBasicInfo}>
            <h4 className={styles.patientName}>
              {patient.nombre || ''} {patient.apellido || ''}
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
                {getGeneroTexto(patient.genero || formData.genero)}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Teléfono</label>
              <div className={styles.readonlyField}>
                {patient.telefono || formData.telefono || "No especificado"}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <div className={styles.readonlyField}>
                {patient.email || formData.email || "No especificado"}
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
                {patient.direccion || formData.direccion || "No especificada"}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Alergias Conocidas</label>
              <div className={styles.readonlyField}>
                {patient.alergias || formData.alergias || "No especificadas"}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Condiciones Crónicas</label>
              <div className={styles.readonlyField}>
                {patient.condiciones_cronicas || formData.condiciones_cronicas || "No especificadas"}
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
                {patient.contacto_emergencia_nombre || formData.contacto_emergencia_nombre || "No especificado"}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Teléfono de Emergencia</label>
              <div className={styles.readonlyField}>
                {patient.contacto_emergencia_telefono || formData.contacto_emergencia_telefono || "No especificado"}
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