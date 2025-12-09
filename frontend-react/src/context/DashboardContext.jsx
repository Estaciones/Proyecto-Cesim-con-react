// src/context/DashboardContext.jsx
import { createContext } from "react";

/**
 * DashboardContext
 * - Se usa para proporcionar estado y funciones del dashboard a la app.
 * - El default (aquí) sirve como documentación y para tests/TS.
 */
export const DashboardContext = createContext(null);

export const defaultDashboardContext = {
  user: null,
  profile: null,
  patients: null,
  plans: null,
  historia: null,
  selectedPatient: null,
  activeSection: "historia",
  loading: false,
  toast: null,
  modals: {
    registro: false,
    crearPlan: false,
    nuevoPaciente: false,
    asignarGestor: false,
    editPres: false,
    editHistoria: false,
    editPlan: false,
    viewHistoria: false,
    viewPlan: false,
  },
  currentEditHistoria: null,
  currentViewHistoria: null,
  currentEditPlan: null,
  currentViewPlan: null,
  currentEditPres: null,
  currentAsignarPacienteId: null,
  currentCrearPlanPacienteId: null,
  showToast: () => {},
  logout: () => {},
  setActiveSection: () => {},
  selectPatient: () => {},
  loadProfile: async () => {},
  loadPatients: async () => {},
  loadPlanes: async () => {},
  loadHistoria: async () => {},
  openModal: () => {},
  closeModal: () => {},
  openViewHistoria: () => {},
  openEditHistoria: () => {},
  openViewPlan: () => {},
  openEditPlan: () => {},
  openEditPresWithId: async () => {},
  openAsignarGestor: () => {},
  openCrearPlanWithPatient: () => {},
  createRegistro: async () => {},
  createPlan: async () => {},
  updatePlan: async () => {},
  createPatient: async () => {},
  assignGestor: async () => {},
  updatePrescripcion: async () => {},
  updateHistoria: async () => {},
  setPatients: () => {},
  setPlans: () => {},
  setHistoria: () => {},
};
