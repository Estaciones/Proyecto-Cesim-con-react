// ViewHistoriaModal.jsx
import React from 'react';
import Modal from '../Modal/Modal';
import { useModal } from '../../../hooks/useModal';
import styles from './ViewHistoriaModal.module.css';

export default function ViewHistoriaModal() {
  const { modals, closeModal, modalData } = useModal();

  const open = !!modals.viewHistoria;
  const record = modalData.viewHistoria?.currentViewHistoria;

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getTipoLabel = (tipo) => {
    const tipos = {
      general: 'General',
      consulta: 'Consulta',
      evaluacion: 'Evaluación',
      seguimiento: 'Seguimiento',
      tratamiento: 'Tratamiento',
      diagnostico: 'Diagnóstico'
    };
    return tipos[tipo] || tipo || 'No especificado';
  };

  if (!record) {
    return (
      <Modal
        open={open}
        onClose={() => closeModal('viewHistoria')}
        title="Historia Clínica"
        size="lg"
      >
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h3>No hay datos disponibles</h3>
            <p>No se encontró información del registro seleccionado.</p>
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => closeModal('viewHistoria')}
              className={styles.closeButton}
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={() => closeModal('viewHistoria')}
      title={`Historia Clínica: ${record.titulo || 'Sin título'}`}
      size="lg"
    >
      <div className={styles.container}>
        {/* Encabezado con información principal */}
        <div className={styles.headerSection}>
          <div className={styles.headerIcon}>📋</div>
          <div className={styles.headerInfo}>
            <h3 className={styles.recordTitle}>{record.titulo || 'Registro sin título'}</h3>
            <div className={styles.metaInfo}>
              <span className={styles.metaItem}>
                <strong>ID:</strong> {record.id_registro || record.id || 'N/A'}
              </span>
              <span className={styles.metaItem}>
                <strong>Tipo:</strong> {getTipoLabel(record.tipo)}
              </span>
            </div>
          </div>
        </div>

        {/* Información básica */}
        <div className={styles.infoSection}>
          <h4 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📅</span>
            Información del Registro
          </h4>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Fecha de Creación</label>
              <div className={styles.infoValue}>{formatDate(record.fecha_creacion)}</div>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Última Actualización</label>
              <div className={styles.infoValue}>
                {record.fecha_actualizacion && record.fecha_actualizacion !== record.fecha_creacion
                  ? formatDate(record.fecha_actualizacion)
                  : 'Sin actualizaciones'}
              </div>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Médico Responsable</label>
              <div className={styles.infoValue}>{record.medico_ci || 'No especificado'}</div>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className={styles.infoSection}>
          <h4 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📄</span>
            Descripción
          </h4>
          <div className={styles.descriptionContainer}>
            <div className={styles.descriptionContent}>
              {record.descripcion ? (
                record.descripcion.split('\n').map((line, index) => (
                  <p key={index} className={styles.descriptionLine}>
                    {line}
                  </p>
                ))
              ) : (
                <span className={styles.noData}>Sin descripción disponible</span>
              )}
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => closeModal('viewHistoria')}
            className={styles.closeButton}
          >
            Cerrar Vista
          </button>
        </div>
      </div>
    </Modal>
  );
}