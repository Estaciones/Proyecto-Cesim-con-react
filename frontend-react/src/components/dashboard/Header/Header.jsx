import React from "react"
import { useAuthContext } from "../../../context/AuthContext"
import styles from "./Header.module.css"

export default function DashboardHeader({ onLogout }) {
  const { profile, user } = useAuthContext()

  // Obtener datos del usuario para mostrar
  const userData = profile || user || {}

  // Función para obtener iniciales del usuario
  const getUserInitials = () => {
    const firstName = userData.nombre?.charAt(0) || ""
    const lastName = userData.apellido?.charAt(0) || ""
    const username = userData.nombre_usuario?.charAt(0) || "U"
    
    if (firstName || lastName) {
      return `${firstName}${lastName}`.toUpperCase()
    }
    return username.charAt(0).toUpperCase()
  }

  // Formatear tipo de usuario para mostrar
  const formatUserType = (type) => {
    if (!type) return "Usuario"
    
    const types = {
      "medico": "Médico",
      "paciente": "Paciente",
      "gestor_casos": "Gestor de Casos",
      "admin": "Administrador"
    }
    
    return types[type] || type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Lado Izquierdo: Título y Rol */}
        <div className={styles.leftSection}>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>🏥</span>
            Panel de Control de Salud
          </h1>
          
          {userData.tipo_usuario && (
            <div className={styles.userBadge}>
              <span className={styles.badgeIcon}>👤</span>
              <span className={styles.badgeText}>
                {formatUserType(userData.tipo_usuario)}
              </span>
            </div>
          )}
        </div>

        {/* Lado Derecho: Información del Usuario y Acciones */}
        <div className={styles.rightSection}>
          <div className={styles.userProfile}>
            <div className={styles.avatarContainer}>
              <div className={styles.userAvatar}>
                {getUserInitials()}
              </div>
              <div className={styles.userStatus}></div>
            </div>
            
            <div className={styles.userInfo}>
              <span className={styles.userName}>
                {userData.nombre || userData.nombre_usuario || "Usuario"}
                {userData.apellido ? ` ${userData.apellido}` : ""}
              </span>
              <span className={styles.userRole}>
                {formatUserType(userData.tipo_usuario)}
              </span>
            </div>
          </div>

          <button
            className={styles.logoutButton}
            onClick={onLogout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <span className={styles.logoutIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M17 16L21 12M21 12L17 8M21 12H7M13 16V17C13 18.6569 11.6569 20 10 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H10C11.6569 4 13 5.34315 13 7V8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={styles.logoutText}>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  )
}