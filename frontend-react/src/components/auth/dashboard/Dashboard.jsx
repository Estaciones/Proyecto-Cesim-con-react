import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardContext } from '../../../context/DashboardContext';
import Header from './Header/Header';
import Sidebar from './Sidebar/Sidebar';
import Historia from './sections/Historia/Historia';
import Planes from './sections/Planes/Planes';
import Pacientes from './sections/Pacientes/Pacientes';

// Modales
import RegistroModal from '../../modals/RegistroModal/RegistroModal';
import CrearPlanModal from '../../modals/CrearPlanModal/CrearPlanModal';
import NuevoPacienteModal from '../../modals/NuevoPacienteModal/NuevoPacienteModal';
import AsignarGestorModal from '../../modals/AsignarGestorModal/AsignarGestorModal';
import EditPresModal from '../../modals/EditPresModal/EditPresModal';
import EditHistoriaModal from '../../modals/EditHistoriaModal/EditHistoriaModal';
import ViewHistoriaModal from '../../modals/ViewHistoriaModal/ViewHistoriaModal';
import ViewPlanModal from '../../modals/ViewPlanModal/ViewPlanModal';

import styles from './Dashboard.module.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    user,
    activeSection,
    setActiveSection,
    loadProfile,
    logout,
    toast,
  } = useContext(DashboardContext);

  useEffect(() => {
    // Si no hay usuario en contexto, redirige al login
    if (!user) {
      navigate('/login');
      return;
    }

    // Asegurar que profile esté cargado
    (async () => {
      try {
        await loadProfile();
      } catch (err) {
        console.error('Error cargando perfil:', err);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Redirigiendo al login...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header onLogout={handleLogout} />
      
      <div className={styles.mainLayout}>
        <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />
        
        <main className={styles.contentArea}>
          <div className={styles.contentWrapper}>
            {activeSection === 'historia' && <Historia />}
            {activeSection === 'plan' && <Planes />}
            {activeSection === 'pacientes' && <Pacientes />}
            {activeSection === 'comunicacion' && (
              <section className={styles.comingSoonSection}>
                <div className={styles.comingSoonIcon}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className={styles.comingSoonTitle}>Comunicación</h2>
                <p className={styles.comingSoonText}>
                  La funcionalidad de comunicación estará disponible próximamente.
                  Estamos trabajando para integrar mensajería y notificaciones en tiempo real.
                </p>
                <div className={styles.featureList}>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>💬</span>
                    <span className={styles.featureText}>Mensajería instantánea</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>🔔</span>
                    <span className={styles.featureText}>Notificaciones push</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>📧</span>
                    <span className={styles.featureText}>Correos automatizados</span>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          <div className={styles.toastIcon}>
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✗'}
            {toast.type === 'info' && 'ℹ'}
            {toast.type === 'warning' && '⚠'}
          </div>
          <div className={styles.toastContent}>
            <p className={styles.toastMessage}>{toast.text}</p>
          </div>
        </div>
      )}

      {/* Modales */}
      <RegistroModal />
      <CrearPlanModal />
      <NuevoPacienteModal />
      <AsignarGestorModal />
      <EditPresModal />
      <EditHistoriaModal />
      <ViewHistoriaModal />
      <ViewPlanModal />
    </div>
  );
}