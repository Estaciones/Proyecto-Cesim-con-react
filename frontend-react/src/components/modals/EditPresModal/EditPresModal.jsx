import React, { useContext, useEffect, useState } from 'react';
import Modal from '../Modal/Modal';
import { DashboardContext } from '../../../context/DashboardContext';
import styles from './EditPresModal.module.css';

export default function EditPresModal() {
  const { 
    modals, 
    closeModal, 
    currentEditPres, 
    updatePrescripcion,
    showToast 
  } = useContext(DashboardContext);
  
  const open = modals.editPres;

  const [formData, setFormData] = useState({
    presId: '',
    descripcion: '',
    observaciones: '',
    cumplimiento: 'false',
    frecuencia: '',
    duracion: ''
  });
  
  const [submitting, setSubmitting] = useState(false);

  // Actualizar formulario cuando cambia currentEditPres
  useEffect(() => {
    if (open && currentEditPres) {
      setFormData({
        presId: currentEditPres.id_prescripcion || currentEditPres.id || '',
        descripcion: currentEditPres.descripcion || '',
        observaciones: currentEditPres.observaciones || '',
        cumplimiento: currentEditPres.cumplimiento ? 'true' : 'false',
        frecuencia: currentEditPres.frecuencia || '',
        duracion: currentEditPres.duracion || ''
      });
    } else {
      setFormData({
        presId: '',
        descripcion: '',
        observaciones: '',
        cumplimiento: 'false',
        frecuencia: '',
        duracion: ''
      });
    }
  }, [open, currentEditPres]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.descripcion.trim()) {
      showToast('La descripción es obligatoria', 'error');
      return;
    }

    if (!formData.presId) {
      showToast('No se pudo identificar la prescripción', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await updatePrescripcion({
        presId: formData.presId,
        descripcion: formData.descripcion,
        observaciones: formData.observaciones,
        cumplimiento: formData.cumplimiento === 'true',
        frecuencia: formData.frecuencia,
        duracion: formData.duracion
      });
      // El contexto ya maneja el cierre y toast de éxito
    } catch (error) {
      console.error('Error actualizando prescripción:', error);
      // El contexto ya maneja el error
    } finally {
      setSubmitting(false);
    }
  };

  const getPrescripcionInfo = () => {
    if (!currentEditPres) return null;
    
    const tipo = currentEditPres.tipo || 'No especificado';
    const fechaCreacion = currentEditPres.fecha_creacion 
      ? new Date(currentEditPres.fecha_creacion).toLocaleDateString() 
      : 'No disponible';
    
    return { tipo, fechaCreacion };
  };

  const presInfo = getPrescripcionInfo();

  return (
    <Modal
      open={open}
      onClose={() => closeModal('editPres')}
      title="Editar Prescripción"
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {presInfo && (
          <div className={styles.presInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Tipo:</span>
              <span className={styles.infoValue}>{presInfo.tipo}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Creada:</span>
              <span className={styles.infoValue}>{presInfo.fechaCreacion}</span>
            </div>
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="descripcion" className={styles.label}>
            Descripción *
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            placeholder="Descripción de la prescripción..."
            className={styles.textarea}
            rows={4}
            required
            disabled={submitting}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="frecuencia" className={styles.label}>
            Frecuencia
          </label>
          <input
            type="text"
            id="frecuencia"
            name="frecuencia"
            value={formData.frecuencia}
            onChange={handleInputChange}
            placeholder="Ej: 3 veces al día, cada 8 horas"
            className={styles.input}
            disabled={submitting}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="duracion" className={styles.label}>
            Duración
          </label>
          <input
            type="text"
            id="duracion"
            name="duracion"
            value={formData.duracion}
            onChange={handleInputChange}
            placeholder="Ej: 7 días, 2 semanas"
            className={styles.input}
            disabled={submitting}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="observaciones" className={styles.label}>
            Observaciones
          </label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleInputChange}
            placeholder="Observaciones adicionales..."
            className={styles.textarea}
            rows={3}
            disabled={submitting}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="cumplimiento" className={styles.label}>
            Estado de Cumplimiento *
          </label>
          <div className={styles.radioGroup}>
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
              <span className={styles.radioText}>Cumplido</span>
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
              <span className={styles.radioText}>No cumplido</span>
            </label>
          </div>
        </div>

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
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className={styles.spinner}></span>
                Guardando...
              </>
            ) : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
}