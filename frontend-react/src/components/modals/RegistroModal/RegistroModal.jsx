// src/components/RegistroModal/RegistroModal.jsx
import React, { useState, useEffect, useCallback, useRef } from "react"
import Modal from "../Modal/Modal"
import { useModal } from "../../../hooks/useModal"
import { useHistory } from "../../../hooks/useHistory"
import { useToast } from "../../../hooks/useToast"
import { useAuthContext } from "../../../context/AuthContext"
import { usePatients } from "../../../hooks/usePatients"
import styles from "./RegistroModal.module.css"

// 🔴 CONTADOR DE RENDERS (para la parte interna)
let renderCountInner = 0

// Wrapper: solo decide si montar el modal o no.
// IMPORTANTE: este wrapper **no** importa/llama hooks pesados,
// solo lee si el modal está abierto y, si no, evita montar el contenido.
export default function RegistroModal() {
  const { modals } = useModal()
  const open = !!modals.registro

  // Si el modal está cerrado no montamos el contenido (evita que se invoquen hooks)
  if (!open) return null

  // Solo cuando open === true montamos el contenido real
  return <RegistroModalInner />
}

function RegistroModalInner() {
  renderCountInner++
  console.log(`🔵 RegistroModalInner - RENDER #${renderCountInner}`)

  // Circuit breaker (solo en DEV)
  if (renderCountInner > 200) {
    console.error(
      "🚨 RegistroModalInner: posible bucle de renders (circuit breaker)"
    )
    renderCountInner = 0
  }

  // Ahora sí: hooks de negocio (solo se ejecutan cuando el modal está abierto)
  const { modals, closeModal, modalData } = useModal()
  const { createRegistro } = useHistory()
  const { showToast } = useToast()
  const { profile } = useAuthContext()
  const { patients, fetchPatients } = usePatients()

  console.log("🔵 RegistroModalInner - props:", {
    modalsRegistro: modals.registro,
    profileId: profile?.id_paciente,
    patientsCount: patients?.length || 0
  })

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

  // Ref para evitar llamadas concurrentes a loadPatientsData
  const loadInFlightRef = useRef(false)

  const loadPatientsData = useCallback(async () => {
    console.log("🔄 RegistroModalInner.loadPatientsData - INICIO")
    if (loadInFlightRef.current) {
      console.log("🔒 loadPatientsData - ya hay una carga en curso, saliendo")
      return
    }
    loadInFlightRef.current = true

    try {
      await fetchPatients()
      console.log("✅ loadPatientsData - fetchPatients completado")
      setPatientsLoaded(true)
    } catch (error) {
      console.error("❌ loadPatientsData - ERROR:", error)
      showToast("Error al cargar la lista de pacientes", "error")
    } finally {
      loadInFlightRef.current = false
      console.log("🏁 loadPatientsData - FIN")
    }
  }, [fetchPatients, showToast])

  // Efecto: cargar pacientes si hace falta (y solo cuando el modal está abierto)
  useEffect(() => {
    console.log("🎯 useEffect carga pacientes - ejecutando check")
    const shouldLoad = open && !profile?.id_paciente && !patientsLoaded
    console.log({
      open,
      profileId: profile?.id_paciente,
      patientsLoaded,
      shouldLoad
    })
    if (shouldLoad) loadPatientsData()
  }, [open, profile?.id_paciente, patientsLoaded, loadPatientsData])

  // Efecto: inicializar formulario al abrir/ cerrar modal
  useEffect(() => {
    console.log("🎯 useEffect inicialización modal - ejecutando")
    if (open) {
      let initialPatientId = ""
      if (currentRegistroPacienteId) {
        initialPatientId = currentRegistroPacienteId.toString()
      } else if (profile?.id_paciente) {
        initialPatientId = profile.id_paciente.toString()
      }
      setFormData({
        titulo: "",
        descripcion: "",
        tipo: "general",
        id_paciente: initialPatientId
      })
      if (profile?.id_paciente) setPatientsLoaded(true)
    } else {
      setPatientsLoaded(false)
    }
  }, [open, currentRegistroPacienteId, profile])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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

    let id_paciente = null
    if (currentRegistroPacienteId) id_paciente = currentRegistroPacienteId
    else if (formData.id_paciente) id_paciente = parseInt(formData.id_paciente)
    else if (profile?.id_paciente) id_paciente = profile.id_paciente

    if (!id_paciente) {
      showToast("Selecciona un paciente", "error")
      return
    }

    let ci = null
    if (Array.isArray(patients)) {
      const patient = patients.find((p) => p.id_paciente === id_paciente)
      if (patient) ci = patient.ci
    }
    if (!ci && profile?.ci) ci = profile.ci
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
        id_paciente,
        ci
      })
      showToast("Registro guardado", "success")
      closeModal("registro")
    } catch (err) {
      console.error("❌ Error creando registro:", err)
      showToast(err.message || "Error al guardar el registro", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const availablePatients = Array.isArray(patients)
    ? patients.filter(
        (p) => !profile?.id_paciente || p.id_paciente === profile.id_paciente
      )
    : []

  const isLoadingPatients = !profile?.id_paciente && !patientsLoaded

  const getSelectedPatientInfo = () => {
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

  // Limpiar contador al desmontar (solo inner)
  useEffect(() => {
    return () => {
      renderCountInner = 0
    }
  }, [])

  return (
    <Modal
      open={open}
      onClose={() => closeModal("registro")}
      title="Nuevo Registro Clínico"
      size="md">
      <form onSubmit={handleSubmit} className={styles.form}>
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
                  <span className={styles.spinner}></span>Guardando...
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
