import React from 'react';
import { useModal } from '../../../hooks/useModal';
import Button from '../../ui/Button/Button';
import styles from './ViewPlanModal.module.css';

export default function ViewPlanModal() {
  const { closeModal, getModalData } = useModal();
  const modalData = getModalData('viewPlan');
  const planData = modalData?.currentViewPlan;

  if (!planData) {
    console.log('❌ ViewPlanModal - No hay datos del plan');
    return null;
  }

  console.log('📋 ViewPlanModal - Datos recibidos:', planData);

  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getStatusBadge = (estado) => {
    const isActive = estado === true || estado === "activo" || estado === 1;
    
    return (
      <span 
        className={`${styles.statusBadge} ${isActive ? styles.active : styles.inactive}`}
      >
        {isActive ? 'Activo' : 'Inactivo'}
      </span>
    );
  };

  // Calcular estadísticas de prescripciones
  const totalPrescripciones = Array.isArray(planData.prescripciones) ? planData.prescripciones.length : 0;
  const prescripcionesCumplidas = Array.isArray(planData.prescripciones) 
    ? planData.prescripciones.filter(p => p.cumplimiento === true).length 
    : 0;

  return (
    <div className={styles.modalOverlay} onClick={() => closeModal('viewPlan')}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.modalTitle}>
              <span className={styles.titleIcon}>📋</span>
              {planData.titulo || 'Plan de Tratamiento'}
            </h2>
            <div className={styles.headerInfo}>
              {getStatusBadge(planData.estado)}
              <span className={styles.planId}>ID: {planData.id_plan}</span>
            </div>
          </div>
          <button 
            className={styles.closeButton} 
            onClick={() => closeModal('viewPlan')}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Información Básica */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📄</span>
              Información del Plan
            </h3>
            
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Título</span>
                <span className={styles.infoValue}>{planData.titulo || 'Sin título'}</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Estado</span>
                <span className={styles.infoValue}>
                  {getStatusBadge(planData.estado)}
                </span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Fecha de Inicio</span>
                <span className={styles.infoValue}>{formatDate(planData.fecha_inicio)}</span>
              </div>
              
              {planData.fecha_fin && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Fecha de Fin</span>
                  <span className={styles.infoValue}>{formatDate(planData.fecha_fin)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📝</span>
              Descripción
            </h3>
            <div className={styles.description}>
              {planData.descripcion || 'No hay descripción disponible.'}
            </div>
          </div>

          {/* Resumen de Egreso */}
          {planData.resumen_egreso && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>✅</span>
                Resumen de Egreso
              </h3>
              <div className={styles.resumen}>
                {planData.resumen_egreso}
              </div>
            </div>
          )}

          {/* Prescripciones */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>💊</span>
              Prescripciones
              <span className={styles.prescriptionCount}>
                ({totalPrescripciones})
              </span>
            </h3>
            
            {totalPrescripciones > 0 ? (
              <>
                {/* Estadísticas */}
                <div className={styles.stats}>
                  <div className={styles.statItem}>
                    <span className={styles.statIcon}>📊</span>
                    <div className={styles.statContent}>
                      <span className={styles.statValue}>{totalPrescripciones}</span>
                      <span className={styles.statLabel}>prescripciones totales</span>
                    </div>
                  </div>
                  
                  <div className={styles.statItem}>
                    <span className={styles.statIcon}>✅</span>
                    <div className={styles.statContent}>
                      <span className={styles.statValue}>{prescripcionesCumplidas}</span>
                      <span className={styles.statLabel}>cumplidas</span>
                    </div>
                  </div>
                  
                  <div className={styles.statItem}>
                    <span className={styles.statIcon}>📈</span>
                    <div className={styles.statContent}>
                      <span className={styles.statValue}>
                        {totalPrescripciones > 0 
                          ? Math.round((prescripcionesCumplidas / totalPrescripciones) * 100) 
                          : 0}%
                      </span>
                      <span className={styles.statLabel}>tasa de cumplimiento</span>
                    </div>
                  </div>
                </div>

                {/* Lista de Prescripciones */}
                <div className={styles.prescriptionsList}>
                  {planData.prescripciones.map((prescripcion, index) => (
                    <div key={index} className={styles.prescriptionCard}>
                      <div className={styles.prescriptionHeader}>
                        <div className={styles.prescriptionTitle}>
                          <span className={styles.prescriptionType}>
                            {prescripcion.tipo || 'Prescripción'} #{index + 1}
                          </span>
                          <span className={`${styles.prescriptionStatus} ${prescripcion.cumplimiento ? styles.completed : styles.pending}`}>
                            {prescripcion.cumplimiento ? '✅ Cumplida' : '⏳ Pendiente'}
                          </span>
                        </div>
                      </div>
                      
                      <div className={styles.prescriptionDescription}>
                        {prescripcion.descripcion}
                      </div>
                      
                      <div className={styles.prescriptionDetails}>
                        {prescripcion.frecuencia && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Frecuencia:</span>
                            <span className={styles.detailValue}>{prescripcion.frecuencia}</span>
                          </div>
                        )}
                        
                        {prescripcion.duracion && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Duración:</span>
                            <span className={styles.detailValue}>{prescripcion.duracion}</span>
                          </div>
                        )}
                        
                        {prescripcion.fecha_creacion && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Creada:</span>
                            <span className={styles.detailValue}>{formatDate(prescripcion.fecha_creacion)}</span>
                          </div>
                        )}
                      </div>
                      
                      {prescripcion.observaciones && (
                        <div className={styles.prescriptionObservations}>
                          <span className={styles.observationsLabel}>Observaciones:</span>
                          <span className={styles.observationsValue}>{prescripcion.observaciones}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>💊</span>
                <p>No hay prescripciones registradas para este plan.</p>
              </div>
            )}
          </div>

          {/* Información del Sistema */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⚙️</span>
              Información del Sistema
            </h3>
            
            <div className={styles.systemInfo}>
              <div className={styles.systemInfoItem}>
                <span className={styles.systemInfoLabel}>ID del Plan:</span>
                <span className={styles.systemInfoValue}>{planData.id_plan}</span>
              </div>
              
              <div className={styles.systemInfoItem}>
                <span className={styles.systemInfoLabel}>ID del Médico:</span>
                <span className={styles.systemInfoValue}>{planData.id_medico}</span>
              </div>
              
              <div className={styles.systemInfoItem}>
                <span className={styles.systemInfoLabel}>CI del Médico:</span>
                <span className={styles.systemInfoValue}>{planData.medico_ci}</span>
              </div>
              
              <div className={styles.systemInfoItem}>
                <span className={styles.systemInfoLabel}>ID del Paciente:</span>
                <span className={styles.systemInfoValue}>{planData.id_paciente}</span>
              </div>
              
              <div className={styles.systemInfoItem}>
                <span className={styles.systemInfoLabel}>CI del Paciente:</span>
                <span className={styles.systemInfoValue}>{planData.paciente_ci}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <div className={styles.footerActions}>
            <Button
              variant="secondary"
              onClick={() => closeModal('viewPlan')}
              className={styles.closeButton}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}