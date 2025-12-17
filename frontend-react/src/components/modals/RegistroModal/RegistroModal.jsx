// src/components/modals/RegistroModal/RegistroModal.jsx
import React, { useState, useEffect } from "react"
import Modal from "../Modal/Modal"
import { useModal } from "../../../hooks/useModal"
import { useHistory } from "../../../hooks/useHistory"
import { useToast } from "../../../hooks/useToast"
import { useAuthContext } from "../../../context/AuthContext"
import { usePatients } from "../../../hooks/usePatients"
import styles from "./RegistroModal.module.css"

export default function RegistroModal() {
  const { modals, closeModal, modalData } = useModal()
  const { createRegistro } = useHistory()
  const { showToast } = useToast()
  const { profile } = useAuthContext()
  const { patients, fetchPatients } = usePatients()

  const open = modals.registro
  const { currentRegistroPacienteId } = modalData

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    tipo: "general",
    id_paciente: ""
  })

  const [submitting, setSubmitting] = useState(false)
  const [patientsLoaded, setPatientsLoaded] = useState(false)

  // Cargar pacientes si no están cargados cuando se abre el modal
  useEffect(() => {
    if (open && !profile?.id_paciente) {
      const loadPatientsData = async () => {
        try {
          await fetchPatients()
        } catch (error) {
          console.error("Error al cargar pacientes:", error)
          showToast("Error al cargar la lista de pacientes", "error")
        } finally {
          setPatientsLoaded(true)
        }
      }

      loadPatientsData()
    }
  }, [open, profile, fetchPatients, showToast])

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      // Determinar el ID del paciente inicial
      let initialPatientId = ""

      // Prioridad 1: currentRegistroPacienteId (si viene de un botón específico)
      if (currentRegistroPacienteId) {
        initialPatientId = currentRegistroPacienteId.toString()
      }
      // Prioridad 2: profile.id_paciente (si el usuario es paciente)
      else if (profile?.id_paciente) {
        initialPatientId = profile.id_paciente.toString()
      }

      setFormData({
        titulo: "",
        descripcion: "",
        tipo: "general",
        id_paciente: initialPatientId
      })

      // Si el usuario es paciente, ya tenemos los datos
      if (profile?.id_paciente) {
        setPatientsLoaded(true)
      }
    } else {
      // Resetear cuando se cierra el modal
      setPatientsLoaded(false)
    }
  }, [open, currentRegistroPacienteId, profile])

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
      showToast("El título del registro es obligatorio", "error")
      return
    }

    if (!formData.descripcion.trim()) {
      showToast("La descripción del registro es obligatoria", "error")
      return
    }

    // Determinar el ID del paciente
    let id_paciente = null

    if (currentRegistroPacienteId) {
      id_paciente = currentRegistroPacienteId
    } else if (formData.id_paciente) {
      id_paciente = parseInt(formData.id_paciente)
    } else if (profile?.id_paciente) {
      id_paciente = profile.id_paciente
    }

    if (!id_paciente) {
      showToast("Selecciona un paciente", "error")
      return
    }

    // Obtener el CI del paciente
    let ci = null

    // Buscar el paciente en la lista para obtener el CI
    if (Array.isArray(patients)) {
      const patient = patients.find((p) => p.id_paciente === id_paciente)
      if (patient) {
        ci = patient.ci
      }
    }

    // Si no se encuentra en la lista, usar el CI del profile
    if (!ci && profile?.ci) {
      ci = profile.ci
    }

    if (!ci) {
      showToast("No se pudo identificar el CI del paciente", "error")
      return
    }

    setSubmitting(true)
    try {
      await createRegistro({
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        id_paciente: id_paciente,
        ci: ci
      })

      showToast("Registro guardado", "success")
      closeModal("registro")
    } catch (error) {
      console.error("Error al crear registro:", error)
      showToast(error.message || "Error al guardar el registro", "error")
    } finally {
      setSubmitting(false)
    }
  }

  // Filtrar pacientes disponibles
  const availablePatients = Array.isArray(patients)
    ? patients.filter(
        (p) => !profile?.id_paciente || p.id_paciente === profile.id_paciente
      )
    : []

  // Verificar si estamos cargando pacientes
  const isLoadingPatients = !profile?.id_paciente && !patientsLoaded

  // Obtener el paciente seleccionado para mostrar
  const getSelectedPatientInfo = () => {
    // Prioridad 1: currentRegistroPacienteId
    if (currentRegistroPacienteId && Array.isArray(patients)) {
      const patient = patients.find(
        (p) => p.id_paciente === currentRegistroPacienteId
      )
      if (patient) {
        return {
          id: patient.id_paciente,
          nombre: `${patient.nombre} ${patient.apellido}`,
          ci: patient.ci
        }
      }
    }

    // Prioridad 2: paciente del profile
    if (profile?.id_paciente && Array.isArray(patients)) {
      const patient = patients.find(
        (p) => p.id_paciente === profile.id_paciente
      )
      if (patient) {
        return {
          id: patient.id_paciente,
          nombre: `${patient.nombre} ${patient.apellido}`,
          ci: patient.ci
        }
      }
    }

    return null
  }

  const selectedPatientInfo = getSelectedPatientInfo()

  return (
    <Modal
      open={open}
      onClose={() => closeModal("registro")}
      title="Nuevo Registro Clínico"
      size="md">
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Información del paciente seleccionado */}
        {selectedPatientInfo && (
          <div className={styles.selectedPatientInfo}>
            <div className={styles.patientBadge}>
              <span className={styles.patientName}>
                {selectedPatientInfo.nombre}
              </span>
              <span className={styles.patientCI}>
                CI: {selectedPatientInfo.ci}
              </span>
              {currentRegistroPacienteId && (
                <span className={styles.preselectedBadge}>Preseleccionado</span>
              )}
            </div>
          </div>
        )}

        {/* Selector de paciente - solo visible si el usuario no es paciente y no hay paciente seleccionado */}
        {!profile?.id_paciente && !selectedPatientInfo && (
          <div className={styles.formGroup}>
            <label htmlFor="id_paciente" className={styles.label}>
              Paciente *
            </label>
            {isLoadingPatients ? (
              <div className={styles.loadingPatients}>
                <span className={styles.spinner}></span>
                Cargando lista de pacientes...
              </div>
            ) : (
              <select
                id="id_paciente"
                name="id_paciente"
                value={formData.id_paciente}
                onChange={handleInputChange}
                className={styles.select}
                required
                disabled={submitting || availablePatients.length === 0}>
                <option value="">
                  {availablePatients.length === 0
                    ? "No hay pacientes disponibles"
                    : "Selecciona un paciente"}
                </option>
                {availablePatients.map((patient) => (
                  <option key={patient.id_paciente} value={patient.id_paciente}>
                    {patient.nombre} {patient.apellido} - CI: {patient.ci}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

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
            placeholder="Ej: Consulta inicial, Evaluación, Seguimiento"
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
            disabled={submitting}>
            <option value="general">General</option>
            <option value="consulta">Consulta</option>
            <option value="evaluacion">Evaluación</option>
            <option value="seguimiento">Seguimiento</option>
            <option value="tratamiento">Tratamiento</option>
            <option value="diagnostico">Diagnóstico</option>
          </select>
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
            placeholder="Describe el registro clínico en detalle..."
            className={styles.textarea}
            rows={6}
            required
            disabled={submitting}
          />
        </div>

        <div className={styles.formFooter}>
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => closeModal("registro")}
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
                  Guardando...
                </>
              ) : (
                "Guardar Registro"
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
