// ViewPrescripcionModal.jsx
import React from 'react';
import Modal from '../Modal/Modal';
import { useModal } from '../../../hooks/useModal';
import { useAuthContext } from '../../../context/AuthContext';
import styles from './ViewPrescripcionModal.module.css';

export default function ViewPrescripcionModal() {
  const { modals, getModalData, closeModal, openEditPrescripcion } = useModal();
  const { profile } = useAuthContext();

  const open = !!modals.viewPres;
  const payload = getModalData('viewPres') || {};
  const currentViewPres = payload.currentViewPres || null;

  if (!open) return null;

  if (open && !currentViewPres) {
    return (
      <Modal open={open} onClose={() => closeModal('viewPres')} title="Prescripción" size="md">
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Cargando información de la prescripción...</p>
          </div>
        </div>
      </Modal>
    );
  }

  const isGestor = profile?.tipo_usuario === 'gestor_casos' ||
    (typeof profile?.tipo_usuario === 'string' && profile.tipo_usuario.includes('gestor'));

  const toBool = (v) => {
    if (v === true || v === 1) return true;
    if (v === false || v === 0) return false;
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      if (s === 'true' || s === '1') return true;
      if (s === 'false' || s === '0' || s === '') return false;
    }
    return Boolean(v);
  };

  const getCumplimientoColor = (cumplimiento) => (toBool(cumplimiento) ? '#27ae60' : '#e74c3c');
  const getCumplimientoLabel = (cumplimiento) => (toBool(cumplimiento) ? 'Cumplido' : 'Pendiente');
  const getCumplimientoIcon = (cumplimiento) => (toBool(cumplimiento) ? '✅' : '⏳');

  const tipo = currentViewPres.tipo || 'Prescripción';
  const isMedicacion = tipo === 'Medicacion';

  const handleEdit = () => {
    if (typeof openEditPrescripcion === 'function') openEditPrescripcion(currentViewPres);
  };

  return (
    <Modal
      open={open}
      onClose={() => closeModal('viewPres')}
      title="Detalles de Prescripción"
      size="md"
    >
      <div className={styles.container}>
        {/* Encabezado de la Prescripción */}
        <div className={styles.headerSection}>
          <div className={styles.typeIcon}>
            {isMedicacion ? '💊' : '📝'}
          </div>
          <div className={styles.headerContent}>
            <h3 className={styles.prescTitle}>
              {isMedicacion ? 'Medicación' : tipo}
            </h3>
            <div className={styles.headerMeta}>
              <span className={styles.idLabel}>
                ID: {currentViewPres.id_prescripcion ?? currentViewPres.id}
              </span>
              <span 
                className={styles.statusBadge}
                style={{ backgroundColor: getCumplimientoColor(currentViewPres.cumplimiento) }}
              >
                {getCumplimientoIcon(currentViewPres.cumplimiento)} {getCumplimientoLabel(currentViewPres.cumplimiento)}
              </span>
            </div>
          </div>
        </div>

        {/* Información Principal */}
        <div className={styles.infoSection}>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Tipo</label>
              <div className={styles.infoValue}>{tipo}</div>
            </div>
            
            {currentViewPres.frecuencia && (
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Frecuencia</label>
                <div className={styles.infoValue}>{currentViewPres.frecuencia}</div>
              </div>
            )}
            
            {currentViewPres.duracion && (
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Duración</label>
                <div className={styles.infoValue}>{currentViewPres.duracion}</div>
              </div>
            )}
          </div>
        </div>

        {/* Descripción */}
        <div className={styles.infoSection}>
          <h4 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📄</span>
            Descripción
          </h4>
          <div className={styles.description}>
            {currentViewPres.descripcion || (
              <span className={styles.noData}>Sin descripción disponible</span>
            )}
          </div>
        </div>

        {/* Observaciones */}
        {currentViewPres.observaciones && (
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📝</span>
              Observaciones
            </h4>
            <div className={styles.observations}>
              {currentViewPres.observaciones}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className={styles.formActions}>
          {isGestor && (
            <button
              type="button"
              onClick={handleEdit}
              className={styles.editButton}
            >
              <span className={styles.buttonIcon}>✏️</span>
              Editar Prescripción
            </button>
          )}
          <button
            type="button"
            onClick={() => closeModal('viewPres')}
            className={styles.closeButton}
          >
            Cerrar Vista
          </button>
        </div>
      </div>
    </Modal>
  );
}