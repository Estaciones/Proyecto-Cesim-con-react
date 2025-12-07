import React, { useContext, useEffect, useState } from 'react';
import Modal from '../Modal/Modal';
import { DashboardContext } from '../../../context/DashboardContext';
import styles from './EditHistoriaModal.module.css';

export default function EditHistoriaModal() {
  const { 
    modals, 
    closeModal, 
    currentEditHistoria, 
    updateHistoria,
    showToast 
  } = useContext(DashboardContext);
  
  const open = modals.editHistoria;

  const [formData, setFormData] = useState({
    recordId: '',
    titulo: '',
    descripcion: '',
    tipo: 'general'
  });
  
  const [submitting, setSubmitting] = useState(false);

  // Actualizar formulario cuando cambia currentEditHistoria o se abre el modal
  useEffect(() => {
    if (open && currentEditHistoria) {
      setFormData({
        recordId: currentEditHistoria.id_registro || currentEditHistoria.id || '',
        titulo: currentEditHistoria.titulo || '',
        descripcion: currentEditHistoria.descripcion || '',
        tipo: currentEditHistoria.tipo || 'general'
      });
    } else {
      setFormData({
        recordId: '',
        titulo: '',
        descripcion: '',
        tipo: 'general'
      });
    }
  }, [open, currentEditHistoria]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      await updateHistoria({
        recordId: formData.recordId,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tipo: formData.tipo
      });
      // El contexto ya maneja el cierre y toast de éxito
    } catch (error) {
      console.error('Error actualizando historia:', error);
      // El contexto ya maneja el error
    } finally {
      setSubmitting(false);
    }
  };

  const getRecordInfo = () => {
    if (!currentEditHistoria) return null;
    
    const fechaCreacion = currentEditHistoria.fecha_creacion 
      ? new Date(currentEditHistoria.fecha_creacion).toLocaleString() 
      : 'No disponible';
    
    const fechaActualizacion = currentEditHistoria.fecha_actualizacion 
      ? new Date(currentEditHistoria.fecha_actualizacion).toLocaleString() 
      : 'No disponible';
    
    return { fechaCreacion, fechaActualizacion };
  };

  const recordInfo = getRecordInfo();

  return (
    <Modal
      open={open}
      onClose={() => closeModal('editHistoria')}
      title="Editar Registro de Historia Clínica"
      size="lg"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.recordInfo}>
          {recordInfo && (
            <>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Creado:</span>
                <span className={styles.infoValue}>{recordInfo.fechaCreacion}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Última actualización:</span>
                <span className={styles.infoValue}>{recordInfo.fechaActualizacion}</span>
              </div>
            </>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="titulo" className={styles.label}>
            Título del Registro *
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
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tipo" className={styles.label}>
            Tipo de Registro
          </label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleInputChange}
            className={styles.select}
            disabled={submitting}
          >
            <option value="general">General</option>
            <option value="consulta">Consulta</option>
            <option value="evaluacion">Evaluación</option>
            <option value="seguimiento">Seguimiento</option>
            <option value="tratamiento">Tratamiento</option>
            <option value="diagnostico">Diagnóstico</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="descripcion" className={styles.label}>
            Descripción Detallada *
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            placeholder="Descripción detallada del registro..."
            className={styles.textarea}
            rows={8}
            required
            disabled={submitting}
          />
        </div>

        <div className={styles.charCount}>
          <span>{formData.descripcion.length} caracteres</span>
        </div>

        <div className={styles.formActions}>
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
                Guardando cambios...
              </>
            ) : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
}