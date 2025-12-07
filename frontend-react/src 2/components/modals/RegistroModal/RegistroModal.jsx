import React, { useState, useContext, useEffect } from 'react';
import Modal from '../Modal/Modal';
import { DashboardContext } from '../../context/DashboardContext';
import styles from './RegistroModal.module.css';

export default function RegistroModal() {
  const { modals, closeModal, createRegistro, profile, showToast } = useContext(DashboardContext);
  const open = modals.registro;

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'general'
  });
  const [submitting, setSubmitting] = useState(false);

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (open) {
      setFormData({
        titulo: '',
        descripcion: '',
        tipo: 'general'
      });
    }
  }, [open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim() || !formData.descripcion.trim()) {
      showToast('Por favor completa todos los campos', 'error');
      return;
    }

    const id_paciente = profile?.id_paciente;
    if (!id_paciente) {
      showToast('No se pudo identificar al paciente', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await createRegistro({
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        id_paciente
      });
      
      // El contexto ya maneja el cierre y muestra toast de éxito
    } catch (error) {
      console.error('Error al crear registro:', error);
      // El contexto ya maneja el error con showToast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => closeModal('registro')}
      title="Nuevo Registro Clínico"
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
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
            placeholder="Ej: Consulta inicial, Evaluación, Seguimiento"
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
            placeholder="Describe el registro clínico en detalle..."
            className={styles.textarea}
            rows={6}
            required
            disabled={submitting}
          />
        </div>

        <div className={styles.formFooter}>
          <div className={styles.patientInfo}>
            {profile?.id_paciente && (
              <span className={styles.patientTag}>
                Paciente: {profile.nombre} {profile.apellido}
              </span>
            )}
          </div>
          
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => closeModal('registro')}
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
              ) : 'Guardar Registro'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}