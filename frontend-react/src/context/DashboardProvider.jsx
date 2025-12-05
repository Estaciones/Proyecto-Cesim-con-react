// src/context/DashboardProvider.jsx
import { useState, useEffect, useCallback } from "react";
import { DashboardContext } from "./DashboardContext";
import { apiUrl } from "../utils/api";

export function DashboardProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { 
      return JSON.parse(localStorage.getItem("user") || "null"); 
    } catch { 
      return null; 
    }
  });

  const [profile, setProfile] = useState(null);
  const [patients, setPatients] = useState(null);
  const [plans, setPlans] = useState(null);
  const [historia, setHistoria] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeSection, setActiveSection] = useState("historia");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Estados de modales
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

  // Estados de contexto para modales
  const [currentEditHistoria, setCurrentEditHistoria] = useState(null);
  const [currentViewHistoria, setCurrentViewHistoria] = useState(null);
  const [currentEditPlan, setCurrentEditPlan] = useState(null);
  const [currentViewPlan, setCurrentViewPlan] = useState(null);
  const [currentEditPres, setCurrentEditPres] = useState(null);
  const [currentAsignarPacienteId, setCurrentAsignarPacienteId] = useState(null);
  const [currentCrearPlanPacienteId, setCurrentCrearPlanPacienteId] = useState(null);

  // -------------------- helpers --------------------
  const showToast = useCallback((text, type = "info", timeout = 3000) => {
    setToast({ text, type });
    setTimeout(() => setToast(null), timeout);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    setUser(null);
    setProfile(null);
    setPatients(null);
    setPlans(null);
    setHistoria(null);
    setSelectedPatient(null);
  }, []);

  // -------------------- loaders --------------------
  const loadProfile = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(apiUrl(`profile?id=${encodeURIComponent(user.id)}`), { 
        credentials: "include" 
      });
      if (res.ok) {
        setProfile(await res.json());
      } else {
        setProfile({ 
          id_usuario: user.id, 
          email: user.email, 
          nombre_usuario: user.nombre_usuario, 
          tipo_usuario: user.tipo 
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setProfile({ 
        id_usuario: user.id, 
        email: user.email, 
        nombre_usuario: user.nombre_usuario, 
        tipo_usuario: user.tipo 
      });
    }
  }, [user]);

  const loadPatients = useCallback(async () => {
    if (!user || !profile) return;
    setLoading(true);
    try {
      let url = apiUrl("pacientes");
      if (profile && profile.id_usuario && (profile.tipo_usuario === "medico" || user.tipo === "medico")) {
        url = apiUrl(`pacientes?medico_id=${profile.id_usuario}`);
      } else if (profile && profile.id_usuario && profile.tipo_usuario && profile.tipo_usuario.includes("gestor")) {
        url = apiUrl(`pacientes?gestor_id=${profile.id_usuario}`);
      }
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("No se pudieron cargar los pacientes");
      const data = await res.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setPatients([]);
      showToast("Error cargando pacientes", "error");
    } finally { 
      setLoading(false); 
    }
  }, [user, profile, showToast]);

  const loadPlanes = useCallback(async () => {
    if (!user || !profile) return;
    setLoading(true);
    try {
      let url = apiUrl("plan_tratamiento");
      if (profile?.id_paciente) {
        url = apiUrl(`plan_tratamiento?id_paciente=${profile.id_paciente}`);
      } else if (profile?.ci && user?.tipo === "paciente") {
        url = apiUrl(`plan_tratamiento?ci=${encodeURIComponent(profile.ci)}`);
      }
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("No se pudieron cargar los planes");
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setPlans([]);
      showToast("Error cargando planes", "error");
    } finally { 
      setLoading(false); 
    }
  }, [user, profile, showToast]);

  const loadHistoria = useCallback(async () => {
    if (!user || !profile) return;
    setLoading(true);
    try {
      let url = apiUrl("historia");
      if (profile?.id_paciente) {
        url = apiUrl(`historia?id_paciente=${profile.id_paciente}`);
      } else if (profile?.ci) {
        url = apiUrl(`historia?ci=${encodeURIComponent(profile.ci)}`);
      }
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("No se pudo cargar la historia");
      const data = await res.json();
      setHistoria(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setHistoria([]);
      showToast("Error cargando historia clínica", "error");
    } finally { 
      setLoading(false); 
    }
  }, [user, profile, showToast]);

  // -------------------- modal open helpers --------------------
  const openModal = useCallback((name) => {
    setModals(prev => ({ ...prev, [name]: true }));
  }, []);

  const closeModal = useCallback((name) => {
    setModals(prev => ({ ...prev, [name]: false }));
  }, []);

  const openViewHistoria = useCallback((record) => {
    setCurrentViewHistoria(record || null);
    openModal("viewHistoria");
  }, [openModal]);

  const openEditHistoria = useCallback((record) => {
    setCurrentEditHistoria(record ? { ...record } : null);
    openModal("editHistoria");
  }, [openModal]);

  const openViewPlan = useCallback((plan) => {
    setCurrentViewPlan(plan || null);
    openModal("viewPlan");
  }, [openModal]);

  const openEditPlan = useCallback((plan) => {
    setCurrentEditPlan(plan ? { ...plan } : null);
    openModal("editPlan");
  }, [openModal]);

  const openEditPresWithId = useCallback(async (presId) => {
    try {
      const res = await fetch(apiUrl(`prescripcion/${presId}`), { 
        credentials: "include" 
      });
      if (!res.ok) throw new Error("No se pudo cargar la prescripción");
      const pres = await res.json();
      setCurrentEditPres(pres);
      openModal("editPres");
    } catch (err) {
      console.error(err);
      showToast("No se pudo cargar la prescripción", "error");
    }
  }, [openModal, showToast]);

  const openAsignarGestor = useCallback((pacienteId) => {
    setCurrentAsignarPacienteId(pacienteId);
    openModal("asignarGestor");
  }, [openModal]);

  const openCrearPlanWithPatient = useCallback((pacienteId) => {
    setCurrentCrearPlanPacienteId(pacienteId);
    openModal("crearPlan");
  }, [openModal]);

  const selectPatient = useCallback(async (patient) => {
    setSelectedPatient(patient || null);
    if (patient && profile) {
      setProfile(prev => ({ 
        ...prev, 
        id_paciente: patient.id_paciente, 
        ci: patient.ci 
      }));
    }
    await Promise.all([loadHistoria(), loadPlanes()]);
    setActiveSection("historia");
  }, [profile, loadHistoria, loadPlanes]);

  // -------------------- CRUD Actions --------------------
  const createRegistro = useCallback(async ({ titulo, descripcion, id_paciente, ci }) => {
    try {
      const payload = { titulo, descripcion, id_paciente, ci };
      const res = await fetch(apiUrl("historia"), { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        credentials: "include", 
        body: JSON.stringify(payload) 
      });
      if (!res.ok) throw new Error("Error al guardar registro");
      await loadHistoria();
      showToast("Registro guardado", "success");
      setCurrentEditHistoria(null);
      closeModal("registro");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Error", "error");
      throw err;
    }
  }, [loadHistoria, showToast, closeModal]);

  const createPlan = useCallback(async ({ titulo, descripcion, fecha_inicio, id_paciente, prescripciones }) => {
    try {
      const payload = { 
        id_medico: profile?.id_usuario, 
        id_paciente, 
        titulo, 
        descripcion, 
        fecha_inicio, 
        prescripciones: prescripciones || [] 
      };
      const res = await fetch(apiUrl("plan_tratamiento"), { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        credentials: "include", 
        body: JSON.stringify(payload) 
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "No se pudo crear el plan");
      }
      await loadPlanes();
      showToast("Plan creado", "success");
      setCurrentCrearPlanPacienteId(null);
      closeModal("crearPlan");
    } catch (err) {
      console.error(err); 
      showToast(err.message || "Error", "error"); 
      throw err;
    }
  }, [profile, loadPlanes, showToast, closeModal]);

  const updatePlan = useCallback(async ({ planId, titulo, descripcion, fecha_inicio, estado, resumen_egreso }) => {
    try {
      const res = await fetch(apiUrl(`plan_tratamiento/${planId}`), { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" }, 
        credentials: "include", 
        body: JSON.stringify({ titulo, descripcion, fecha_inicio, estado, resumen_egreso }) 
      });
      if (!res.ok) { 
        const err = await res.json().catch(() => ({})); 
        throw new Error(err.error || "No se pudo actualizar el plan"); 
      }
      await loadPlanes(); 
      showToast("Plan actualizado", "success");
      setCurrentEditPlan(null); 
      closeModal("editPlan");
    } catch (err) { 
      console.error(err); 
      showToast(err.message || "Error", "error"); 
      throw err; 
    }
  }, [loadPlanes, showToast, closeModal]);

  const createPatient = useCallback(async (patientData) => {
    try {
      const res = await fetch(apiUrl("pacientes"), { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        credentials: "include", 
        body: JSON.stringify(patientData) 
      });
      if (!res.ok) { 
        const err = await res.json().catch(() => ({})); 
        throw new Error(err.error || `Error ${res.status}`); 
      }
      await loadPatients(); 
      showToast("Paciente creado y asignado", "success");
      closeModal("nuevoPaciente");
    } catch (err) { 
      console.error(err); 
      showToast(err.message || "Error al crear paciente", "error"); 
      throw err; 
    }
  }, [loadPatients, showToast, closeModal]);

  const assignGestor = useCallback(async ({ id_gestor, id_paciente }) => {
    try {
      const res = await fetch(apiUrl("asignar_gestor"), { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        credentials: "include", 
        body: JSON.stringify({ id_gestor, id_paciente }) 
      });
      if (!res.ok) { 
        const err = await res.json().catch(() => ({})); 
        throw new Error(err.error || "No se pudo asignar gestor"); 
      }
      await loadPatients(); 
      showToast("Gestor asignado", "success"); 
      setCurrentAsignarPacienteId(null); 
      closeModal("asignarGestor");
    } catch (err) { 
      console.error(err); 
      showToast(err.message || "Error", "error"); 
      throw err; 
    }
  }, [loadPatients, showToast, closeModal]);

  const updatePrescripcion = useCallback(async ({ presId, descripcion, observaciones, cumplimiento }) => {
    try {
      const res = await fetch(apiUrl(`prescripcion/${presId}`), { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" }, 
        credentials: "include", 
        body: JSON.stringify({ descripcion, observaciones, cumplimiento }) 
      });
      if (!res.ok) { 
        const err = await res.json().catch(() => ({})); 
        throw new Error(err.error || "No se pudo actualizar la prescripción"); 
      }
      await loadPlanes(); 
      showToast("Prescripción actualizada", "success"); 
      setCurrentEditPres(null); 
      closeModal("editPres");
    } catch (err) { 
      console.error(err); 
      showToast(err.message || "Error", "error"); 
      throw err; 
    }
  }, [loadPlanes, showToast, closeModal]);

  const updateHistoria = useCallback(async ({ recordId, titulo, descripcion }) => {
    try {
      const res = await fetch(apiUrl(`historia/${recordId}`), { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" }, 
        credentials: "include", 
        body: JSON.stringify({ titulo, descripcion }) 
      });
      if (!res.ok) { 
        const err = await res.json().catch(() => ({})); 
        throw new Error(err.error || "No se pudo actualizar el registro"); 
      }
      await loadHistoria(); 
      showToast("Registro actualizado", "success"); 
      setCurrentEditHistoria(null); 
      closeModal("editHistoria");
    } catch (err) { 
      console.error(err); 
      showToast(err.message || "Error", "error"); 
      throw err; 
    }
  }, [loadHistoria, showToast, closeModal]);

  // -------------------- init effects --------------------
  useEffect(() => { 
    if (!user) return; 
    loadProfile();
  }, [user, loadProfile]);

  useEffect(() => {
    if (!profile) return;
    if (activeSection === "pacientes") loadPatients();
    if (activeSection === "plan") loadPlanes();
    if (activeSection === "historia") loadHistoria();
  }, [profile, activeSection, loadPatients, loadPlanes, loadHistoria]);

  // -------------------- export value --------------------
  const value = {
    // Estado
    user,
    setUser,
    profile,
    patients,
    plans,
    historia,
    selectedPatient,
    activeSection,
    loading,
    toast,
    modals,
    
    // Estados de contexto para modales
    currentEditHistoria,
    currentViewHistoria,
    currentEditPlan,
    currentViewPlan,
    currentEditPres,
    currentAsignarPacienteId,
    currentCrearPlanPacienteId,
    
    // Funciones de UI
    showToast,
    logout,
    setActiveSection,
    selectPatient,
    
    // Funciones de carga
    loadProfile,
    loadPatients,
    loadPlanes,
    loadHistoria,
    
    // Funciones de modales
    openModal,
    closeModal,
    openViewHistoria,
    openEditHistoria,
    openViewPlan,
    openEditPlan,
    openEditPresWithId,
    openAsignarGestor,
    openCrearPlanWithPatient,
    
    // Funciones CRUD
    createRegistro,
    createPlan,
    updatePlan,
    createPatient,
    assignGestor,
    updatePrescripcion,
    updateHistoria,
    
    // Setters
    setPatients,
    setPlans,
    setHistoria,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}