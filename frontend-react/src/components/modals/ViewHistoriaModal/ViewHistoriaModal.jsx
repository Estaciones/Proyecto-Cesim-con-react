import React from "react";
import Modal from "../Modal/Modal";
import { useModal } from "../../../hooks/useModal";
import { useAuthContext } from "../../../context/AuthContext";
import styles from "./ViewHistoriaModal.module.css";

export default function ViewHistoriaModal() {
  const { modals, getModalData, closeModal } = useModal();
  const { profile } = useAuthContext();

  const open = !!modals.viewHistoria;
  const modalPayload = getModalData("viewHistoria") || {};
  const currentViewHistoria = modalPayload.currentViewHistoria || null;

  if (!open) return null;

  if (!currentViewHistoria) {
    return (
      <Modal
        open={open}
        onClose={() => closeModal("viewHistoria")}
        title="Registro de Historia Clínica"
        size="md"
      >
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando información del registro...</p>
        </div>
      </Modal>
    );
  }

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
      return "Fecha inválida";
    }
  };

  const getTipoLabel = (tipo) => {
    const tipos = {
      general: "General",
      consulta: "Consulta",
      evaluacion: "Evaluación",
      seguimiento: "Seguimiento",
      tratamiento: "Tratamiento",
      diagnostico: "Diagnóstico"
    };
    return tipos[tipo] || tipo || "No especificado";
  };

  const getTipoColor = (tipo) => {
    const colors = {
      general: "#6c8981",
      consulta: "#3498db",
      evaluacion: "#9b59b6",
      seguimiento: "#2ecc71",
      tratamiento: "#e67e22",
      diagnostico: "#e74c3c"
    };
    return colors[tipo] || "#6c8981";
  };

  const canEdit = profile?.tipo_usuario === "medico" || 
                  profile?.tipo_usuario === "admin";

  return (
    <Modal
      open={open}
      onClose={() => closeModal("viewHistoria")}
      title={currentViewHistoria.titulo || "Registro de Historia Clínica"}
      size="lg"
    >
      <div className={styles.content}>
        {/* Encabezado con Metadatos */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              {currentViewHistoria.titulo || "Sin título"}
            </h1>
            <div className={styles.subtitle}>
              <span 
                className={styles.tipoBadge}
                style={{ backgroundColor: getTipoColor(currentViewHistoria.tipo) }}
              >
                {getTipoLabel(currentViewHistoria.tipo)}
              </span>
              <span className={styles.idBadge}>
                ID: {currentViewHistoria.id_registro || currentViewHistoria.id || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Metadatos del Registro */}
        <div className={styles.metadataSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📋</span>
            Información del Registro
          </h3>
          
          <div className={styles.metadataGrid}>
            <div className={styles.metaItem}>
              <div className={styles.metaIcon}>📅</div>
              <div className={styles.metaContent}>
                <div className={styles.metaLabel}>Fecha de Creación</div>
                <div className={styles.metaValue}>
                  {formatDate(currentViewHistoria.fecha_creacion)}
                </div>
              </div>
            </div>

            <div className={styles.metaItem}>
              <div className={styles.metaIcon}>🔄</div>
              <div className={styles.metaContent}>
                <div className={styles.metaLabel}>Última Actualización</div>
                <div className={styles.metaValue}>
                  {formatDate(currentViewHistoria.fecha_actualizacion)}
                </div>
              </div>
            </div>

            {currentViewHistoria.medico_ci && (
              <div className={styles.metaItem}>
                <div className={styles.metaIcon}>👨‍⚕️</div>
                <div className={styles.metaContent}>
                  <div className={styles.metaLabel}>Médico Responsable</div>
                  <div className={styles.metaValue}>
                    {currentViewHistoria.medico_ci}
                  </div>
                </div>
              </div>
            )}

            {currentViewHistoria.paciente_ci && (
              <div className={styles.metaItem}>
                <div className={styles.metaIcon}>👤</div>
                <div className={styles.metaContent}>
                  <div className={styles.metaLabel}>Paciente</div>
                  <div className={styles.metaValue}>
                    {currentViewHistoria.paciente_ci}
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
            Descripción del Registro
          </h3>
          
          <div className={styles.descriptionCard}>
            {currentViewHistoria.descripcion ? (
              <div className={styles.descriptionContent}>
                {currentViewHistoria.descripcion
                  .split("\n")
                  .map((line, index) => (
                    <p key={index} className={styles.descriptionParagraph}>
                      {line}
                    </p>
                  ))}
              </div>
            ) : (
              <div className={styles.noContent}>
                <div className={styles.noContentIcon}>📝</div>
                <p>No hay descripción disponible para este registro.</p>
              </div>
            )}
          </div>
        </div>

        {/* Observaciones Adicionales */}
        {currentViewHistoria.observaciones && (
          <div className={styles.observacionesSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>💬</span>
              Observaciones Adicionales
            </h3>
            
            <div className={styles.observacionesCard}>
              <div className={styles.observacionesContent}>
                <p className={styles.observacionesText}>
                  {currentViewHistoria.observaciones}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas del Contenido */}
        <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>📝</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>
                  {currentViewHistoria.descripcion?.length || 0}
                </div>
                <div className={styles.statLabel}>caracteres</div>
              </div>
            </div>

            <div className={styles.statItem}>
              <div className={styles.statIcon}>📄</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>
                  {currentViewHistoria.descripcion?.split('\n').length || 0}
                </div>
                <div className={styles.statLabel}>líneas</div>
              </div>
            </div>

            <div className={styles.statItem}>
              <div className={styles.statIcon}>📅</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>
                  {currentViewHistoria.observaciones ? "Sí" : "No"}
                </div>
                <div className={styles.statLabel}>observaciones</div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className={styles.actionsSection}>
          <div className={styles.actions}>
            {canEdit && (
              <button
                onClick={() => {
                  closeModal("viewHistoria");
                  // Aquí normalmente llamarías a openEditHistoria(currentViewHistoria)
                }}
                className={styles.editButton}
              >
                <span className={styles.buttonIcon}>✏️</span>
                Editar Registro
              </button>
            )}
            
            <button
              onClick={() => closeModal("viewHistoria")}
              className={styles.closeButton}
            >
              <span className={styles.buttonIcon}>✕</span>
              Cerrar Vista
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}