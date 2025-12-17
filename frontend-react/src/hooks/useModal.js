// src/hooks/useModal.js
import { useState, useCallback } from 'react';

export function useModal() {
  const [modals, setModals] = useState({
    registro: false,
    crearPlan: false,
    nuevoPaciente: false,
    asignarGestor: false,
    editPres: false,
    editHistoria: false,
    editPlan: false,
    viewHistoria: false,
    viewPlan: false
  });

  const [modalData, setModalData] = useState({
    currentRegistroPacienteId: null,
    currentEditHistoria: null,
    currentViewHistoria: null,
    currentEditPlan: null,
    currentViewPlan: null,
    currentEditPres: null,
    currentAsignarPacienteId: null,
    currentCrearPlanPacienteId: null,
  });

  const openModal = useCallback((name, data = {}) => {
    setModals(prev => ({ ...prev, [name]: true }));
    setModalData(prev => ({ ...prev, ...data }));
  }, []);

  const closeModal = useCallback((name) => {
    setModals(prev => ({ ...prev, [name]: false }));
    // Limpiar datos específicos del modal
    if (name === 'registro') {
      setModalData(prev => ({ ...prev, currentRegistroPacienteId: null }));
    } else if (name === 'crearPlan') {
      setModalData(prev => ({ ...prev, currentCrearPlanPacienteId: null }));
    } else if (name === 'asignarGestor') {
      setModalData(prev => ({ ...prev, currentAsignarPacienteId: null }));
    } else if (name === 'editHistoria') {
      setModalData(prev => ({ ...prev, currentEditHistoria: null }));
    } else if (name === 'viewHistoria') {
      setModalData(prev => ({ ...prev, currentViewHistoria: null }));
    } else if (name === 'editPlan') {
      setModalData(prev => ({ ...prev, currentEditPlan: null }));
    } else if (name === 'viewPlan') {
      setModalData(prev => ({ ...prev, currentViewPlan: null }));
    } else if (name === 'editPres') {
      setModalData(prev => ({ ...prev, currentEditPres: null }));
    }
  }, []);

  // Funciones helpers específicas para mantener compatibilidad
  const openViewHistoria = useCallback((record) => {
    openModal('viewHistoria', { currentViewHistoria: record });
  }, [openModal]);

  const openEditHistoria = useCallback((record) => {
    openModal('editHistoria', { currentEditHistoria: record });
  }, [openModal]);

  const openViewPlan = useCallback((plan) => {
    openModal('viewPlan', { currentViewPlan: plan });
  }, [openModal]);

  const openEditPlan = useCallback((plan) => {
    openModal('editPlan', { currentEditPlan: plan });
  }, [openModal]);

  const openAsignarGestor = useCallback((pacienteId) => {
    openModal('asignarGestor', { currentAsignarPacienteId: pacienteId });
  }, [openModal]);

  const openCrearPlanWithPatient = useCallback((pacienteId) => {
    openModal('crearPlan', { currentCrearPlanPacienteId: pacienteId });
  }, [openModal]);

  const openRegistroWithPatient = useCallback((pacienteId) => {
    openModal('registro', { currentRegistroPacienteId: pacienteId });
  }, [openModal]);

  return {
    modals,
    modalData,
    openModal,
    closeModal,
    setModalData,
    // Funciones específicas
    openViewHistoria,
    openEditHistoria,
    openViewPlan,
    openEditPlan,
    openAsignarGestor,
    openCrearPlanWithPatient,
    openRegistroWithPatient,
  };
}