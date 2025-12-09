import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardContext } from '../../../context/DashboardContext';
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
import EditPlanModal from '../../modals/EditPlanModal/EditPlanModal';

import styles from './Dashboard.module.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    user,
    activeSection,
    setActiveSection,
    loadProfile,
    profile,
    toast,
  } = useContext(DashboardContext);

  // Determinar el tipo de usuario
  const userType = user?.tipo || profile?.tipo_usuario;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    let mounted = true;

    (async () => {
      try {
        // Cargar profile solo si no existe (evita recargas innecesarias)
        if (!profile) {
          await loadProfile();
        }
      } catch (err) {
        console.error('Error cargando perfil:', err);
      }

      // Determinar la sección por defecto según tipo de usuario
      const type = (profile && profile.tipo_usuario) || user.tipo;
      let defaultSection = 'historia';
      if (type === 'medico' || (typeof type === 'string' && type.includes('gestor'))) {
        defaultSection = 'pacientes';
      } else if (type === 'paciente') {
        defaultSection = 'historia';
      }

      // Solo cambiar si es distinto (evita re-renders en bucle)
      if (mounted && defaultSection && activeSection !== defaultSection) {
        setActiveSection(defaultSection);
      }
    })();

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Redirigiendo al login...</p>
      </div>
    );
  }

  // Función para verificar si una sección está permitida
  const isSectionAllowed = (section) => {
    if (!userType) return false;

    switch (section) {
      case 'pacientes':
        return userType === 'medico' || userType === 'gestor_casos';
      case 'historia':
      case 'plan':
      case 'comunicacion':
        return true; // Todos los tipos pueden ver estas secciones
      default:
        return false;
    }
  };

  return (
    <div className={styles.container}>

      <div className={styles.mainLayout}>
        <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />

        <main className={styles.contentArea}>
          <div className={styles.contentWrapper}>
            {/* Mostrar solo secciones permitidas */}
            {activeSection === 'pacientes' && isSectionAllowed('pacientes') && <Pacientes />}
            {activeSection === 'historia' && isSectionAllowed('historia') && <Historia />}
            {activeSection === 'plan' && isSectionAllowed('plan') && <Planes />}
            {activeSection === 'comunicacion' && isSectionAllowed('comunicacion') && (
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

            {/* Mensaje si la sección no está permitida */}
            {!isSectionAllowed(activeSection) && (
              <section className={styles.accessDeniedSection}>
                <div className={styles.accessDeniedIcon}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className={styles.accessDeniedTitle}>Acceso Restringido</h2>
                <p className={styles.accessDeniedText}>
                  No tienes permiso para acceder a esta sección.
                </p>
                <button
                  className={styles.backButton}
                  onClick={() => setActiveSection('historia')}
                >
                  Volver a Historia Clínica
                </button>
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

      {/* Modales - Filtrar según permisos */}
      {userType === 'medico' && (
        <>
          <RegistroModal />
          <NuevoPacienteModal />
          <AsignarGestorModal />
          <EditHistoriaModal />
          <EditPlanModal />

        </>
      )}

      {/* Modales para gestor */}
      {userType === 'gestor_casos' && (
        <EditPresModal />
      )}
      <CrearPlanModal />
      <ViewHistoriaModal />
      <ViewPlanModal />
    </div>
  );
}