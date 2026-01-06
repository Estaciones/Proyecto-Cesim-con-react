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

// Services (fallback si profile no trae id_paciente)
import { PatientService } from "../../services/patientService"

import styles from "./Dashboard.module.css"

export default function Dashboard() {
  const navigate = useNavigate()
  // ahora pedimos loadProfile desde el contexto para poder refrescar perfil si hace falta
  const { user, profile, logout, loadProfile } = useAuthContext()
  const { toast, showToast } = useToast()
  const [activeSection, setActiveSection] = useState("historia")
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [initialized, setInitialized] = useState(false)

  const handleLogout = useCallback(() => {
    logout()
    // limpiar selección al cerrar sesión
    setSelectedPatient(null)
    navigate("/login")
  }, [logout, navigate])

  // Determinar userType - priorizar profile, luego user
  const userType = useMemo(() => {
    if (profile?.tipo_usuario) return profile.tipo_usuario
    if (user?.tipo_usuario) return user.tipo_usuario
    if (user?.tipo) return user.tipo
    return null
  }, [user, profile])

  // Restricciones de acceso a secciones
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
      console.log("👤 Dashboard - handleSelectPatient llamado con:", patient)
      
      const selectedPatientData = {
        id_paciente: patient.id_paciente || patient.id,
        ci: patient.ci,
        nombre: patient.nombre,
        apellido: patient.apellido,
        email: patient.email,
      }
      
      console.log("📝 Dashboard - Guardando paciente:", selectedPatientData)
      setSelectedPatient(selectedPatientData)
      
      if (isSectionAllowed("historia")) {
        console.log("📊 Dashboard - Cambiando a sección historia")
        setActiveSection("historia")
      }
    },
    [isSectionAllowed]
  )

  // Si cambia el tipo de usuario, limpiar selección y re-inicializar
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedPatient(null)
    setInitialized(false)
  }, [userType])

  // Inicializar dashboard - ahora con loadProfile + fallback a PatientService
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

        // Si el usuario es paciente: necesitamos el id_paciente real
        if (mounted && userType === "paciente") {
          // 1) Si el profile ya trae id_paciente, úsalo
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
            // 2) Intentar recargar profile desde backend (loadProfile expuesto por contexto)
            try {
              const profileId = user?.id_usuario || user?.id
              if (profileId) {
                const refreshed = await loadProfile(profileId)
                // loadProfile puede retornar null; si trae id_paciente la usamos
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
                  // 3) Fallback: buscar paciente vía PatientService por CI o por user_id
                  const searchKey =
                    profile?.ci || refreshed?.ci || profile?.persona_ci || null
                  let patientsResponse = null
                  if (searchKey) {
                    patientsResponse = await PatientService.getAll(
                      { ci: searchKey },
                      { signal: controller.signal }
                    )
                  } else {
                    // intentar por user_id (si el backend soporta el parámetro)
                    const uid =
                      profile?.id_usuario || user?.id_usuario || user?.id
                    if (uid) {
                      patientsResponse = await PatientService.getAll(
                        { user_id: uid },
                        { signal: controller.signal }
                      )
                    }
                  }

                  // Normalización simple de resultados (Array o { data: [...] } etc)
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

    // pequeña espera para asegurar que profile esté listo
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
          <h2>Comunicación</h2>
          <p>Esta sección estará disponible próximamente.</p>
        </section>
      )
    }

    if (!isSectionAllowed(activeSection)) {
      return (
        <section className={styles.accessDeniedSection}>
          <h2>Acceso Restringido</h2>
          <p>No tienes permiso para acceder a esta sección.</p>
        </section>
      )
    }

    return null
  }, [activeSection, isSectionAllowed, selectedPatient, userType, handleSelectPatient])

  // Mostrar loading si no hay usuario
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

      {/* Toast Notifications */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Modales */}
      <RegistroModal />
      <ViewHistoriaModal />
      <EditHistoriaModal />
    </div>
  )
}