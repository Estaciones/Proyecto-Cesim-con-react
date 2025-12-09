import React, { useContext, useEffect, useState } from 'react';
import Modal from '../Modal/Modal';
import { DashboardContext } from '../../../context/DashboardContext';
import styles from './EditPlanModal.module.css';

export default function EditPlanModal() {
  const { 
    modals, 
    closeModal, 
    currentEditPlan, 
    updatePlan,
    showToast 
  } = useContext(DashboardContext);
  
  const open = modals.editPlan;

  const [formData, setFormData] = useState({
    planId: '',
    titulo: '',
    descripcion: '',
    estado: 'activo',
    fecha_fin: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [fechaInicioDisplay, setFechaInicioDisplay] = useState('');

  // Actualizar formulario cuando cambia currentEditPlan o se abre el modal
  useEffect(() => {
    if (open && currentEditPlan) {
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      const formatDateForDisplay = (dateString) => {
        if (!dateString) return 'No disponible';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      };

      setFormData({
        planId: currentEditPlan.id_plan || currentEditPlan.id || '',
        titulo: currentEditPlan.titulo || '',
        descripcion: currentEditPlan.descripcion || '',
        estado: currentEditPlan.estado || 'activo',
        fecha_fin: formatDateForInput(currentEditPlan.fecha_fin)
      });

      setFechaInicioDisplay(formatDateForDisplay(currentEditPlan.fecha_inicio));
    } else {
      setFormData({
        planId: '',
        titulo: '',
        descripcion: '',
        estado: 'activo',
        fecha_fin: ''
      });
      setFechaInicioDisplay('');
    }
  }, [open, currentEditPlan]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.titulo.trim()) {
      showToast('El título es obligatorio', 'error');
      return;
    }

    if (!formData.descripcion.trim()) {
      showToast('La descripción es obligatoria', 'error');
      return;
    }

    if (!formData.planId) {
      showToast('No se pudo identificar el plan', 'error');
      return;
    }

    if (formData.fecha_fin && currentEditPlan?.fecha_inicio) {
      const fechaFin = new Date(formData.fecha_fin);
      const fechaInicio = new Date(currentEditPlan.fecha_inicio);
      
      if (fechaFin < fechaInicio) {
        showToast('La fecha de fin no puede ser anterior a la fecha de inicio', 'error');
        return;
      }
    }

    setSubmitting(true);
    try {
      await updatePlan({
        planId: formData.planId,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        estado: formData.estado,
        fecha_fin: formData.fecha_fin || null
        // No enviamos médico_ci, paciente_ci, ni fecha_inicio ya que no son editables
      });
      // El contexto ya maneja el cierre y toast de éxito
    } catch (error) {
      console.error('Error actualizando plan:', error);
      // El contexto ya maneja el error
    } finally {
      setSubmitting(false);
    }
  };

  const getPlanInfo = () => {
    if (!currentEditPlan) return null;
    
    const fechaActualizacion = currentEditPlan.ultima_actualizacion 
      ? new Date(currentEditPlan.ultima_actualizacion).toLocaleString() 
      : 'No disponible';
    
    return { fechaActualizacion };
  };

  const planInfo = getPlanInfo();

  const getEstadoLabel = (estado) => {
    const estados = {
      'activo': 'Activo',
      'completado': 'Completado',
      'cancelado': 'Cancelado',
      'pendiente': 'Pendiente'
    };
    
    return estados[estado] || estado || 'No especificado';
  };

  return (
    <Modal
      open={open}
      onClose={() => closeModal('editPlan')}
      title="Editar Plan de Tratamiento"
      size="lg"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {planInfo && (
          <div className={styles.planInfo}>
            <div className={styles.infoGrid}>
              {currentEditPlan?.medico_ci && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Médico responsable:</span>
                  <span className={styles.infoValue}>{currentEditPlan.medico_ci}</span>
                </div>
              )}
              
              {currentEditPlan?.paciente_ci && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Paciente:</span>
                  <span className={styles.infoValue}>{currentEditPlan.paciente_ci}</span>
                </div>
              )}
              
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Fecha de inicio:</span>
                <span className={styles.infoValue}>{fechaInicioDisplay}</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Última actualización:</span>
                <span className={styles.infoValue}>{planInfo.fechaActualizacion}</span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="titulo" className={styles.label}>
              Título del Plan *
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              placeholder="Ej: Plan de tratamiento cardiovascular"
              className={styles.input}
              required
              disabled={submitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="estado" className={styles.label}>
              Estado del Plan
            </label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              className={styles.select}
              disabled={submitting}
            >
              <option value="activo">Activo</option>
              <option value="pendiente">Pendiente</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <div className={styles.estadoInfo}>
              Estado actual: <span className={styles.estadoActual}>{getEstadoLabel(formData.estado)}</span>
            </div>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="fecha_fin" className={styles.label}>
              Fecha de fin (opcional)
            </label>
            <input
              type="date"
              id="fecha_fin"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={handleInputChange}
              className={styles.input}
              disabled={submitting}
              min={currentEditPlan?.fecha_inicio ? new Date(currentEditPlan.fecha_inicio).toISOString().split('T')[0] : undefined}
            />
            <div className={styles.dateInfo}>
              {fechaInicioDisplay && (
                <span>Fecha de inicio: {fechaInicioDisplay}</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="descripcion" className={styles.label}>
            Descripción del Plan *
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            placeholder="Describe el plan de tratamiento, incluyendo objetivos, medicamentos, procedimientos, etc."
            className={styles.textarea}
            rows={8}
            required
            disabled={submitting}
          />
          <div className={styles.charCount}>
            <span>{formData.descripcion.length} caracteres</span>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => closeModal('editPlan')}
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