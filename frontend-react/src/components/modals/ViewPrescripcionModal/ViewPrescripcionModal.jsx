import React from "react";
import Modal from "../Modal/Modal";
import { useModal } from "../../../hooks/useModal";
import { useAuthContext } from "../../../context/AuthContext";
import styles from "./ViewPrescripcionModal.module.css";

export default function ViewPrescripcionModal() {
  const { modals, getModalData, closeModal, openEditPrescripcion } = useModal();
  const { profile } = useAuthContext();

  const open = !!modals.viewPres;
  const payload = getModalData("viewPres") || {};
  const currentViewPres = payload.currentViewPres || null;

  if (!open) return null;

  if (!currentViewPres) {
    return (
      <Modal 
        open={open} 
        onClose={() => closeModal("viewPres")} 
        title="Prescripción"
        size="md"
      >
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando información de la prescripción...</p>
        </div>
      </Modal>
    );
  }

  const isGestor = profile?.tipo_usuario === "gestor_casos" || 
                  (typeof profile?.tipo_usuario === "string" && profile.tipo_usuario.includes("gestor"));
  const isMedico = profile?.tipo_usuario === "medico";

  const handleEdit = () => {
    openEditPrescripcion(currentViewPres);
  };

  const formatDate = (dateString) => {
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

  const getCumplimientoColor = (cumplimiento) => {
    return cumplimiento ? "#27ae60" : "#e74c3c";
  };

  const getCumplimientoLabel = (cumplimiento) => {
    return cumplimiento ? "Cumplido" : "No cumplido";
  };


  const getTipoIcon = (tipo) => {
    const icons = {
      "Tratamiento": "💉",
      "Indicacion": "📋",
      "Medicacion": "💊",
      "Ejercicio": "🏃",
      "Dieta": "🍎",
      "default": "📝"
    };
    return icons[tipo] || icons["default"];
  };

  const tipo = currentViewPres.tipo || "Prescripción";
  // const tipoColor = getTipoColor(tipo);
  const tipoIcon = getTipoIcon(tipo);

  return (
    <Modal
      open={open}
      onClose={() => closeModal("viewPres")}
      title={`${tipo} - Detalles`}
      size="md"
    >
      <div className={styles.content}>
        {/* Encabezado */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <div className={styles.tipoDisplay}>
                <span className={styles.tipoIcon}>{tipoIcon}</span>
                <h1 className={styles.title}>{tipo}</h1>
              </div>
              <div className={styles.subtitle}>
                <span 
                  className={styles.cumplimientoBadge}
                  style={{ backgroundColor: getCumplimientoColor(currentViewPres.cumplimiento) }}
                >
                  {getCumplimientoLabel(currentViewPres.cumplimiento)}
                </span>
                {currentViewPres.id_prescripcion && (
                  <span className={styles.idBadge}>
                    ID: {currentViewPres.id_prescripcion}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Metadatos Principales */}
        <div className={styles.metadataSection}>
          <div className={styles.metadataGrid}>
            <div className={styles.metaItem}>
              <div className={styles.metaIcon}>📅</div>
              <div className={styles.metaContent}>
                <div className={styles.metaLabel}>Fecha de Creación</div>
                <div className={styles.metaValue}>
                  {formatDate(currentViewPres.fecha_creacion)}
                </div>
              </div>
            </div>

            <div className={styles.metaItem}>
              <div className={styles.metaIcon}>🔄</div>
              <div className={styles.metaContent}>
                <div className={styles.metaLabel}>Última Actualización</div>
                <div className={styles.metaValue}>
                  {formatDate(currentViewPres.fecha_actualizacion)}
                </div>
              </div>
            </div>

            {currentViewPres.frecuencia && (
              <div className={styles.metaItem}>
                <div className={styles.metaIcon}>⏱️</div>
                <div className={styles.metaContent}>
                  <div className={styles.metaLabel}>Frecuencia</div>
                  <div className={styles.metaValue}>
                    {currentViewPres.frecuencia}
                  </div>
                </div>
              </div>
            )}

            {currentViewPres.duracion && (
              <div className={styles.metaItem}>
                <div className={styles.metaIcon}>📅</div>
                <div className={styles.metaContent}>
                  <div className={styles.metaLabel}>Duración</div>
                  <div className={styles.metaValue}>
                    {currentViewPres.duracion}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Descripción Principal */}
        <div className={styles.descriptionSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📄</span>
            Descripción
          </h3>
          
          <div className={styles.descriptionCard}>
            {currentViewPres.descripcion ? (
              <div className={styles.descriptionContent}>
                {currentViewPres.descripcion.split("\n").map((line, index) => (
                  <p key={index} className={styles.descriptionParagraph}>
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <div className={styles.noContent}>
                <div className={styles.noContentIcon}>📝</div>
                <p>No hay descripción disponible.</p>
              </div>
            )}
          </div>
        </div>

        {/* Observaciones Adicionales */}
        {currentViewPres.observaciones && (
          <div className={styles.observacionesSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>💬</span>
              Observaciones Adicionales
            </h3>
            
            <div className={styles.observacionesCard}>
              <div className={styles.observacionesContent}>
                <p className={styles.observacionesText}>
                  {currentViewPres.observaciones}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información de Contexto */}
        <div className={styles.contextSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🔗</span>
            Contexto de la Prescripción
          </h3>
          
          <div className={styles.contextGrid}>
            {currentViewPres.plan_titulo && (
              <div className={styles.contextItem}>
                <div className={styles.contextIcon}>📋</div>
                <div className={styles.contextContent}>
                  <div className={styles.contextLabel}>Plan de Tratamiento</div>
                  <div className={styles.contextValue}>
                    {currentViewPres.plan_titulo}
                  </div>
                </div>
              </div>
            )}

            {currentViewPres.medico_nombre && (
              <div className={styles.contextItem}>
                <div className={styles.contextIcon}>👨‍⚕️</div>
                <div className={styles.contextContent}>
                  <div className={styles.contextLabel}>Médico Prescriptor</div>
                  <div className={styles.contextValue}>
                    {currentViewPres.medico_nombre}
                  </div>
                </div>
              </div>
            )}

            {currentViewPres.paciente_nombre && (
              <div className={styles.contextItem}>
                <div className={styles.contextIcon}>👤</div>
                <div className={styles.contextContent}>
                  <div className={styles.contextLabel}>Paciente</div>
                  <div className={styles.contextValue}>
                    {currentViewPres.paciente_nombre}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>📝</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>
                  {currentViewPres.descripcion?.length || 0}
                </div>
                <div className={styles.statLabel}>caracteres</div>
              </div>
            </div>

            <div className={styles.statItem}>
              <div className={styles.statIcon}>📄</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>
                  {currentViewPres.descripcion?.split('\n').length || 0}
                </div>
                <div className={styles.statLabel}>líneas</div>
              </div>
            </div>

            <div className={styles.statItem}>
              <div className={styles.statIcon}>💬</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>
                  {currentViewPres.observaciones ? "Sí" : "No"}
                </div>
                <div className={styles.statLabel}>observaciones</div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className={styles.actionsSection}>
          <div className={styles.actions}>
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
            
            {(isMedico && !isGestor) && (
              <button
                type="button"
                onClick={() => {
                  // Aquí normalmente llamarías a una función para ver el plan completo
                }}
                className={styles.viewPlanButton}
              >
                <span className={styles.buttonIcon}>📋</span>
                Ver Plan Completo
              </button>
            )}
            
            <button
              type="button"
              onClick={() => closeModal("viewPres")}
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