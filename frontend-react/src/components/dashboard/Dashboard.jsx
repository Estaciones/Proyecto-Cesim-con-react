import React, { useEffect, useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "../../context/AuthContext"
import { useToast } from "../../hooks/useToast"
import Sidebar from "./Sidebar/Sidebar"
import Header from "./Header/Header"
import Historia from "./sections/Historia/Historia"
import Planes from "./sections/Planes/Planes"
import Pacientes from "./sections/Pacientes/Pacientes"

// Modales
import RegistroModal from "../modals/RegistroModal/RegistroModal"
import ViewHistoriaModal from "../modals/ViewHistoriaModal/ViewHistoriaModal"
import EditHistoriaModal from "../modals/EditHistoriaModal/EditHistoriaModal"
import CrearPlanModal from "../modals/CrearPlanModal/CrearPlanModal"
import ViewPlanModal from "../modals/ViewPlanModal/ViewPlanModal"
import EditPlanModal from "../modals/EditPlanModal/EditPlanModal"
import ViewPrescripcionModal from "../modals/ViewPrescripcionModal/ViewPrescripcionModal"
import EditPrescripcionModal from "../modals/EditPrescripcionModal/EditPrescripcionModal"
import AsignarGestorModal from "../modals/AsignarGestorModal/AsignarGestorModal"
import NuevoPacienteModal from "../modals/NuevoPacienteModal/NuevoPacienteModal"
import EditPacienteModal from "../modals/EditPacienteModal/EditPacienteModal" 
import ViewPacienteModal from "../modals/ViewPacienteModal/ViewPacienteModal"
// Services
import { PatientService } from "../../services/patientService"

import styles from "./Dashboard.module.css"

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile, logout, loadProfile } = useAuthContext()
  const { toast, showToast } = useToast()
  const [activeSection, setActiveSection] = useState("historia")
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [initialized, setInitialized] = useState(false)

  const handleLogout = useCallback(() => {
    logout()
    setSelectedPatient(null)
    navigate("/login")
  }, [logout, navigate])

  const userType = useMemo(() => {
    if (profile?.tipo_usuario) return profile.tipo_usuario
    if (user?.tipo_usuario) return user.tipo_usuario
    if (user?.tipo) return user.tipo
    return null
  }, [user, profile])

  const isSectionAllowed = useCallback(
    (section) => {
      if (!userType) return false
      switch (section) {
        case "pacientes":
          return userType === "medico" || userType === "gestor_casos"
        case "historia":
        case "plan":
        case "comunicacion":
          return true
        default:
          return false
      }
    },
    [userType]
  )

  const handleSelectPatient = useCallback(
    (patient) => {


      const selectedPatientData = {
        id_paciente: patient.id_paciente || patient.id,
        ci: patient.ci,
        nombre: patient.nombre,
        apellido: patient.apellido,
        email: patient.email
      }

      setSelectedPatient(selectedPatientData)

      if (isSectionAllowed("historia")) {
       
        setActiveSection("historia")
      }
    },
    [isSectionAllowed]
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedPatient(null)
    setInitialized(false)
  }, [userType])

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    if (initialized) return

    let mounted = true
    const controller = new AbortController()

    const initializeDashboard = async () => {
      try {
        let defaultSection = "historia"
        if (userType === "medico" || userType === "gestor_casos") {
          defaultSection = "pacientes"
        } else if (userType === "paciente") {
          defaultSection = "historia"
        }

        if (mounted) {
          setActiveSection((curr) =>
            curr !== defaultSection ? defaultSection : curr
          )
        }

        if (mounted && userType === "paciente") {
          const existingPatientId =
            profile?.id_paciente ||
            profile?.idPaciente ||
            profile?.paciente_id ||
            null

          if (existingPatientId) {
            const p = {
              id_paciente: existingPatientId,
              ci: profile?.ci || null,
              nombre:
                profile?.nombre ||
                profile?.persona_nombre ||
                user?.nombre ||
                "",
              apellido: profile?.apellido || "",
              email: profile?.email || user?.email || ""
            }
            if (mounted) setSelectedPatient(p)
          } else {
            try {
              const profileId = user?.id_usuario || user?.id
              if (profileId) {
                const refreshed = await loadProfile(profileId)
                const refreshedId =
                  refreshed?.id_paciente || refreshed?.idPaciente || null
                if (refreshedId) {
                  const p = {
                    id_paciente: refreshedId,
                    ci: refreshed?.ci || profile?.ci || null,
                    nombre:
                      refreshed?.nombre ||
                      refreshed?.persona_nombre ||
                      user?.nombre ||
                      "",
                    apellido: refreshed?.apellido || "",
                    email: refreshed?.email || user?.email || ""
                  }
                  if (mounted) setSelectedPatient(p)
                } else {
                  const searchKey =
                    profile?.ci || refreshed?.ci || profile?.persona_ci || null
                  let patientsResponse = null
                  if (searchKey) {
                    patientsResponse = await PatientService.getAll(
                      { ci: searchKey },
                      { signal: controller.signal }
                    )
                  } else {
                    const uid =
                      profile?.id_usuario || user?.id_usuario || user?.id
                    if (uid) {
                      patientsResponse = await PatientService.getAll(
                        { user_id: uid },
                        { signal: controller.signal }
                      )
                    }
                  }

                  let arr = []
                  if (Array.isArray(patientsResponse)) arr = patientsResponse
                  else if (
                    patientsResponse?.data &&
                    Array.isArray(patientsResponse.data)
                  )
                    arr = patientsResponse.data
                  else if (
                    patientsResponse?.pacientes &&
                    Array.isArray(patientsResponse.pacientes)
                  )
                    arr = patientsResponse.pacientes
                  else if (
                    patientsResponse?.results &&
                    Array.isArray(patientsResponse.results)
                  )
                    arr = patientsResponse.results
                  else arr = []

                  if (arr.length > 0) {
                    const found = arr[0]
                    const p = {
                      id_paciente:
                        found.id_paciente || found.id || found.idPaciente,
                      ci: found.ci || profile?.ci || null,
                      nombre: found.nombre || profile?.nombre || "",
                      apellido: found.apellido || profile?.apellido || "",
                      email: found.email || profile?.email || ""
                    }
                    if (mounted) setSelectedPatient(p)
                  } else {
                    console.warn(
                      "Dashboard - No se encontró registro de paciente para este usuario:",
                      {
                        profile,
                        refreshed
                      }
                    )
                    if (mounted)
                      showToast(
                        "No se encontró tu registro de paciente (ID). Contacta al administrador.",
                        "warning"
                      )
                  }
                }
              }
            } catch (err) {
              if (err && err.name === "AbortError") {
                console.log(
                  "Dashboard.initializeDashboard - búsqueda paciente abortada"
                )
              } else {
                console.error("Dashboard - Error buscando id_paciente:", err)
                if (mounted)
                  showToast("Error al obtener datos del paciente", "error")
              }
            }
          }
        }

        if (mounted) setInitialized(true)
      } catch (err) {
        console.error("Dashboard - Error inicializando:", err)
        if (mounted) {
          showToast("Error inicializando dashboard", "error")
          setInitialized(true)
        }
      }
    }

    const t = setTimeout(() => {
      initializeDashboard()
    }, 50)

    return () => {
      mounted = false
      controller.abort()
      clearTimeout(t)
    }
  }, [user, userType, profile, initialized, navigate, showToast, loadProfile])

  const activeSectionContent = useMemo(() => {
    if (!userType) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Determinando tipo de usuario...</p>
        </div>
      )
    }

    if (activeSection === "pacientes" && isSectionAllowed("pacientes")) {
      return <Pacientes onSelectPatient={handleSelectPatient} />
    }

    if (activeSection === "historia" && isSectionAllowed("historia")) {
      return <Historia selectedPatient={selectedPatient} />
    }

    if (activeSection === "plan" && isSectionAllowed("plan")) {
      return <Planes selectedPatient={selectedPatient} />
    }

    if (activeSection === "comunicacion" && isSectionAllowed("comunicacion")) {
      return (
        <section className={styles.comingSoonSection}>
          <div className={styles.comingSoonIcon}>💬</div>
          <h2 className={styles.comingSoonTitle}>Comunicación</h2>
          <p className={styles.comingSoonText}>
            Esta sección estará disponible próximamente.
          </p>
        </section>
      )
    }

    if (!isSectionAllowed(activeSection)) {
      return (
        <section className={styles.accessDeniedSection}>
          <div className={styles.accessDeniedIcon}>🚫</div>
          <h2 className={styles.accessDeniedTitle}>Acceso Restringido</h2>
          <p className={styles.accessDeniedText}>
            No tienes permiso para acceder a esta sección.
          </p>
        </section>
      )
    }

    return null
  }, [
    activeSection,
    isSectionAllowed,
    selectedPatient,
    userType,
    handleSelectPatient
  ])

  if (!user) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Redirigiendo al login...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Header onLogout={handleLogout} />

      <div className={styles.mainLayout}>
        <Sidebar
          activeSection={activeSection}
          onNavigate={(sec) => setActiveSection(sec)}
          userType={userType}
          onLogout={handleLogout}
          profile={profile}
        />

        <main className={styles.contentArea}>
          <div className={styles.contentWrapper}>{activeSectionContent}</div>
        </main>
      </div>

      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          <span className={styles.toastIcon}>
            {toast.type === "success" ? "✅" : 
             toast.type === "error" ? "❌" : 
             toast.type === "warning" ? "⚠️" : "ℹ️"}
          </span>
          <span className={styles.toastMessage}>{toast.message}</span>
        </div>
      )}

      <RegistroModal />
      <ViewHistoriaModal />
      <EditHistoriaModal />
      <CrearPlanModal />
      <ViewPlanModal />
      <EditPlanModal />
      <ViewPrescripcionModal/>
      <EditPrescripcionModal />
      <AsignarGestorModal />
      <NuevoPacienteModal />
      <EditPacienteModal /> 
      <ViewPacienteModal />

    </div>
  )
}