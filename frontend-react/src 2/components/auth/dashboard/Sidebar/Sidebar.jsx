import React, { useContext } from 'react';
import { DashboardContext } from '../../../context/DashboardContext';
import styles from './Sidebar.module.css';

export default function DashboardSidebar() {
  const { activeSection, setActiveSection } = useContext(DashboardContext);

  const menuItems = [
    {
      id: 'historia',
      label: 'Historia Clínica',
      icon: (
        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'plan',
      label: 'Planes',
      icon: (
        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'pacientes',
      label: 'Pacientes',
      icon: (
        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: 'comunicacion',
      label: 'Comunicación',
      icon: (
        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>HS</div>
          <span className={styles.logoText}>Health System</span>
        </div>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navSection}>
          <h3 className={styles.sectionTitle}>Navegación</h3>
          <ul className={styles.navList}>
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`${styles.navItem} ${
                    activeSection === item.id ? styles.active : ''
                  }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                  {activeSection === item.id && (
                    <span className={styles.activeIndicator} />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.navSection}>
          <h3 className={styles.sectionTitle}>Acciones Rápidas</h3>
          <ul className={styles.navList}>
            <li>
              <button className={styles.quickAction}>
                <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={styles.navLabel}>Nuevo Paciente</span>
              </button>
            </li>
            <li>
              <button className={styles.quickAction}>
                <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className={styles.navLabel}>Nuevo Registro</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div className={styles.footer}>
        <div className={styles.systemInfo}>
          <div className={styles.statusIndicator} />
          <span className={styles.systemText}>Sistema Activo</span>
        </div>
        <div className={styles.version}>v2.1.0</div>
      </div>
    </aside>
  );
}