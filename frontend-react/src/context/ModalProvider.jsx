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
    viewPlan: false,
    editPlan: false,
    viewPres: false,
    editPres: false,
    asignarGestor: false,
    nuevoPaciente: false,
    editPaciente: false, 
    viewPaciente: false,
  });

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
    viewPaciente: null,
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
      openModal("crearPlan", { currentCrearPlanPacienteId: Number(pacienteId) });
    },
    [openModal]
  );
  
  const openViewPlan = useCallback((plan) => {
    console.log("📄 ModalProvider - Abriendo vista plan:", plan?.id_plan || plan?.id);
    openModal("viewPlan", { currentViewPlan: plan });
  }, [openModal]);
  
  const openEditPlan = useCallback((plan) => {
    console.log("✏️ ModalProvider - Abriendo edición plan:", plan?.id_plan || plan?.id);
    openModal("editPlan", { currentEditPlan: plan });
  }, [openModal]);
  
  const openViewPrescripcion = useCallback((pres) => {
    console.log("💊 ModalProvider - Abriendo vista prescripción:", pres?.id_prescripcion || pres?.id);
    openModal("viewPres", { currentViewPres: pres });
  }, [openModal]);
  
  const openEditPrescripcion = useCallback((pres) => {
    console.log("✏️ ModalProvider - Abriendo edición prescripción:", pres?.id_prescripcion || pres?.id);
    openModal("editPres", { currentEditPres: pres });
  }, [openModal]);
  
  const openAsignarGestor = useCallback(
    (pacienteId) => {
      console.log("👥 ModalProvider - Abriendo asignar gestor para paciente:", pacienteId);
      openModal("asignarGestor", { currentAsignarPacienteId: pacienteId });
    },
    [openModal]
  );
  
  const openNuevoPaciente = useCallback(() => {
    console.log("➕ ModalProvider - Abriendo nuevo paciente");
    openModal("nuevoPaciente");
  }, [openModal]);
  
  const openEditPaciente = useCallback((patient) => {
    console.log("✏️ ModalProvider - Abriendo edición paciente:", patient?.id_paciente);
    openModal("editPaciente", { currentPatientData: patient });
  }, [openModal]);

  const openViewPaciente = useCallback((patient) => {
  console.log("👁️ ModalProvider - Abriendo vista paciente:", patient?.id_paciente);
  openModal("viewPaciente", { currentPatientData: patient });
}, [openModal]);

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
      openViewPaciente,
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
      openViewPaciente,
    ]
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}