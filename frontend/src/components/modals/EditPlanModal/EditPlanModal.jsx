// EditPlanModal.jsx
import React, { useState, useEffect } from 'react';
import { useModal } from '../../../hooks/useModal';
import { usePlans } from '../../../hooks/usePlans';
import { useToast } from '../../../hooks/useToast';
import Modal from '../Modal/Modal';
import styles from './EditPlanModal.module.css';

export default function EditPlanModal() {
  const { modals, closeModal, modalData } = useModal();
  const { updatePlan } = usePlans();
  const { showToast } = useToast();

  const open = !!modals.editPlan;
  const planData = modalData?.editPlan?.currentEditPlan;

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    estado: true,
    resumen_egreso: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changes, setChanges] = useState([]);

  // Inicializar formData cuando se cargan los datos del plan
  useEffect(() => {
    if (open && planData) {
      let fechaInicioFormatted = '';
      if (planData.fecha_inicio) {
        try {
          const date = new Date(planData.fecha_inicio);
          fechaInicioFormatted = date.toISOString().split('T')[0];
        } catch  {
          fechaInicioFormatted = '';
        }
      }

      const initialData = {
        titulo: planData.titulo || '',
        descripcion: planData.descripcion || '',
        fecha_inicio: fechaInicioFormatted,
        estado: planData.estado !== undefined ? Boolean(planData.estado) : true,
        resumen_egreso: planData.resumen_egreso || ''
      };

      setFormData(initialData);
      setChanges([]);
      setErrors({});
    }
  }, [open, planData]);

  // Detectar cambios en tiempo real
  useEffect(() => {
    if (!planData) return;

    const detectedChanges = [];
    
    if (formData.titulo !== (planData.titulo || '')) {
      detectedChanges.push({
        field: 'titulo',
        old: planData.titulo || '',
        new: formData.titulo
      });
    }
    
    if (formData.descripcion !== (planData.descripcion || '')) {
      detectedChanges.push({
        field: 'descripcion',
        old: planData.descripcion || '',
        new: formData.descripcion
      });
    }
    
    const originalDate = planData.fecha_inicio ? 
      new Date(planData.fecha_inicio).toISOString().split('T')[0] : '';
    if (formData.fecha_inicio !== originalDate) {
      detectedChanges.push({
        field: 'fecha_inicio',
        old: planData.fecha_inicio ? new Date(planData.fecha_inicio).toLocaleDateString('es-ES') : '',
        new: formData.fecha_inicio ? new Date(formData.fecha_inicio).toLocaleDateString('es-ES') : ''
      });
    }
    
    const originalEstado = Boolean(planData.estado);
    if (formData.estado !== originalEstado) {
      detectedChanges.push({
        field: 'estado',
        old: originalEstado ? 'Activo' : 'Inactivo',
        new: formData.estado ? 'Activo' : 'Inactivo'
      });
    }
    
    if (formData.resumen_egreso !== (planData.resumen_egreso || '')) {
      detectedChanges.push({
        field: 'resumen_egreso',
        old: planData.resumen_egreso || '',
        new: formData.resumen_egreso
      });
    }

    setChanges(detectedChanges);
  }, [formData, planData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    } else if (formData.titulo.length < 3) {
      newErrors.titulo = 'El título debe tener al menos 3 caracteres';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    } else if (formData.descripcion.length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }

    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    } else {
      const fechaInicio = new Date(formData.fecha_inicio);
      fechaInicio.setHours(0, 0, 0, 0);
      
      if (fechaInicio < today) {
        newErrors.fecha_inicio = 'La fecha de inicio no puede ser anterior a hoy';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (changes.length === 0) {
      showToast('No hay cambios para guardar', 'info');
      return;
    }

    setIsSubmitting(true);

    try {
      await updatePlan(planData.id_plan, formData);
      showToast('Plan actualizado exitosamente', 'success');
      setTimeout(() => {
        closeModal('editPlan');
      }, 1000);
      
    } catch (error) {
      if (error.message && error.message.includes('fecha de inicio')) {
        setErrors(prev => ({ ...prev, fecha_inicio: 'La fecha de inicio no puede ser anterior a hoy' }));
        showToast('La fecha de inicio no puede ser anterior a hoy', 'error');
      } else if (error.message && error.message.includes('no encontrado')) {
        showToast('El plan no existe o ha sido eliminado', 'error');
      } else {
        showToast(error.message || 'Error al actualizar el plan', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!planData) {
    return (
      <Modal
        open={open}
        onClose={() => closeModal('editPlan')}
        title="Editar Plan de Tratamiento"
        size="lg"
      >
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h3>No hay datos del plan</h3>
            <p>No se pudo cargar la información del plan seleccionado.</p>
            <button
              type="button"
              onClick={() => closeModal('editPlan')}
              className={styles.closeButton}
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const isFormValid = Object.keys(errors).length === 0 && changes.length > 0;

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES');
    } catch {
      return dateString;
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => closeModal('editPlan')}
      title="Editar Plan de Tratamiento"
      size="lg"
    >
      <div className={styles.container}>
        {/* Encabezado del Plan */}
        <div className={styles.headerSection}>
          <div className={styles.planIcon}>✏️</div>
          <div className={styles.headerContent}>
            <h3 className={styles.planTitle}>Editar Plan</h3>
            <div className={styles.headerMeta}>
              <span className={styles.metaItem}>
                <strong>ID:</strong> {planData.id_plan}
              </span>
              <span className={styles.metaItem}>
                <strong>Paciente:</strong> {planData.paciente_ci || `ID ${planData.id_paciente}`}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Información Básica */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📋</span>
              Información del Plan
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
                  onChange={handleChange}
                  className={`${styles.input} ${errors.titulo ? styles.error : ''}`}
                  placeholder="Ingrese el título del plan"
                  disabled={isSubmitting}
                />
                {errors.titulo && (
                  <div className={styles.errorMessage}>{errors.titulo}</div>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="fecha_inicio" className={styles.label}>
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  id="fecha_inicio"
                  name="fecha_inicio"
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                  min={today}
                  className={`${styles.input} ${errors.fecha_inicio ? styles.error : ''}`}
                  disabled={isSubmitting}
                />
                {errors.fecha_inicio ? (
                  <div className={styles.errorMessage}>{errors.fecha_inicio}</div>
                ) : (
                  <div className={styles.inputInfo}>
                    {formData.fecha_inicio 
                      ? formatDateForDisplay(formData.fecha_inicio)
                      : 'Seleccione una fecha'
                    }
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Estado del Plan */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📊</span>
              Estado del Plan
            </h4>
            
            <div className={styles.statusContainer}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  id="estado"
                  name="estado"
                  checked={formData.estado}
                  onChange={handleChange}
                  className={styles.checkbox}
                  disabled={isSubmitting}
                />
                <span className={styles.checkboxCustom}></span>
                <span className={styles.checkboxText}>Plan activo</span>
              </label>
              <div className={styles.checkboxHelp}>
                Un plan activo estará visible para el paciente y el equipo médico.
                Los planes inactivos se archivan pero conservan su historial.
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📝</span>
              Descripción *
            </h4>
            
            <div className={styles.formGroup}>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="5"
                className={`${styles.textarea} ${errors.descripcion ? styles.error : ''}`}
                placeholder="Describa detalladamente el plan de tratamiento..."
                disabled={isSubmitting}
              />
              {errors.descripcion && (
                <div className={styles.errorMessage}>{errors.descripcion}</div>
              )}
              <div className={styles.textareaInfo}>
                <span className={styles.charCount}>
                  {formData.descripcion.length} caracteres
                  {formData.descripcion.length < 10 && ' (mínimo 10)'}
                </span>
              </div>
            </div>
          </div>

          {/* Resumen de Egreso */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>✅</span>
              Resumen de Egreso (Opcional)
            </h4>
            
            <div className={styles.formGroup}>
              <textarea
                id="resumen_egreso"
                name="resumen_egreso"
                value={formData.resumen_egreso}
                onChange={handleChange}
                rows="3"
                className={styles.textarea}
                placeholder="Resumen final del tratamiento, logros y recomendaciones..."
                disabled={isSubmitting}
              />
              <div className={styles.textareaInfo}>
                <span className={styles.charCount}>
                  {formData.resumen_egreso.length} caracteres
                </span>
              </div>
            </div>
          </div>

          {/* Cambios Detectados */}
          {changes.length > 0 && (
            <div className={styles.formSection}>
              <h4 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>🔄</span>
                Cambios a Realizar ({changes.length})
              </h4>
              
              <div className={styles.changesList}>
                {changes.map((change, index) => (
                  <div key={index} className={styles.changeItem}>
                    <span className={styles.changeLabel}>
                      {change.field === 'titulo' && 'Título'}
                      {change.field === 'descripcion' && 'Descripción'}
                      {change.field === 'fecha_inicio' && 'Fecha de Inicio'}
                      {change.field === 'estado' && 'Estado'}
                      {change.field === 'resumen_egreso' && 'Resumen de Egreso'}
                    </span>
                    <div className={styles.changeContent}>
                      <span className={styles.changeOld} title={change.old}>
                        {change.old || '(vacío)'}
                      </span>
                      <span className={styles.changeArrow}>→</span>
                      <span className={styles.changeNew} title={change.new}>
                        {change.new || '(vacío)'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Información del Sistema */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⚙️</span>
              Información del Sistema
            </h4>
            
            <div className={styles.systemInfo}>
              <div className={styles.systemItem}>
                <span className={styles.systemLabel}>ID del Plan:</span>
                <span className={styles.systemValue}>{planData.id_plan}</span>
              </div>
              
              {planData.id_medico && (
                <div className={styles.systemItem}>
                  <span className={styles.systemLabel}>ID Médico:</span>
                  <span className={styles.systemValue}>{planData.id_medico}</span>
                </div>
              )}
              
              {planData.medico_ci && (
                <div className={styles.systemItem}>
                  <span className={styles.systemLabel}>CI Médico:</span>
                  <span className={styles.systemValue}>{planData.medico_ci}</span>
                </div>
              )}
              
              {planData.id_paciente && (
                <div className={styles.systemItem}>
                  <span className={styles.systemLabel}>ID Paciente:</span>
                  <span className={styles.systemValue}>{planData.id_paciente}</span>
                </div>
              )}
              
              {planData.paciente_ci && (
                <div className={styles.systemItem}>
                  <span className={styles.systemLabel}>CI Paciente:</span>
                  <span className={styles.systemValue}>{planData.paciente_ci}</span>
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => closeModal('editPlan')}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? (
                <>
                  <span className={styles.spinner}></span>
                  Guardando...
                </>
              ) : (
                `Guardar Cambios ${changes.length > 0 ? `(${changes.length})` : ''}`
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}