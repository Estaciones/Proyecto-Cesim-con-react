// ViewPlanModal.jsx
import React from 'react';
import { useModal } from '../../../hooks/useModal';
import Modal from '../Modal/Modal';
import styles from './ViewPlanModal.module.css';

export default function ViewPlanModal() {
  const { closeModal, getModalData, modals } = useModal();
  const modalData = getModalData('viewPlan');
  const planData = modalData?.currentViewPlan;

  const open = !!modals.viewPlan;

  if (!planData) {
    return (
      <Modal
        open={open}
        onClose={() => closeModal('viewPlan')}
        title="Plan de Tratamiento"
        size="lg"
      >
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h3>No hay datos del plan</h3>
            <p>No se pudo cargar la información del plan de tratamiento.</p>
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => closeModal('viewPlan')}
              className={styles.closeButton}
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    );
  }

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
      <span className={`${styles.statusBadge} ${isActive ? styles.active : styles.inactive}`}>
        {isActive ? 'Activo' : 'Inactivo'}
      </span>
    );
  };

  // Calcular estadísticas de prescripciones
  const totalPrescripciones = Array.isArray(planData.prescripciones) ? planData.prescripciones.length : 0;
  const prescripcionesCumplidas = Array.isArray(planData.prescripciones) 
    ? planData.prescripciones.filter(p => p.cumplimiento === true).length 
    : 0;
  const cumplimientoPorcentaje = totalPrescripciones > 0 
    ? Math.round((prescripcionesCumplidas / totalPrescripciones) * 100) 
    : 0;

  return (
    <Modal
      open={open}
      onClose={() => closeModal('viewPlan')}
      title={`Plan de Tratamiento: ${planData.titulo || 'Sin título'}`}
      size="lg"
    >
      <div className={styles.container}>
        {/* Encabezado del Plan */}
        <div className={styles.headerSection}>
          <div className={styles.planIcon}>📋</div>
          <div className={styles.headerContent}>
            <h3 className={styles.planTitle}>{planData.titulo || 'Plan de Tratamiento'}</h3>
            <div className={styles.headerMeta}>
              <div className={styles.metaGroup}>
                <span className={styles.metaLabel}>Estado:</span>
                <div className={styles.metaValue}>
                  {getStatusBadge(planData.estado)}
                </div>
              </div>
              <div className={styles.metaGroup}>
                <span className={styles.metaLabel}>ID:</span>
                <span className={styles.metaValue}>{planData.id_plan}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información Principal */}
        <div className={styles.infoSection}>
          <h4 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📅</span>
            Fechas del Plan
          </h4>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Fecha de Inicio</label>
              <div className={styles.infoValue}>{formatDate(planData.fecha_inicio)}</div>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Fecha de Fin</label>
              <div className={styles.infoValue}>
                {planData.fecha_fin ? formatDate(planData.fecha_fin) : 'Sin fecha de fin'}
              </div>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className={styles.infoSection}>
          <h4 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📝</span>
            Descripción del Plan
          </h4>
          <div className={styles.description}>
            {planData.descripcion || 'No hay descripción disponible.'}
          </div>
        </div>

        {/* Resumen de Egreso */}
        {planData.resumen_egreso && (
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>✅</span>
              Resumen de Egreso
            </h4>
            <div className={styles.resumen}>
              {planData.resumen_egreso}
            </div>
          </div>
        )}

        {/* Estadísticas de Prescripciones */}
        {totalPrescripciones > 0 && (
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📊</span>
              Estadísticas de Prescripciones
            </h4>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>💊</div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{totalPrescripciones}</div>
                  <div className={styles.statLabel}>Total</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>✅</div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{prescripcionesCumplidas}</div>
                  <div className={styles.statLabel}>Cumplidas</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>📈</div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{cumplimientoPorcentaje}%</div>
                  <div className={styles.statLabel}>Cumplimiento</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prescripciones */}
        <div className={styles.infoSection}>
          <h4 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>💊</span>
            Prescripciones
            <span className={styles.countBadge}>{totalPrescripciones}</span>
          </h4>
          
          {totalPrescripciones > 0 ? (
            <div className={styles.prescriptionsList}>
              {planData.prescripciones.map((prescripcion, index) => (
                <div key={index} className={styles.prescriptionCard}>
                  <div className={styles.prescriptionHeader}>
                    <span className={styles.prescriptionNumber}>#{index + 1}</span>
                    <span className={`${styles.statusBadge} ${prescripcion.cumplimiento ? styles.completed : styles.pending}`}>
                      {prescripcion.cumplimiento ? '✅ Cumplida' : '⏳ Pendiente'}
                    </span>
                  </div>
                  
                  {prescripcion.descripcion && (
                    <div className={styles.prescriptionDescription}>
                      {prescripcion.descripcion}
                    </div>
                  )}
                  
                  <div className={styles.prescriptionMeta}>
                    {prescripcion.frecuencia && (
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Frecuencia:</span>
                        <span className={styles.metaValue}>{prescripcion.frecuencia}</span>
                      </div>
                    )}
                    
                    {prescripcion.duracion && (
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Duración:</span>
                        <span className={styles.metaValue}>{prescripcion.duracion}</span>
                      </div>
                    )}
                    
                    {prescripcion.fecha_creacion && (
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Creada:</span>
                        <span className={styles.metaValue}>{formatDate(prescripcion.fecha_creacion)}</span>
                      </div>
                    )}
                  </div>
                  
                  {prescripcion.observaciones && (
                    <div className={styles.prescriptionObservations}>
                      <strong>Observaciones:</strong> {prescripcion.observaciones}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyList}>
              <div className={styles.emptyIcon}>💊</div>
              <p>No hay prescripciones registradas para este plan.</p>
            </div>
          )}
        </div>

        {/* Información del Sistema (solo si hay datos relevantes) */}
        <div className={styles.infoSection}>
          <h4 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>⚙️</span>
            Información del Sistema
          </h4>
          <div className={styles.systemInfo}>
            {planData.id_medico && (
              <div className={styles.systemItem}>
                <span className={styles.systemLabel}>Médico ID:</span>
                <span className={styles.systemValue}>{planData.id_medico}</span>
              </div>
            )}
            {planData.medico_ci && (
              <div className={styles.systemItem}>
                <span className={styles.systemLabel}>CI Médico:</span>
                <span className={styles.systemValue}>{planData.medico_ci}</span>
              </div>
            )}
            {planData.id_paciente && (
              <div className={styles.systemItem}>
                <span className={styles.systemLabel}>Paciente ID:</span>
                <span className={styles.systemValue}>{planData.id_paciente}</span>
              </div>
            )}
            {planData.paciente_ci && (
              <div className={styles.systemItem}>
                <span className={styles.systemLabel}>CI Paciente:</span>
                <span className={styles.systemValue}>{planData.paciente_ci}</span>
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => closeModal('viewPlan')}
            className={styles.closeButton}
          >
            Cerrar Vista
          </button>
        </div>
      </div>
    </Modal>
  );
}