// EditHistoriaModal.jsx
import React, { useEffect, useState } from 'react';
import Modal from '../Modal/Modal';
import { useModal } from '../../../hooks/useModal';
import { useHistory } from '../../../hooks/useHistory';
import { useToast } from '../../../hooks/useToast';
import styles from './EditHistoriaModal.module.css';

export default function EditHistoriaModal() {
  const { modals, closeModal, modalData } = useModal();
  const { updateRegistro } = useHistory();
  const { showToast } = useToast();

  const open = !!modals.editHistoria;
  const { currentEditHistoria } = modalData?.editHistoria || {};

  const [formData, setFormData] = useState({
    recordId: '',
    titulo: '',
    descripcion: '',
    tipo: 'general'
  });

  const [submitting, setSubmitting] = useState(false);
  const [recordInfo, setRecordInfo] = useState(null);

  useEffect(() => {
    if (open && currentEditHistoria) {
      const fechaCreacion = currentEditHistoria.fecha_creacion
        ? new Date(currentEditHistoria.fecha_creacion).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'No disponible';

      const fechaActualizacion = currentEditHistoria.fecha_actualizacion
        ? new Date(currentEditHistoria.fecha_actualizacion).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'No disponible';

      const recordId = currentEditHistoria.id_registro || currentEditHistoria.id || '';
      
      setFormData({
        recordId: recordId,
        titulo: currentEditHistoria.titulo || '',
        descripcion: currentEditHistoria.descripcion || '',
        tipo: currentEditHistoria.tipo || 'general'
      });
      setRecordInfo({ fechaCreacion, fechaActualizacion });
    } else {
      setFormData({
        recordId: '',
        titulo: '',
        descripcion: '',
        tipo: 'general'
      });
      setRecordInfo(null);
    }
  }, [open, currentEditHistoria]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClear = () => {
    if (currentEditHistoria) {
      setFormData({
        recordId: currentEditHistoria.id_registro || currentEditHistoria.id || '',
        titulo: currentEditHistoria.titulo || '',
        descripcion: currentEditHistoria.descripcion || '',
        tipo: currentEditHistoria.tipo || 'general'
      });
      
      if (currentEditHistoria.fecha_creacion || currentEditHistoria.fecha_actualizacion) {
        const fechaCreacion = currentEditHistoria.fecha_creacion
          ? new Date(currentEditHistoria.fecha_creacion).toLocaleString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'No disponible';

        const fechaActualizacion = currentEditHistoria.fecha_actualizacion
          ? new Date(currentEditHistoria.fecha_actualizacion).toLocaleString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'No disponible';

        setRecordInfo({ fechaCreacion, fechaActualizacion });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titulo.trim()) {
      showToast('El título es obligatorio', 'error');
      return;
    }

    if (!formData.descripcion.trim()) {
      showToast('La descripción es obligatoria', 'error');
      return;
    }

    if (!formData.recordId) {
      showToast('No se pudo identificar el registro', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await updateRegistro(formData.recordId, {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tipo: formData.tipo
      });

      showToast('Registro actualizado exitosamente', 'success');
      closeModal('editHistoria');
    } catch (error) {
      showToast(error.message || 'Error al actualizar el registro', 'error');
    } finally {
      setSubmitting(false);
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
    return tipos[tipo] || tipo;
  };

  return (
    <Modal
      open={open}
      onClose={() => closeModal('editHistoria')}
      title="Editar Registro Clínico"
      size="lg"
    >
      <div className={styles.container}>
        {/* Información del Registro */}
        <div className={styles.headerSection}>
          <div className={styles.headerIcon}>📝</div>
          <div className={styles.headerInfo}>
            <h3>Editar Registro</h3>
            {recordInfo && (
              <div className={styles.recordMeta}>
                <span className={styles.metaItem}>
                  <strong>Creado:</strong> {recordInfo.fechaCreacion}
                </span>
                <span className={styles.metaItem}>
                  <strong>Actualizado:</strong> {recordInfo.fechaActualizacion}
                </span>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Información Básica */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📋</span>
              Información del Registro
            </h4>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="titulo" className={styles.label}>
                  Título *
                </label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  placeholder="Título del registro clínico"
                  className={styles.input}
                  required
                  disabled={submitting}
                />
                <div className={styles.inputInfo}>
                  {formData.titulo.length > 0 && (
                    <span className={styles.charCount}>{formData.titulo.length} caracteres</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📄</span>
              Descripción Detallada
            </h4>
            
            <div className={styles.formGroup}>
              <label htmlFor="descripcion" className={styles.label}>
                Descripción *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción detallada del registro clínico..."
                className={styles.textarea}
                rows={6}
                required
                disabled={submitting}
              />
              <div className={styles.textareaInfo}>
                <div className={styles.charCount}>
                  <span>{formData.descripcion.length} caracteres</span>
                </div>
                <div className={styles.lineCount}>
                  <span>{formData.descripcion.split('\n').length} líneas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vista Previa */}
          {(formData.titulo || formData.descripcion) && (
            <div className={styles.formSection}>
              <h4 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>👁️</span>
                Vista Previa
              </h4>
              
              <div className={styles.previewCard}>
                {formData.titulo && (
                  <div className={styles.previewHeader}>
                    <h5 className={styles.previewTitle}>{formData.titulo}</h5>
                    <span className={styles.previewTipo}>
                      {getTipoLabel(formData.tipo)}
                    </span>
                  </div>
                )}
                {formData.descripcion && (
                  <div className={styles.previewContent}>
                    {formData.descripcion.split('\n').map((line, index) => (
                      <p key={index} className={styles.previewLine}>
                        {line || <br />}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={handleClear}
              className={styles.secondaryButton}
              disabled={submitting}
            >
              <span className={styles.buttonIcon}>↺</span>
              Restaurar Original
            </button>
            
            <div className={styles.primaryActions}>
              <button
                type="button"
                onClick={() => closeModal('editHistoria')}
                className={styles.cancelButton}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className={styles.spinner}></span>
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}