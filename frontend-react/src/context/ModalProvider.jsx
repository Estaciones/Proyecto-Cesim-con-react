import React, { createContext, useCallback, useMemo, useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  console.log("🟣 ModalProvider - RENDER");

  const [modals, setModals] = useState({
    registro: false,
    viewHistoria: false,
    editHistoria: false,
    crearPlan: false,
    asignarGestor: false,
  });

  // Estructura más clara: cada modal tiene su propio objeto de datos
  const [modalData, setModalData] = useState({
    registro: null,        // { currentRegistroPacienteId: number }
    viewHistoria: null,    // { currentViewHistoria: object }
    editHistoria: null,    // { currentEditHistoria: object }
    crearPlan: null,       // { currentCrearPlanPacienteId: number }
    asignarGestor: null,   // { currentAsignarPacienteId: number }
  });

  const openModal = useCallback((name, data = {}) => {
    console.log("🚪 ModalProvider - ABRIENDO modal:", name, data);
    
    setModals((s) => {
      const newState = { ...s, [name]: true };
      console.log("🚪 ModalProvider - Nuevo estado de modales:", newState);
      return newState;
    });
    
    setModalData((d) => {
      const newData = { ...d, [name]: data };
      console.log("🚪 ModalProvider - Nuevo modalData:", newData);
      return newData;
    });
  }, []);

  const closeModal = useCallback((name) => {
    console.log("🚪 ModalProvider - CERRANDO modal:", name);
    
    setModals((s) => ({ ...s, [name]: false }));
    
    // Limpiar datos después de un breve delay
    setTimeout(() => {
      setModalData((d) => {
        const newData = { ...d };
        newData[name] = null;
        console.log("🧹 ModalProvider - Limpiando datos de modal:", name);
        return newData;
      });
    }, 300);
  }, []);

  // Helper específicos
  const openRegistroWithPatient = useCallback(
    (pacienteId) => {
      console.log("👤 ModalProvider - Abriendo registro para paciente ID:", pacienteId);
      // Asegurar que sea número
      const id = Number(pacienteId);
      if (isNaN(id)) {
        console.error("❌ ModalProvider - ID inválido:", pacienteId);
        return;
      }
      openModal("registro", { currentRegistroPacienteId: id });
    },
    [openModal]
  );

  const openViewHistoria = useCallback(
    (record) => {
      console.log("👁️ ModalProvider - Abriendo vista historia:", record?.id_registro);
      openModal("viewHistoria", { currentViewHistoria: record });
    },
    [openModal]
  );

  const openEditHistoria = useCallback(
    (record) => {
      console.log("✏️ ModalProvider - Abriendo edición historia:", record?.id_registro);
      openModal("editHistoria", { currentEditHistoria: record });
    },
    [openModal]
  );

  const openCrearPlanWithPatient = useCallback(
    (pacienteId) => {
      console.log("📋 ModalProvider - Abriendo crear plan para paciente:", pacienteId);
      openModal("crearPlan", { currentCrearPlanPacienteId: pacienteId });
    },
    [openModal]
  );

  const openAsignarGestor = useCallback(
    (pacienteId) => {
      console.log("👥 ModalProvider - Abriendo asignar gestor para paciente:", pacienteId);
      openModal("asignarGestor", { currentAsignarPacienteId: pacienteId });
    },
    [openModal]
  );

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
      openAsignarGestor,
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
      openAsignarGestor,
    ]
  );

  console.log("🟣 ModalProvider - Valor del contexto:", {
    modals,
    modalData,
    hasRegistroData: !!modalData.registro?.currentRegistroPacienteId,
    registroId: modalData.registro?.currentRegistroPacienteId,
  });

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}