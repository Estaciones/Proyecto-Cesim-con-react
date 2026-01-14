import React from "react"
import { useAuthContext } from "../../../context/AuthContext"
import { useModal } from "../../../hooks/useModal"
import styles from "./Sidebar.module.css"

export default function DashboardSidebar({ activeSection, onNavigate }) {
  const { profile, user } = useAuthContext()
  const { openModal } = useModal()

  // Determinar el tipo de usuario
  const userType = profile?.tipo_usuario || user?.tipo

  // Ítems del menú base con íconos actualizados
  const baseMenuItems = [
    {
      id: "historia",
      label: "Historia Clínica",
      icon: "📋",
      allowed: ["paciente", "medico", "gestor_casos"],
      description: "Registros médicos del paciente"
    },
    {
      id: "plan",
      label: "Planes de Tratamiento",
      icon: "💊",
      allowed: ["paciente", "medico", "gestor_casos"],
      description: "Planes y prescripciones"
    },
    {
      id: "pacientes",
      label: "Pacientes",
      icon: "👥",
      allowed: ["medico", "gestor_casos"],
      description: "Gestión de pacientes"
    },
    {
      id: "comunicacion",
      label: "Comunicación",
      icon: "💬",
      allowed: ["medico", "gestor_casos", "paciente"],
      description: "Mensajes y notificaciones"
    }
  ]

  // Filtrar ítems según tipo de usuario
  const menuItems = baseMenuItems.filter((item) =>
    item.allowed.includes(userType)
  )

  // Acciones rápidas (solo para médicos)
  const quickActions = [
    {
      id: "nuevoPaciente",
      label: "Nuevo Paciente",
      icon: "➕",
      allowed: ["medico"],
      onClick: () => openModal("nuevoPaciente"),
      color: "#2ecc71"
    },
    {
      id: "nuevoRegistro",
      label: "Nuevo Registro",
      icon: "📝",
      allowed: ["medico"],
      onClick: () => openModal("registro"),
      color: "#3498db"
    },
    {
      id: "crearPlan",
      label: "Crear Plan",
      icon: "📋",
      allowed: ["medico"],
      onClick: () => openModal("crearPlan"),
      color: "#9b59b6"
    }
  ]

  const filteredQuickActions = quickActions.filter((action) =>
    action.allowed.includes(userType)
  )

  // Función para obtener las iniciales del nombre
  const getUserInitials = () => {
    if (profile?.nombre && profile?.apellido) {
      return `${profile.nombre.charAt(0)}${profile.apellido.charAt(
        0
      )}`.toUpperCase()
    }
    if (user?.nombre_usuario) {
      return user.nombre_usuario.charAt(0).toUpperCase()
    }
    return "U"
  }

  // Función para formatear el tipo de usuario
  const formatUserType = (type) => {
    const types = {
      medico: "Médico",
      paciente: "Paciente",
      gestor_casos: "Gestor de Casos",
      admin: "Administrador"
    }
    return types[type] || type
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🏥</div>
          <div className={styles.logoContent}>
            <span className={styles.logoTitle}>Health System</span>
            <span className={styles.logoSubtitle}>Salud Integral</span>
          </div>
        </div>
      </div>

      {/* Perfil del Usuario */}
      <div className={styles.userProfile}>
        <div className={styles.avatarContainer}>
          <div className={styles.userAvatar}>{getUserInitials()}</div>
          <div className={styles.userStatus}></div>
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>
            {profile?.nombre || user?.nombre_usuario || "Usuario"}
            {profile?.apellido ? ` ${profile.apellido}` : ""}
          </span>
          <span className={styles.userRole}>{formatUserType(userType)}</span>
        </div>
      </div>

      {/* Navegación Principal */}
      <nav className={styles.nav}>
        <div className={styles.navSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📊</span>
            Dashboard
          </h3>
          <ul className={styles.navList}>
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`${styles.navItem} ${
                    activeSection === item.id ? styles.active : ""
                  }`}
                  onClick={() => onNavigate(item.id)}
                  title={item.description}>
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                  {activeSection === item.id && (
                    <>
                      <span className={styles.activeIndicator} />
                      <span className={styles.activeGlow} />
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Acciones Rápidas */}
        {filteredQuickActions.length > 0 && (
          <div className={styles.navSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⚡</span>
              Acciones Rápidas
            </h3>
            <div className={styles.quickActions}>
              {filteredQuickActions.map((action) => (
                <button
                  key={action.id}
                  className={styles.quickAction}
                  onClick={action.onClick}
                  style={{ "--action-color": action.color }}>
                  <span className={styles.quickActionIcon}>{action.icon}</span>
                  <span className={styles.quickActionLabel}>
                    {action.label}
                  </span>
                  <span className={styles.quickActionArrow}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </aside>
  )
}
