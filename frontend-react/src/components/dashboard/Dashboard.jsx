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

import styles from "./Dashboard.module.css"

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile, logout } = useAuthContext()
  const { toast, showToast } = useToast()
  const [activeSection, setActiveSection] = useState("historia")
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [initialized, setInitialized] = useState(false)

  const handleLogout = useCallback(() => {
    logout()
    navigate("/login")
  }, [logout, navigate])

  // Determinar userType - priorizar profile, luego user
  const userType = useMemo(() => {
    console.log("Dashboard - user:", user)
    console.log("Dashboard - profile:", profile)

    if (profile?.tipo_usuario) return profile.tipo_usuario
    if (user?.tipo_usuario) return user.tipo_usuario
    if (user?.tipo) return user.tipo
    return null
  }, [user, profile])

  console.log("Dashboard - userType determinado:", userType)

  // Memoizar isSectionAllowed
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

  // Memoizar el contenido de la sección activa
  const activeSectionContent = useMemo(() => {
    console.log("Dashboard - Renderizando sección:", activeSection)

    if (!userType) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Determinando tipo de usuario...</p>
        </div>
      )
    }

    if (activeSection === "pacientes" && isSectionAllowed("pacientes")) {
      return <Pacientes onSelectPatient={setSelectedPatient} />
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

    // Mensaje si la sección no está permitida
    if (!isSectionAllowed(activeSection)) {
      return (
        <section className={styles.accessDeniedSection}>
          <h2>Acceso Restringido</h2>
          <p>No tienes permiso para acceder a esta sección.</p>
        </section>
      )
    }

    return null
  }, [activeSection, isSectionAllowed, selectedPatient, userType])

  // Inicializar dashboard - CORREGIDO
  useEffect(() => {
    console.log("Dashboard - Efecto de inicialización, user:", user)

    if (!user) {
      console.log("Dashboard - No hay usuario, redirigiendo a login")
      navigate("/login")
      return
    }

    if (initialized) {
      console.log("Dashboard - Ya inicializado")
      return
    }

    let mounted = true

    const initializeDashboard = () => {
      try {
        console.log("Dashboard - Inicializando con userType:", userType)

        // Determinar sección predeterminada basada en el tipo de usuario
        let defaultSection = "historia"

        if (userType === "medico" || userType === "gestor_casos") {
          defaultSection = "pacientes"
        } else if (userType === "paciente") {
          defaultSection = "historia"
        }

        console.log("Dashboard - Sección predeterminada:", defaultSection)

        if (mounted && activeSection !== defaultSection) {
          console.log("Dashboard - Cambiando sección a:", defaultSection)
          setActiveSection(defaultSection)
        }

        if (mounted) {
          console.log("Dashboard - Marcando como inicializado")
          setInitialized(true)
        }
      } catch (err) {
        console.error("Dashboard - Error inicializando:", err)
        if (mounted) {
          showToast("Error inicializando dashboard", "error")
          setInitialized(true) // Marcar como inicializado para evitar loop
        }
      }
    }

    // Pequeño delay para asegurar que el userType esté disponible
    const timer = setTimeout(() => {
      initializeDashboard()
    }, 100)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [user, userType, activeSection, navigate, showToast, initialized])

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
          onNavigate={setActiveSection}
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
    </div>
  )
}
