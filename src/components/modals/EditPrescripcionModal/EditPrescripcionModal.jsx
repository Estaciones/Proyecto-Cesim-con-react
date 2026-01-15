// EditPresModal.jsx
import React, { useEffect, useState } from 'react';
import Modal from '../Modal/Modal';
import { useModal } from '../../../hooks/useModal';
import { usePlans } from '../../../hooks/usePlans';
import { useToast } from '../../../hooks/useToast';
import styles from './EditPresModal.module.css';

export default function EditPresModal() {
  const { modals, closeModal, modalData } = useModal();
  const { updatePrescription } = usePlans();
  const { showToast } = useToast();

  const open = !!modals.editPres;
  const currentEditPres = modalData?.editPres?.currentEditPres || null;

  const [formData, setFormData] = useState({
    presId: '',
    observaciones: '',
    cumplimiento: 'false'
  });

  const [originalData, setOriginalData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && currentEditPres) {
      const formatted = {
        presId: currentEditPres.id_prescripcion || currentEditPres.id || '',
        observaciones: currentEditPres.observaciones || '',
        cumplimiento: currentEditPres.cumplimiento ? 'true' : 'false'
      };
      setFormData(formatted);
      setOriginalData(formatted);
    } else if (!open) {
      setFormData({ presId: '', observaciones: '', cumplimiento: 'false' });
      setOriginalData(null);
      setSubmitting(false);
    }
  }, [open, currentEditPres]);

  if (!open) return null;

  if (open && !currentEditPres) {
    return (
      <Modal open={open} onClose={() => closeModal('editPres')} title="Editar Prescripción" size="md">
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Cargando información de la prescripción...</p>
          </div>
        </div>
      </Modal>
    );
  }

  const hasChanges =
    originalData &&
    (formData.observaciones !== originalData.observaciones ||
      formData.cumplimiento !== originalData.cumplimiento);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.observaciones.trim()) {
      showToast('Las observaciones son obligatorias', 'error');
      return;
    }

    if (!formData.presId) {
      showToast('No se pudo identificar la prescripción', 'error');
      return;
    }

    if (!hasChanges) {
      showToast('No hay cambios para guardar', 'info');
      return;
    }

    setSubmitting(true);
    try {
      await updatePrescription(formData.presId, {
        observaciones: formData.observaciones,
        cumplimiento: formData.cumplimiento === 'true'
      });

      showToast('Prescripción actualizada exitosamente', 'success');
      closeModal('editPres');
    } catch (error) {
      showToast(error?.message || 'Error al actualizar la prescripción', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getCumplimientoLabel = (value) => (value === 'true' ? 'Cumplido' : 'No cumplido');
  const getCumplimientoIcon = (value) => (value === 'true' ? '✅' : '⏳');
  const isMedicacion = currentEditPres.tipo === 'Medicacion';

  return (
    <Modal
      open={open}
      onClose={() => closeModal('editPres')}
      title="Editar Prescripción"
      size="md"
    >
      <div className={styles.container}>
        {/* Encabezado */}
        <div className={styles.headerSection}>
          <div className={styles.typeIcon}>
            {isMedicacion ? '💊' : '📝'}
          </div>
          <div className={styles.headerInfo}>
            <h3 className={styles.presTitle}>
              {isMedicacion ? 'Medicación' : currentEditPres.tipo || 'Prescripción'}
            </h3>
            <div className={styles.headerMeta}>
              <span className={styles.metaItem}>
                <strong>ID:</strong> {currentEditPres.id_prescripcion ?? currentEditPres.id}
              </span>
              <span className={styles.metaItem}>
                <strong>Tipo:</strong> {currentEditPres.tipo || 'General'}
              </span>
            </div>
          </div>
        </div>

        {/* Información de sólo lectura */}
        <div className={styles.readOnlySection}>
          <div className={styles.readOnlyItem}>
            <label className={styles.readOnlyLabel}>Descripción</label>
            <div className={styles.readOnlyValue}>
              {currentEditPres.descripcion || 'Sin descripción'}
            </div>
          </div>
          
          <div className={styles.readOnlyGrid}>
            {currentEditPres.frecuencia && (
              <div className={styles.readOnlyItem}>
                <label className={styles.readOnlyLabel}>Frecuencia</label>
                <div className={styles.readOnlyValue}>{currentEditPres.frecuencia}</div>
              </div>
            )}
            
            {currentEditPres.duracion && (
              <div className={styles.readOnlyItem}>
                <label className={styles.readOnlyLabel}>Duración</label>
                <div className={styles.readOnlyValue}>{currentEditPres.duracion}</div>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Estado de cumplimiento */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📊</span>
              Estado de Cumplimiento
            </h4>
            
            <div className={styles.radioContainer}>
              <div className={styles.radioOptions}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="cumplimiento"
                    value="true"
                    checked={formData.cumplimiento === 'true'}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioCustom}></span>
                  <span className={styles.radioText}>
                    <span className={styles.radioIcon}>✅</span>
                    Cumplido
                  </span>
                </label>
                
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="cumplimiento"
                    value="false"
                    checked={formData.cumplimiento === 'false'}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioCustom}></span>
                  <span className={styles.radioText}>
                    <span className={styles.radioIcon}>⏳</span>
                    No cumplido
                  </span>
                </label>
              </div>
              
              <div className={styles.statusPreview}>
                <div className={styles.previewLabel}>Vista previa:</div>
                <div className={`${styles.previewBadge} ${formData.cumplimiento === 'true' ? styles.completed : styles.pending}`}>
                  {getCumplimientoIcon(formData.cumplimiento)} {getCumplimientoLabel(formData.cumplimiento)}
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📝</span>
              Observaciones *
            </h4>
            
            <div className={styles.formGroup}>
              <label htmlFor="observaciones" className={styles.label}>
                Notas y observaciones sobre el cumplimiento
              </label>
              <textarea
                id="observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                className={styles.textarea}
                rows={4}
                required
                disabled={submitting}
                placeholder="Ingrese las observaciones sobre el cumplimiento de esta prescripción..."
              />
              <div className={styles.textareaInfo}>
                <span className={styles.charCount}>
                  {formData.observaciones.length} caracteres
                </span>
              </div>
            </div>
          </div>

          {/* Vista previa del estado */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>👁️</span>
              Vista Previa
            </h4>
            
            <div className={styles.previewCard}>
              <div className={styles.previewHeader}>
                <span className={styles.previewType}>
                  {isMedicacion ? '💊 Medicación' : '📝 Prescripción'}
                </span>
                <span className={`${styles.previewStatus} ${formData.cumplimiento === 'true' ? styles.completed : styles.pending}`}>
                  {getCumplimientoIcon(formData.cumplimiento)} {getCumplimientoLabel(formData.cumplimiento)}
                </span>
              </div>
              
              {formData.observaciones && (
                <div className={styles.previewContent}>
                  <div className={styles.previewLabel}>Observaciones:</div>
                  <div className={styles.previewText}>{formData.observaciones}</div>
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => closeModal('editPres')}
              className={styles.cancelButton}
              disabled={submitting}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting || !hasChanges}
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
        </form>
      </div>
    </Modal>
  );
}