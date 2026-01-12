import React from "react";
import Modal from "../Modal/Modal";
import { useModal } from "../../../hooks/useModal";
import { useAuthContext } from "../../../context/AuthContext";
import styles from "./ViewPlanModal.module.css";

export default function ViewPlanModal() {
  const { modals, getModalData, closeModal, openEditPlan, openViewPrescripcion, openEditPrescripcion } = useModal();
  const { profile } = useAuthContext();

  const open = !!modals.viewPlan;
  const payload = getModalData("viewPlan") || {};
  const currentViewPlan = payload.currentViewPlan || null;

  if (!open) return null;

  if (!currentViewPlan) {
    return (
      <Modal 
        open={open} 
        onClose={() => closeModal("viewPlan")} 
        title="Plan de Tratamiento"
        size="md"
      >
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando información del plan...</p>
        </div>
      </Modal>
    );
  }

  const isMedico = profile?.tipo_usuario === "medico";
  const isGestor = profile?.tipo_usuario === "gestor_casos" || 
                  (typeof profile?.tipo_usuario === "string" && profile.tipo_usuario.includes("gestor"));

  // --- Helper para normalizar booleanos / flags que vienen como string/number/boolean ---
  const toBool = (v) => {
    if (v === true || v === 1) return true;
    if (v === false || v === 0) return false;
    if (typeof v === "string") {
      const s = v.trim().toLowerCase();
      if (s === "true" || s === "1") return true;
      if (s === "false" || s === "0" || s === "") return false;
    }
    return Boolean(v);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No disponible";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", { 
        day: "2-digit", 
        month: "2-digit", 
        year: "numeric" 
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "No disponible";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateString;
    }
  };

  const getEstadoColor = (estado) => {
    return toBool(estado) ? "#27ae60" : "#e74c3c";
  };

  const getEstadoLabel = (estado) => {
    return toBool(estado) ? "Activo" : "Inactivo";
  };

  const handleEditPlan = () => {
    openEditPlan(currentViewPlan);
  };

  const handleViewPres = (pres) => {
    openViewPrescripcion(pres);
  };

  const handleEditPres = (pres) => {
    openEditPrescripcion(pres);
  };

  const prescripciones = Array.isArray(currentViewPlan.prescripciones) 
    ? currentViewPlan.prescripciones 
    : [];

  // contar cumplidas normalizando
  const cumplidasCount = prescripciones.filter(p => toBool(p?.cumplimiento)).length;

  return (
    <Modal
      open={open}
      onClose={() => closeModal("viewPlan")}
      title={currentViewPlan.titulo || "Plan de Tratamiento"}
      size="lg"
    >
      <div className={styles.content}>
        {/* Encabezado del Plan */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>
                {currentViewPlan.titulo || "Plan de Tratamiento"}
              </h1>
              <div className={styles.subtitle}>
                <span className={styles.dateRange}>
                  {formatDate(currentViewPlan.fecha_inicio)}
                  {currentViewPlan.fecha_fin && (
                    <>
                      <span className={styles.dateSeparator}>—</span>
                      {formatDate(currentViewPlan.fecha_fin)}
                    </>
                  )}
                </span>
                <span 
                  className={styles.estadoBadge}
                  style={{ backgroundColor: getEstadoColor(currentViewPlan.estado) }}
                >
                  {getEstadoLabel(currentViewPlan.estado)}
                </span>
              </div>
            </div>
            
            <div className={styles.headerActions}>
              {isMedico && (
                <button 
                  type="button" 
                  onClick={handleEditPlan} 
                  className={styles.editPlanButton}
                >
                  <span className={styles.buttonIcon}>✏️</span>
                  Editar Plan
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ... resto del componente sin cambios exceptuando referencias a cumplimiento ... */}

        {/* Prescripciones */}
        <div className={styles.prescripcionesSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>💊</span>
              Prescripciones ({prescripciones.length})
            </h3>
            {currentViewPlan.resumen_egreso && (
              <div className={styles.egresoBadge}>
                <span className={styles.egresoIcon}>✅</span>
                Egreso Completado
              </div>
            )}
          </div>

          {prescripciones.length === 0 ? (
            <div className={styles.emptyPrescripciones}>
              <div className={styles.emptyIcon}>💊</div>
              <p>No hay prescripciones en este plan.</p>
            </div>
          ) : (
            <div className={styles.prescripcionesList}>
              {prescripciones.map((pres, index) => (
                <div key={pres.id_prescripcion || pres.id || index} className={styles.prescripcionCard}>
                  <div className={styles.prescripcionHeader}>
                    <div className={styles.prescripcionInfo}>
                      <div className={styles.prescripcionNumber}>#{index + 1}</div>
                      <div className={styles.prescripcionType}>{pres.tipo || "Prescripción"}</div>
                      {typeof pres.cumplimiento !== "undefined" && (
                        <div 
                          className={styles.cumplimientoBadge}
                          style={{ backgroundColor: toBool(pres.cumplimiento) ? "#27ae60" : "#e74c3c" }}
                        >
                          {toBool(pres.cumplimiento) ? "Cumplido" : "Pendiente"}
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.prescripcionActions}>
                      <button
                        type="button"
                        onClick={() => handleViewPres(pres)}
                        className={styles.viewPresButton}
                      >
                        <span className={styles.buttonIcon}>👁️</span>
                        Ver
                      </button>
                      
                      {isGestor && (
                        <button
                          type="button"
                          onClick={() => handleEditPres(pres)}
                          className={styles.editPresButton}
                        >
                          <span className={styles.buttonIcon}>✏️</span>
                          Editar
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={styles.prescripcionBody}>
                    <div className={styles.prescripcionDesc}>{pres.descripcion}</div>

                    {(pres.frecuencia || pres.duracion) && (
                      <div className={styles.prescripcionMeta}>
                        {pres.frecuencia && (
                          <div className={styles.metaItem}>
                            <span className={styles.metaIcon}>⏱️</span>
                            <span className={styles.metaLabel}>Frecuencia:</span>
                            <span className={styles.metaValue}>{pres.frecuencia}</span>
                          </div>
                        )}
                        
                        {pres.duracion && (
                          <div className={styles.metaItem}>
                            <span className={styles.metaIcon}>📅</span>
                            <span className={styles.metaLabel}>Duración:</span>
                            <span className={styles.metaValue}>{pres.duracion}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {pres.observaciones && (
                      <div className={styles.observaciones}>
                        <div className={styles.observacionesLabel}>
                          <span className={styles.observacionesIcon}>💬</span>
                          Observaciones:
                        </div>
                        <div className={styles.observacionesText}>{pres.observaciones}</div>
                      </div>
                    )}

                    {pres.fecha_creacion && (
                      <div className={styles.prescripcionDates}>
                        <span className={styles.dateItem}>Creada: {formatDateTime(pres.fecha_creacion)}</span>
                        {pres.fecha_actualizacion && pres.fecha_actualizacion !== pres.fecha_creacion && (
                          <span className={styles.dateItem}>Actualizada: {formatDateTime(pres.fecha_actualizacion)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estadísticas del Plan */}
        <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>💊</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{prescripciones.length}</div>
                <div className={styles.statLabel}>Prescripciones</div>
              </div>
            </div>

            <div className={styles.statItem}>
              <div className={styles.statIcon}>✅</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{cumplidasCount}</div>
                <div className={styles.statLabel}>Cumplidas</div>
              </div>
            </div>

            <div className={styles.statItem}>
              <div className={styles.statIcon}>📅</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>
                  {currentViewPlan.resumen_egreso ? "Completado" : "En curso"}
                </div>
                <div className={styles.statLabel}>Estado</div>
              </div>
            </div>

            <div className={styles.statItem}>
              <div className={styles.statIcon}>📝</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{currentViewPlan.descripcion?.length || 0}</div>
                <div className={styles.statLabel}>Caracteres</div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className={styles.actionsSection}>
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => closeModal("viewPlan")}
              className={styles.closeButton}
            >
              <span className={styles.buttonIcon}>✕</span>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
