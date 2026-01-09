// src/hooks/useModal.js  (reemplaza tu hook actual)
import { useContext } from "react";
import { ModalContext } from "../context/ModalProvider";

export function useModal() {
  console.log("🟣 useModal - LLAMADO");

  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used inside a ModalProvider");

  const {
    modals,
    modalData,
    getModalData, // not present in provider explicitly, but modalData is returned — we provide helper below
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
    openAsignarGestor
  } = ctx;

  // helper para acceder a datos de modal por nombre
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
    openAsignarGestor
  };
}

export default useModal;
