import { useContext } from "react";
import { ModalContext } from "../context/ModalProvider";

export function useModal() {
  console.log("🟣 useModal - LLAMADO");

  const ctx = useContext(ModalContext);

  if (!ctx) {
    throw new Error("useModal must be used inside a ModalProvider");
  }

  const {
    modals,
    modalData,
    openModal,
    closeModal,
    openRegistroWithPatient,
    openViewHistoria,
    openEditHistoria,
    openCrearPlanWithPatient,
    openAsignarGestor,
  } = ctx;

  // Helper para obtener datos de un modal específico
  const getModalData = (modalName) => {
    return modalData[modalName] || {};
  };

  return {
    modals,
    modalData,
    getModalData,
    openModal,
    closeModal,
    openRegistroWithPatient,
    openViewHistoria,
    openEditHistoria,
    openCrearPlanWithPatient,
    openAsignarGestor,
  };
}