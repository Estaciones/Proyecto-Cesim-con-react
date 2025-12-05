// src/context/DashboardContext.jsx
import { createContext } from "react";

export const DashboardContext = createContext();

// Valor por defecto para el contexto (opcional, pero útil para TypeScript/testing)
export const defaultDashboardContext = {
  // Estado principal
  user: null,
  profile: null,
  patients: null,
  plans: null,
  historia: null,
  selectedPatient: null,
  activeSection: "historia",
  loading: false,
  toast: null,
  
  // Estados de modales
  modals: {
    registro: false,
    crearPlan: false,
    nuevoPaciente: false,
    asignarGestor: false,
    editPres: false,
    editHistoria: false,
    editPlan: false,
    viewHistoria: false,
    viewPlan: false
  },
  
  // Estados de contexto para modales (datos que se están editando/viendo)
  currentEditHistoria: null,
  currentViewHistoria: null,
  currentEditPlan: null,
  currentViewPlan: null,
  currentEditPres: null,
  currentAsignarPacienteId: null,
  currentCrearPlanPacienteId: null,
  
  // Funciones de UI/estado
  showToast: () => {},
  logout: () => {},
  setActiveSection: () => {},
  selectPatient: () => {},
  
  // Funciones de carga de datos
  loadProfile: async () => {},
  loadPatients: async () => {},
  loadPlanes: async () => {},
  loadHistoria: async () => {},
  
  // Funciones de apertura/cierre de modales
  openModal: () => {},
  closeModal: () => {},
  openViewHistoria: () => {},
  openEditHistoria: () => {},
  openViewPlan: () => {},
  openEditPlan: () => {},
  openEditPresWithId: async () => {},
  openAsignarGestor: () => {},
  openCrearPlanWithPatient: () => {},
  
  // Funciones CRUD
  createRegistro: async () => {},
  createPlan: async () => {},
  updatePlan: async () => {},
  createPatient: async () => {},
  assignGestor: async () => {},
  updatePrescripcion: async () => {},
  updateHistoria: async () => {},
  
  // Setters directos (para casos especiales)
  setPatients: () => {},
  setPlans: () => {},
  setHistoria: () => {},
  
  // Nota: Estas funciones no están en el contexto por defecto, pero son útiles para debugging
  // __DEV__ functions (solo para desarrollo)
  // resetContext: () => {}, // Si quieres agregar una función de reset
};
// Solo exportamos el contexto, no componentes