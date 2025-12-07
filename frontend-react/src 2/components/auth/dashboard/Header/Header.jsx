import React, { useContext } from 'react';
import { DashboardContext } from '../../../context/DashboardContext';
import styles from './Header.module.css';

export default function DashboardHeader({ onLogout }) {
  const { profile } = useContext(DashboardContext);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.left}>
          <h1 className={styles.title}>Panel de Control</h1>
          {profile?.tipo_usuario && (
            <span className={styles.badge}>
              {profile.tipo_usuario.charAt(0).toUpperCase() + profile.tipo_usuario.slice(1)}
            </span>
          )}
        </div>

        <div className={styles.right}>
          {profile && (
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {profile.nombre?.charAt(0) || 'U'}
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>
                  {profile.nombre} {profile.apellido}
                </span>
                <span className={styles.userRole}>
                  {profile.tipo_usuario}
                </span>
              </div>
            </div>
          )}

          <button 
            className={styles.logoutButton} 
            onClick={onLogout}
            title="Cerrar sesión"
          >
            <svg className={styles.logoutIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className={styles.logoutText}>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}