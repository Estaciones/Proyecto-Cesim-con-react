import React, { useContext, useEffect } from 'react';
import { DashboardContext } from '../../../../context/DashboardContext';
import Button from '../../../ui/Button/Button';
import Card from '../../../ui/Card/Card';
import styles from './Historia.module.css';

export default function Historia() {
  const {
    historia,
    loadHistoria,
    loading,
    profile,
    selectedPatient,
    openModal,
    openViewHistoria,
    openEditHistoria,
  } = useContext(DashboardContext);

  useEffect(() => {
    loadHistoria();
  }, [loadHistoria]);

  const formatShortDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

//   const formatDateTime = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     return date.toLocaleString('es-ES', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Historia Clínica</h1>
          {selectedPatient && (
            <div className={styles.patientBadge}>
              <span className={styles.patientName}>
                {selectedPatient.nombre} {selectedPatient.apellido}
              </span>
              <span className={styles.patientCI}>CI: {selectedPatient.ci}</span>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {profile?.tipo_usuario === 'medico' && (
            <Button
              variant="primary"
              onClick={() => openModal('registro')}
              className={styles.addButton}
            >
              <svg className={styles.addIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Registro
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando historia clínica...</p>
        </div>
      ) : !historia || historia.length === 0 ? (
        <Card className={styles.emptyCard}>
          <div className={styles.emptyState}>
            <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3>Sin registros</h3>
            <p>No hay registros en la historia clínica para este paciente.</p>
          </div>
        </Card>
      ) : (
        <div className={styles.grid}>
          {historia.map((record) => (
            <Card key={record.id_registro || record.id} className={styles.recordCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.recordTitle}>{record.titulo}</h3>
                <div className={styles.cardActions}>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => openViewHistoria(record)}
                    className={styles.actionButton}
                  >
                    <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver
                  </Button>
                  {profile?.tipo_usuario === 'medico' && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => openEditHistoria(record)}
                      className={styles.actionButton}
                    >
                      <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </Button>
                  )}
                </div>
              </div>

              <div className={styles.cardContent}>
                <p className={styles.recordDescription}>
                  {(record.descripcion || '').length > 200
                    ? `${(record.descripcion || '').slice(0, 200)}...`
                    : record.descripcion || ''}
                </p>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.meta}>
                  <div className={styles.metaItem}>
                    <svg className={styles.metaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Creado: {formatShortDate(record.fecha_creacion)}</span>
                  </div>
                  {record.fecha_actualizacion && (
                    <div className={styles.metaItem}>
                      <svg className={styles.metaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Actualizado: {formatShortDate(record.fecha_actualizacion)}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}