// src/context/DashboardProvider.jsx
import React, { useState, useEffect, useCallback, useRef } from "react"
import { DashboardContext } from "./DashboardContext"
import { apiUrl } from "../utils/api"

/**
 * DashboardProvider (refactor para evitar renders múltiples y race conditions)
 */
export function DashboardProvider({ children }) {
  // --- Estado inicial (intenta leer localStorage) ---
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user")
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const [profile, setProfile] = useState(null)

  // datos
  const [patients, setPatients] = useState(null)
  const [plans, setPlans] = useState(null)
  const [historia, setHistoria] = useState(null)

  const [selectedPatient, setSelectedPatient] = useState(null)
  const [activeSection, setActiveSection] = useState("historia")

  // loading por recurso (evita parpadeos)
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [loadingPlanes, setLoadingPlanes] = useState(false)
  const [loadingHistoria, setLoadingHistoria] = useState(false)

  // loading público (compatibilidad)
  const loading = loadingPatients || loadingPlanes || loadingHistoria

  const [toast, setToast] = useState(null)
  const [currentRegistroPacienteId, setCurrentRegistroPacienteId] =
    useState(null)
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
  })

  const [currentEditHistoria, setCurrentEditHistoria] = useState(null)
  const [currentViewHistoria, setCurrentViewHistoria] = useState(null)
  const [currentEditPlan, setCurrentEditPlan] = useState(null)
  const [currentViewPlan, setCurrentViewPlan] = useState(null)
  const [currentEditPres, setCurrentEditPres] = useState(null)
  const [currentAsignarPacienteId, setCurrentAsignarPacienteId] = useState(null)
  const [currentCrearPlanPacienteId, setCurrentCrearPlanPacienteId] =
    useState(null)

  // ---------- request id refs (evitan race conditions) ----------
  const patientsReqRef = useRef(0)
  const planesReqRef = useRef(0)
  const historiaReqRef = useRef(0)
  // -------------------------------------------------------------

  // -------------------- helpers --------------------
  const showToast = useCallback((text, type = "info", timeout = 3000) => {
    setToast({ text, type })
    if (timeout > 0) {
      setTimeout(() => setToast(null), timeout)
    }
  }, [])

  // `login` actualiza estado y localStorage al mismo tiempo
  const login = useCallback((userData) => {
    if (userData) {
      try {
        localStorage.setItem("user", JSON.stringify(userData))
      } catch (e) {
        console.warn("No se pudo escribir localStorage:", e)
      }
      setUser(userData)
    } else {
      // logout parcial
      localStorage.removeItem("user")
      setUser(null)
    }
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("user")
    } catch (e) {
      console.warn("No se pudo eliminar localStorage:", e)
    }
    setUser(null)
    setProfile(null)
    setPatients(null)
    setPlans(null)
    setHistoria(null)
    setSelectedPatient(null)
  }, [])

  // -------------------- loaders (con requestId) --------------------
  const loadProfile = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch(
        apiUrl(`profile?id=${encodeURIComponent(user.id)}`),
        { credentials: "include" }
      )
      if (res.ok) {
        setProfile(await res.json())
      } else {
        setProfile({
          id_usuario: user.id,
          email: user.email,
          nombre_usuario: user.nombre_usuario,
          tipo_usuario: user.tipo
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      setProfile({
        id_usuario: user.id,
        email: user.email,
        nombre_usuario: user.nombre_usuario,
        tipo_usuario: user.tipo
      })
    }
  }, [user])

  const loadPatients = useCallback(async () => {
    if (!user || !profile) return
    const reqId = ++patientsReqRef.current
    setLoadingPatients(true)
    try {
      let url = apiUrl("pacientes")
      if (
        profile &&
        profile.id_usuario &&
        (profile.tipo_usuario === "medico" || user.tipo === "medico")
      ) {
        url = apiUrl(`pacientes?medico_id=${profile.id_usuario}`)
      } else if (
        profile &&
        profile.id_usuario &&
        profile.tipo_usuario &&
        profile.tipo_usuario.includes("gestor")
      ) {
        url = apiUrl(`pacientes?gestor_id=${profile.id_usuario}`)
      }
      const res = await fetch(url, { credentials: "include" })
      if (!res.ok) throw new Error("No se pudieron cargar los pacientes")
      const data = await res.json()
      // ignorar si ya hay una petición más reciente
      if (patientsReqRef.current === reqId) {
        setPatients(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error(err)
      if (patientsReqRef.current === reqId) {
        setPatients([])
        showToast("Error cargando pacientes", "error")
      }
    } finally {
      if (patientsReqRef.current === reqId) setLoadingPatients(false)
    }
  }, [user, profile, showToast])

  const loadPlanes = useCallback(async () => {
    if (!user) return
    const reqId = ++planesReqRef.current
    setLoadingPlanes(true)
    try {
      let url = apiUrl("plan_tratamiento")

      // Lógica para diferentes tipos / paciente seleccionado
      if (user?.tipo === "paciente" || profile?.tipo_usuario === "paciente") {
        if (profile?.ci) {
          url = apiUrl(`plan_tratamiento?ci=${encodeURIComponent(profile.ci)}`)
        } else if (profile?.id_paciente) {
          url = apiUrl(`plan_tratamiento?id_paciente=${profile.id_paciente}`)
        }
      } else if (selectedPatient) {
        if (selectedPatient.ci) {
          url = apiUrl(
            `plan_tratamiento?ci=${encodeURIComponent(selectedPatient.ci)}`
          )
        } else if (selectedPatient.id_paciente) {
          url = apiUrl(
            `plan_tratamiento?id_paciente=${selectedPatient.id_paciente}`
          )
        }
      } else if (
        profile?.tipo_usuario === "medico" ||
        profile?.tipo_usuario?.includes("gestor")
      ) {
        // médico/gestor sin paciente seleccionado -> no cargar
        if (planesReqRef.current === reqId) {
          setPlans([])
        }
        return
      }

      const res = await fetch(url, { credentials: "include" })
      if (!res.ok) throw new Error("No se pudieron cargar los planes")
      const data = await res.json()
      if (planesReqRef.current === reqId) {
        setPlans(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error("Error en loadPlanes:", err)
      if (planesReqRef.current === reqId) {
        setPlans([])
        showToast("Error cargando planes", "error")
      }
    } finally {
      if (planesReqRef.current === reqId) setLoadingPlanes(false)
    }
  }, [user, profile, selectedPatient, showToast])

  const loadHistoria = useCallback(async () => {
    if (!user) return
    const reqId = ++historiaReqRef.current
    setLoadingHistoria(true)
    try {
      let url = apiUrl("historia")

      if (user?.tipo === "paciente" || profile?.tipo_usuario === "paciente") {
        if (profile?.ci) {
          url = apiUrl(`historia?ci=${encodeURIComponent(profile.ci)}`)
        } else if (profile?.id_paciente) {
          url = apiUrl(`historia?id_paciente=${profile.id_paciente}`)
        }
      } else if (selectedPatient) {
        if (selectedPatient.ci) {
          url = apiUrl(`historia?ci=${encodeURIComponent(selectedPatient.ci)}`)
        } else if (selectedPatient.id_paciente) {
          url = apiUrl(`historia?id_paciente=${selectedPatient.id_paciente}`)
        }
      } else if (
        profile?.tipo_usuario === "medico" ||
        profile?.tipo_usuario?.includes("gestor")
      ) {
        if (historiaReqRef.current === reqId) {
          setHistoria([])
        }
        return
      }

      const res = await fetch(url, { credentials: "include" })
      if (!res.ok) throw new Error("No se pudo cargar la historia")
      const data = await res.json()
      if (historiaReqRef.current === reqId) {
        setHistoria(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error("Error en loadHistoria:", err)
      if (historiaReqRef.current === reqId) {
        setHistoria([])
        showToast("Error cargando historia clínica", "error")
      }
    } finally {
      if (historiaReqRef.current === reqId) setLoadingHistoria(false)
    }
  }, [user, profile, selectedPatient, showToast])

  // -------------------- modal open helpers --------------------
  const openModal = useCallback((name) => {
    setModals((prev) => ({ ...prev, [name]: true }))
  }, [])

  const closeModal = useCallback((name) => {
    setModals((prev) => ({ ...prev, [name]: false }))
  }, [])

  const openViewHistoria = useCallback(
    (record) => {
      setCurrentViewHistoria(record || null)
      openModal("viewHistoria")
    },
    [openModal]
  )

  const openEditHistoria = useCallback(
    (record) => {
      setCurrentEditHistoria(record ? { ...record } : null)
      openModal("editHistoria")
    },
    [openModal]
  )

  const openViewPlan = useCallback(
    (plan) => {
      setCurrentViewPlan(plan || null)
      openModal("viewPlan")
    },
    [openModal]
  )

  const openEditPlan = useCallback(
    (plan) => {
      setCurrentEditPlan(plan ? { ...plan } : null)
      openModal("editPlan")
    },
    [openModal]
  )

  const openEditPresWithId = useCallback(
    async (presId) => {
      try {
        const res = await fetch(apiUrl(`prescripcion/${presId}`), {
          credentials: "include"
        })
        if (!res.ok) throw new Error("No se pudo cargar la prescripción")
        const pres = await res.json()
        setCurrentEditPres(pres)
        openModal("editPres")
      } catch (err) {
        console.error(err)
        showToast("No se pudo cargar la prescripción", "error")
      }
    },
    [showToast, openModal]
  )

  const openAsignarGestor = useCallback(
    (pacienteId) => {
      setCurrentAsignarPacienteId(pacienteId)
      openModal("asignarGestor")
    },
    [openModal]
  )

  const openCrearPlanWithPatient = useCallback(
    (pacienteId) => {
      setCurrentCrearPlanPacienteId(pacienteId)
      openModal("crearPlan")
    },
    [openModal]
  )

  // selectPatient NO dispara cargas directamente: el effect consolidado hará las cargas
  const selectPatient = useCallback(
    (patient) => {
      setSelectedPatient(patient || null)

      if (patient && profile) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                id_paciente: patient.id_paciente,
                ci: patient.ci
              }
            : prev
        )
      }

      setActiveSection("historia")
    },
    [profile]
  )

  const openRegistroWithPatient = useCallback(
    (pacienteId) => {
      setCurrentRegistroPacienteId(pacienteId)
      openModal("registro")
    },
    [openModal]
  )

  // -------------------- CRUD Actions --------------------
  // (mantengo tus funciones, solo que ahora los loaders internos son resource-specific)
  const createRegistro = useCallback(
    async ({ titulo, descripcion, id_paciente, ci }) => {
      try {
        const payload = { titulo, descripcion, id_paciente, ci }
        const res = await fetch(apiUrl("historia"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error("Error al guardar registro")
        await loadHistoria()
        showToast("Registro guardado", "success")
        setCurrentEditHistoria(null)
        closeModal("registro")
      } catch (err) {
        console.error(err)
        showToast(err.message || "Error", "error")
        throw err
      }
    },
    [loadHistoria, showToast, closeModal]
  )

  const createPlan = useCallback(
    async ({
      titulo,
      descripcion,
      fecha_inicio,
      id_paciente,
      prescripciones
    }) => {
      try {
        const payload = {
          id_medico: profile?.id_usuario,
          id_paciente,
          titulo,
          descripcion,
          fecha_inicio,
          prescripciones: prescripciones || []
        }
        const res = await fetch(apiUrl("plan_tratamiento"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload)
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || "No se pudo crear el plan")
        }
        await loadPlanes()
        showToast("Plan creado", "success")
        setCurrentCrearPlanPacienteId(null)
        closeModal("crearPlan")
      } catch (err) {
        console.error(err)
        showToast(err.message || "Error", "error")
        throw err
      }
    },
    [profile, loadPlanes, showToast, closeModal]
  )

  const updatePlan = useCallback(
    async ({
      planId,
      titulo,
      descripcion,
      fecha_inicio,
      estado,
      resumen_egreso
    }) => {
      try {
        const res = await fetch(apiUrl(`plan_tratamiento/${planId}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            titulo,
            descripcion,
            fecha_inicio,
            estado,
            resumen_egreso
          })
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || "No se pudo actualizar el plan")
        }
        await loadPlanes()
        showToast("Plan actualizado", "success")
        setCurrentEditPlan(null)
        closeModal("editPlan")
      } catch (err) {
        console.error(err)
        showToast(err.message || "Error", "error")
        throw err
      }
    },
    [loadPlanes, showToast, closeModal]
  )

  const createPatient = useCallback(
    async (patientData) => {
      try {
        const res = await fetch(apiUrl("pacientes"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(patientData)
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || `Error ${res.status}`)
        }
        await loadPatients()
        showToast("Paciente creado y asignado", "success")
        closeModal("nuevoPaciente")
      } catch (err) {
        console.error(err)
        showToast(err.message || "Error al crear paciente", "error")
        throw err
      }
    },
    [loadPatients, showToast, closeModal]
  )

  const assignGestor = useCallback(
    async ({ id_gestor, id_paciente }) => {
      try {
        const res = await fetch(apiUrl("asignar_gestor"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id_gestor, id_paciente })
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || "No se pudo asignar gestor")
        }
        await loadPatients()
        showToast("Gestor asignado", "success")
        setCurrentAsignarPacienteId(null)
        closeModal("asignarGestor")
      } catch (err) {
        console.error(err)
        showToast(err.message || "Error", "error")
        throw err
      }
    },
    [loadPatients, showToast, closeModal]
  )

  const updatePrescripcion = useCallback(
    async ({ presId, descripcion, observaciones, cumplimiento }) => {
      try {
        const res = await fetch(apiUrl(`prescripcion/${presId}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ descripcion, observaciones, cumplimiento })
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || "No se pudo actualizar la prescripción")
        }
        await loadPlanes()
        showToast("Prescripción actualizada", "success")
        setCurrentEditPres(null)
        closeModal("editPres")
      } catch (err) {
        console.error(err)
        showToast(err.message || "Error", "error")
        throw err
      }
    },
    [loadPlanes, showToast, closeModal]
  )

  const updateHistoria = useCallback(
    async ({ recordId, titulo, descripcion }) => {
      try {
        const res = await fetch(apiUrl(`historia/${recordId}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ titulo, descripcion })
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || "No se pudo actualizar el registro")
        }
        await loadHistoria()
        showToast("Registro actualizado", "success")
        setCurrentEditHistoria(null)
        closeModal("editHistoria")
      } catch (err) {
        console.error(err)
        showToast(err.message || "Error", "error")
        throw err
      }
    },
    [loadHistoria, showToast, closeModal]
  )

  // -------------------- Funciones de permisos --------------------
  const getUserType = useCallback(() => {
    return user?.tipo || profile?.tipo_usuario
  }, [user, profile])

  const isMedico = useCallback(() => {
    return getUserType() === "medico"
  }, [getUserType])

  const isGestor = useCallback(() => {
    return getUserType() === "gestor" || getUserType() === "gestor_casos"
  }, [getUserType])

  const isPaciente = useCallback(() => {
    return getUserType() === "paciente"
  }, [getUserType])

  const canEditHistoria = useCallback(() => isMedico(), [isMedico])
  const canViewPatients = useCallback(
    () => isMedico() || isGestor(),
    [isMedico, isGestor]
  )
  const canCreatePatient = useCallback(() => isMedico(), [isMedico])
  const canAssignGestor = useCallback(() => isMedico(), [isMedico])
  const canCreatePlan = useCallback(() => isMedico(), [isMedico])
  const canEditPlan = useCallback(() => isMedico(), [isMedico])
  const canEditPrescripcion = useCallback(() => isGestor(), [isGestor])

  // -------------------- init effects --------------------

  // cargar profile cuando user cambia
  useEffect(() => {
    if (!user) return
    loadProfile()
  }, [user, loadProfile])

  // efecto centralizado: decide qué cargar cuando cambia profile, activeSection o selectedPatient
  useEffect(() => {
    if (!profile) return

    // Si hay paciente seleccionado: recargar historia y planes para ese paciente (una sola llamada consolidada)
    if (selectedPatient) {
      loadHistoria()
      loadPlanes()
      return
    }

    // Si no hay paciente seleccionado, cargar según la sección activa
    if (activeSection === "pacientes") {
      loadPatients()
    } else if (activeSection === "plan") {
      loadPlanes()
    } else if (activeSection === "historia") {
      loadHistoria()
    }
  }, [
    profile,
    activeSection,
    selectedPatient,
    loadPatients,
    loadPlanes,
    loadHistoria
  ])

  // Escucha cambios en localStorage (otros tabs) y sincroniza `user`
  useEffect(() => {
    function handleStorage(e) {
      if (e.key === "user") {
        try {
          const newVal = e.newValue ? JSON.parse(e.newValue) : null
          setUser(newVal)
        } catch {
          setUser(null)
        }
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  // -------------------- export value --------------------
  const value = {
    // Estado
    user,
    setUser,
    login,
    profile,
    patients,
    plans,
    historia,
    selectedPatient,
    activeSection,
    loading, // compatibilidad
    toast,
    modals,
    currentRegistroPacienteId,
    openRegistroWithPatient,

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

    // Funciones de carga (expuestas por compatibilidad)
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

    // Permisos
    getUserType,
    isMedico,
    isGestor,
    isPaciente,
    canEditHistoria,
    canViewPatients,
    canCreatePatient,
    canAssignGestor,
    canCreatePlan,
    canEditPlan,
    canEditPrescripcion,

    // Setters (compatibilidad)
    setPatients,
    setPlans,
    setHistoria
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}
