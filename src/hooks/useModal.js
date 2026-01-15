import { useContext } from "react";
import { ModalContext } from "../context/ModalProvider";

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used inside a ModalProvider");

  const {
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
    openViewPaciente,
  } = ctx;

  const _getModalData = (modalName) => {
    return modalData?.[modalName] || {};
  };

  return {
    modals,
    modalData,
    getModalData: _getModalData,
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
    openViewPaciente,
  };
}

export default useModal;