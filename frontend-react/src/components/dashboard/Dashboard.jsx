// src/components/dashboard/Dashboard.jsx
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

  // Si cambia el tipo de usuario, limpiar selección y re-inicializar
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedPatient(null)
    setInitialized(false)
  }, [userType])

  // Inicializar dashboard
  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    if (initialized) return

    let mounted = true
    const initializeDashboard = () => {
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

        // Si el usuario es paciente, autoseleccionar su propio perfil como paciente
        if (mounted && userType === "paciente") {
          const p = {
            id_paciente:
              profile?.id_paciente ||
              profile?.id_usuario ||
              user?.id_usuario ||
              user?.id,
            ci: profile?.ci || null,
            nombre:
              profile?.nombre || profile?.persona_nombre || user?.nombre || "",
            apellido: profile?.apellido || "",
            email: profile?.email || user?.email || ""
          }
          setSelectedPatient(p)
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
    const t = setTimeout(initializeDashboard, 50)

    return () => {
      mounted = false
      clearTimeout(t)
    }
  }, [user, userType, profile, initialized, navigate, showToast])

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
          onNavigate={(sec) => {
            setActiveSection(sec)
            // Si navega a Historia o Plan sin paciente seleccionado y es médico,
            // no se selecciona nada (pero se pueden mostrar vacíos hasta seleccionar)
            // Si quiere que al hacer click en paciente se cambie la sección, manejalo desde Pacientes.onSelectPatient
          }}
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

      {/* Modales (omitidos/externos) */}
      <RegistroModal />
    </div>
  )
}
