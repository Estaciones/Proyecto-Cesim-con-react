import React, { useContext, useEffect } from 'react';
import { DashboardContext } from '../../../../../context/DashboardContext';
import Button from '../../../../ui/Button/Button';
import Card from '../../../../ui/Card/Card';
import styles from './Planes.module.css';

export default function Planes() {
  const {
    plans,
    loadPlanes,
    loading,
    selectedPatient,
    openModal,
    openViewPlan,
    openEditPlan,
    openCrearPlanWithPatient,
    isPaciente,
    canCreatePlan,
    canEditPlan,
    // <-- nuevos / necesarios para editar prescripciones desde gestor
    canEditPrescripcion,
    openEditPresWithId,
    updatePrescripcion,
  } = useContext(DashboardContext);

  useEffect(() => {
    loadPlanes();
  }, [loadPlanes]);

  const formatShortDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formateando fecha:', dateString, error);
      return '';
    }
  };

  const getStatusColor = (status) => {
    const statusStr = String(status || '').toLowerCase().trim();

    switch (statusStr) {
      case 'activo':
      case 'active':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'pendiente':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'finalizado':
      case 'completed':
      case 'terminado':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'cancelado':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // toggle cumplimiento (rápido) — usa updatePrescripcion del provider
  const toggleCumplimiento = async (pres) => {
    const presId = pres.id_prescripcion || pres.id;
    try {
      await updatePrescripcion({
        presId,
        descripcion: pres.descripcion || '',
        observaciones: pres.observaciones || '',
        cumplimiento: !pres.cumplimiento,
      });
      // updatePrescripcion ya recarga planes y muestra toast según el provider
    } catch (err) {
      // Si algo falla, updatePrescripcion ya muestra toast; aquí lo registramos
      console.error('Error toggling cumplimiento:', err);
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            {isPaciente() ? 'Mis Planes de Tratamiento' : 'Planes de Tratamiento'}
          </h1>
          {selectedPatient && !isPaciente() && (
            <div className={styles.patientBadge}>
              <span className={styles.patientName}>
                {selectedPatient.nombre} {selectedPatient.apellido}
              </span>
              <span className={styles.patientCI}>CI: {selectedPatient.ci}</span>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {canCreatePlan() && (
            <Button
              variant="primary"
              onClick={() => {
                if (selectedPatient?.id_paciente) {
                  openCrearPlanWithPatient(selectedPatient.id_paciente);
                } else {
                  openModal('crearPlan');
                }
              }}
              className={styles.addButton}
            >
              <svg className={styles.addIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear Plan
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando planes de tratamiento...</p>
        </div>
      ) : !plans || plans.length === 0 ? (
        <Card className={styles.emptyCard}>
          <div className={styles.emptyState}>
            <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3>Sin planes de tratamiento</h3>
            <p>
              {isPaciente()
                ? 'Aún no tienes planes de tratamiento asignados.'
                : 'No hay planes de tratamiento registrados para este paciente.'}
            </p>
            {canCreatePlan() && (
              <Button
                variant="primary"
                onClick={() => openModal('crearPlan')}
                className={styles.emptyButton}
              >
                Crear primer plan
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className={styles.grid}>
          {plans.map((plan) => (
            <Card key={plan.id_plan || plan.id} className={styles.planCard}>
              <div className={styles.cardHeader}>
                <div className={styles.planTitleSection}>
                  <h3 className={styles.planTitle}>{plan.titulo}</h3>
                  {plan.estado && (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(plan.estado)}`}
                    >
                      {plan.estado}
                    </span>
                  )}
                </div>
                <div className={styles.cardActions}>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => openViewPlan(plan)}
                    className={styles.actionButton}
                  >
                    <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver
                  </Button>
                  {canEditPlan() && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => openEditPlan(plan)}
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
                <p className={styles.planDescription}>
                  {(plan.descripcion || '').length > 200
                    ? `${(plan.descripcion || '').slice(0, 200)}...`
                    : plan.descripcion || ''}
                </p>

                <div className={styles.metaGrid}>
                  <div className={styles.metaItem}>
                    <svg className={styles.metaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className={styles.metaLabel}>Inicio</div>
                      <div className={styles.metaValue}>
                        {formatShortDate(plan.fecha_inicio)}
                      </div>
                    </div>
                  </div>

                  <div className={styles.metaItem}>
                    <svg className={styles.metaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      <div className={styles.metaLabel}>Médico</div>
                      <div className={styles.metaValue}>
                        {plan.medico_ci || 'No especificado'}
                      </div>
                    </div>
                  </div>
                </div>

                {Array.isArray(plan.prescripciones) && plan.prescripciones.length > 0 && (
                  <div className={styles.prescriptionsSection}>
                    <h4 className={styles.prescriptionsTitle}>
                      <svg className={styles.prescriptionsIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Prescripciones
                    </h4>
                    <div className={styles.prescriptionsList}>
                      {plan.prescripciones.slice(0, 3).map((pres, index) => (
                        <div key={pres.id_prescripcion || pres.id || index} className={styles.prescriptionItem}>
                          <div className={styles.prescriptionHeader}>
                            <strong className={styles.prescriptionDescription}>
                              {pres.descripcion || 'Sin descripción'}
                            </strong>
                            {pres.cumplimiento !== undefined && (
                              <span className={styles.complianceBadge}>
                                {pres.cumplimiento ? '✓ Cumplido' : '⏰ Pendiente'}
                              </span>
                            )}
                          </div>

                          {/* mostrar observaciones si existen */}
                          {pres.observaciones && (
                            <div className={styles.prescriptionObservaciones}>
                              <div className={styles.obsLabel}>Observaciones:</div>
                              <div className={styles.obsText}>
                                {pres.observaciones.length > 200
                                  ? `${pres.observaciones.slice(0, 200)}...`
                                  : pres.observaciones}
                              </div>
                            </div>
                          )}

                          <div className={styles.prescriptionMeta}>
                            {pres.frecuencia && (
                              <span className={styles.prescriptionMetaItem}>
                                Frecuencia: {pres.frecuencia}
                              </span>
                            )}
                            {pres.duracion && (
                              <span className={styles.prescriptionMetaItem}>
                                Duración: {pres.duracion}
                              </span>
                            )}
                          </div>

                          {/* acciones para gestor: editar observaciones / toggle cumplimiento */}
                          {canEditPrescripcion && canEditPrescripcion() && (
                            <div className={styles.prescriptionActions}>
                              <Button
                                variant="secondary"
                                size="small"
                                onClick={() => openEditPresWithId(pres.id_prescripcion || pres.id)}
                                className={styles.actionButton}
                              >
                                <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Editar
                              </Button>

                              <Button
                                variant="secondary"
                                size="small"
                                onClick={() => toggleCumplimiento(pres)}
                                className={styles.actionButton}
                              >
                                {pres.cumplimiento ? (
                                  <>
                                    <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6h.01M6 12h.01" />
                                    </svg>
                                    Marcar pendiente
                                  </>
                                ) : (
                                  <>
                                    <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Marcar cumplido
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                      {plan.prescripciones.length > 3 && (
                        <div className={styles.morePrescriptions}>
                          +{plan.prescripciones.length - 3} más prescripciones
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.footerStats}>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>
                      {Array.isArray(plan.prescripciones) ? plan.prescripciones.length : 0}
                    </span>
                    <span className={styles.statLabel}>prescripciones</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>
                      {Array.isArray(plan.prescripciones)
                        ? plan.prescripciones.filter(p => p.cumplimiento).length
                        : 0}
                    </span>
                    <span className={styles.statLabel}>cumplidas</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
