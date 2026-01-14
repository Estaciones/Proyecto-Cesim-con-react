import React, { createContext, useCallback, useMemo, useState } from "react"

// eslint-disable-next-line react-refresh/only-export-components
export const ModalContext = createContext(null)

export function ModalProvider({ children }) {
  const [modals, setModals] = useState({
    registro: false,
    viewHistoria: false,
    editHistoria: false,
    crearPlan: false,
    viewPlan: false,
    editPlan: false,
    viewPres: false,
    editPres: false,
    asignarGestor: false,
    nuevoPaciente: false,
    editPaciente: false,
    viewPaciente: false
  })

  const [modalData, setModalData] = useState({
    registro: null,
    viewHistoria: null,
    editHistoria: null,
    crearPlan: null,
    viewPlan: null,
    editPlan: null,
    viewPres: null,
    editPres: null,
    asignarGestor: null,
    nuevoPaciente: null,
    editPaciente: null,
    viewPaciente: null
  })

  const openModal = useCallback((name, data = {}) => {
    setModals((s) => ({ ...s, [name]: true }))
    setModalData((d) => ({ ...d, [name]: data }))
  }, [])

  const closeModal = useCallback((name) => {
    setModals((s) => ({ ...s, [name]: false }))

    setTimeout(() => {
      setModalData((d) => {
        const newData = { ...d }
        newData[name] = null
        return newData
      })
    }, 300)
  }, [])

  const openRegistroWithPatient = useCallback(
    (pacienteId) => {
      const id = Number(pacienteId)
      if (isNaN(id)) {
        console.error("❌ ModalProvider - ID inválido:", pacienteId)
        return
      }
      openModal("registro", { currentRegistroPacienteId: id })
    },
    [openModal]
  )

  const openViewHistoria = useCallback(
    (record) => {
      openModal("viewHistoria", { currentViewHistoria: record })
    },
    [openModal]
  )

  const openEditHistoria = useCallback(
    (record) => {
      openModal("editHistoria", { currentEditHistoria: record })
    },
    [openModal]
  )

  const openCrearPlanWithPatient = useCallback(
    (pacienteId) => {
      openModal("crearPlan", { currentCrearPlanPacienteId: Number(pacienteId) })
    },
    [openModal]
  )

  const openViewPlan = useCallback(
    (plan) => {
      openModal("viewPlan", { currentViewPlan: plan })
    },
    [openModal]
  )

  const openEditPlan = useCallback(
    (plan) => {
      openModal("editPlan", { currentEditPlan: plan })
    },
    [openModal]
  )

  const openViewPrescripcion = useCallback(
    (pres) => {
      openModal("viewPres", { currentViewPres: pres })
    },
    [openModal]
  )

  const openEditPrescripcion = useCallback(
    (pres) => {
      openModal("editPres", { currentEditPres: pres })
    },
    [openModal]
  )

  const openAsignarGestor = useCallback(
    (pacienteId) => {
      openModal("asignarGestor", { currentAsignarPacienteId: pacienteId })
    },
    [openModal]
  )

  const openNuevoPaciente = useCallback(() => {
    openModal("nuevoPaciente")
  }, [openModal])

  const openEditPaciente = useCallback(
    (patient) => {
      openModal("editPaciente", { currentPatientData: patient })
    },
    [openModal]
  )

  const openViewPaciente = useCallback(
    (patient) => {
      openModal("viewPaciente", { currentPatientData: patient })
    },
    [openModal]
  )

  const value = useMemo(
    () => ({
      modals,
      modalData,
      openModal,
      closeModal,
      openRegistroWithPatient,
      openViewHistoria,
      openEditHistoria,
      openCrearPlanWithPatient,
      openViewPlan,
      openEditPlan,
      openViewPrescripcion,
      openEditPrescripcion,
      openAsignarGestor,
      openNuevoPaciente,
      openEditPaciente,
      openViewPaciente
    }),
    [
      modals,
      modalData,
      openModal,
      closeModal,
      openRegistroWithPatient,
      openViewHistoria,
      openEditHistoria,
      openCrearPlanWithPatient,
      openViewPlan,
      openEditPlan,
      openViewPrescripcion,
      openEditPrescripcion,
      openAsignarGestor,
      openNuevoPaciente,
      openEditPaciente,
      openViewPaciente
    ]
  )

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
}
