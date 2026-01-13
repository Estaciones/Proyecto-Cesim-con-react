import React, { useState, useEffect } from 'react';
import { useModal } from '../../../hooks/useModal';
import { usePlans } from '../../../hooks/usePlans';
import Button from '../../ui/Button/Button';
import styles from './EditPlanModal.module.css'; // Ahora usará estilos similares a ViewPlanModal

export default function EditPlanModal() {
  const { closeModal, getModalData } = useModal();
  const { updatePlan } = usePlans();
  
  const modalData = getModalData('editPlan');
  const planData = modalData?.currentEditPlan;

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    estado: true,
    resumen_egreso: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [changes, setChanges] = useState([]);

  // Inicializar formData cuando se cargan los datos del plan
  useEffect(() => {
    if (planData) {
      console.log('✏️ EditPlanModal - Inicializando con plan:', planData);
      
      // Formatear la fecha para el input type="date"
      let fechaInicioFormatted = '';
      if (planData.fecha_inicio) {
        try {
          const date = new Date(planData.fecha_inicio);
          fechaInicioFormatted = date.toISOString().split('T')[0];
        } catch (error) {
          console.error('Error formateando fecha:', error);
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
      setSubmitError('');
    }
  }, [planData]);

  // Detectar cambios en tiempo real
  useEffect(() => {
    if (!planData) return;

    const detectedChanges = [];
    
    // Comparar título
    if (formData.titulo !== (planData.titulo || '')) {
      detectedChanges.push({
        field: 'titulo',
        old: planData.titulo || '',
        new: formData.titulo
      });
    }
    
    // Comparar descripción
    if (formData.descripcion !== (planData.descripcion || '')) {
      detectedChanges.push({
        field: 'descripcion',
        old: planData.descripcion || '',
        new: formData.descripcion
      });
    }
    
    // Comparar fecha de inicio
    const originalDate = planData.fecha_inicio ? 
      new Date(planData.fecha_inicio).toISOString().split('T')[0] : '';
    if (formData.fecha_inicio !== originalDate) {
      detectedChanges.push({
        field: 'fecha_inicio',
        old: planData.fecha_inicio ? new Date(planData.fecha_inicio).toLocaleDateString('es-ES') : '',
        new: formData.fecha_inicio ? new Date(formData.fecha_inicio).toLocaleDateString('es-ES') : ''
      });
    }
    
    // Comparar estado
    const originalEstado = Boolean(planData.estado);
    if (formData.estado !== originalEstado) {
      detectedChanges.push({
        field: 'estado',
        old: originalEstado ? 'Activo' : 'Inactivo',
        new: formData.estado ? 'Activo' : 'Inactivo'
      });
    }
    
    // Comparar resumen de egreso
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
    
    if (submitError) {
      setSubmitError('');
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
    console.log('🔄 EditPlanModal - Enviando formulario...');
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log('❌ EditPlanModal - Errores de validación:', validationErrors);
      return;
    }

    if (changes.length === 0) {
      setSubmitError('No hay cambios para guardar');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      console.log('📤 EditPlanModal - Datos a enviar:', {
        planId: planData.id_plan,
        data: formData
      });

      await updatePlan(planData.id_plan, formData);
      console.log('✅ EditPlanModal - Plan actualizado exitosamente');
      
      setTimeout(() => {
        closeModal('editPlan');
      }, 1000);
      
    } catch (error) {
      console.error('❌ EditPlanModal - Error al actualizar:', error);
      
      if (error.message && error.message.includes('fecha de inicio')) {
        setSubmitError('La fecha de inicio no puede ser anterior a hoy');
        setErrors(prev => ({ ...prev, fecha_inicio: 'La fecha de inicio no puede ser anterior a hoy' }));
      } else if (error.message && error.message.includes('no encontrado')) {
        setSubmitError('El plan no existe o ha sido eliminado');
      } else {
        setSubmitError(error.message || 'Error al actualizar el plan. Intente nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!planData) {
    console.log('❌ EditPlanModal - No hay datos del plan');
    return null;
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
    <div className={styles.modalOverlay} onClick={() => closeModal('editPlan')}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.modalTitle}>
              <span className={styles.titleIcon}>✏️</span>
              Editar Plan de Tratamiento
            </h2>
            <div className={styles.headerInfo}>
              <span className={styles.planId}>ID: {planData.id_plan}</span>
              <span className={styles.patientInfo}>
                Paciente: {planData.paciente_ci || `ID ${planData.id_paciente}`}
              </span>
            </div>
          </div>
          <button 
            className={styles.closeButton} 
            onClick={() => closeModal('editPlan')}
            aria-label="Cerrar modal"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Mostrar errores del servidor */}
            {submitError && (
              <div className={styles.errorSection}>
                <span className={styles.errorIcon}>⚠️</span>
                <span className={styles.errorText}>{submitError}</span>
              </div>
            )}

            {/* Información Básica */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>📄</span>
                Información del Plan
              </h3>
              
              <div className={styles.infoGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="titulo" className={styles.formLabel}>
                    Título *
                  </label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    className={`${styles.formInput} ${errors.titulo ? styles.inputError : ''}`}
                    placeholder="Ingrese el título del plan"
                    disabled={isSubmitting}
                  />
                  {errors.titulo && (
                    <span className={styles.errorMessage}>{errors.titulo}</span>
                  )}
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="fecha_inicio" className={styles.formLabel}>
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    id="fecha_inicio"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                    min={today}
                    className={`${styles.formInput} ${errors.fecha_inicio ? styles.inputError : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.fecha_inicio ? (
                    <span className={styles.errorMessage}>{errors.fecha_inicio}</span>
                  ) : (
                    <div className={styles.formHelp}>
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
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>📊</span>
                Estado del Plan
              </h3>
              
              <div className={styles.statusSection}>
                <div className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    id="estado"
                    name="estado"
                    checked={formData.estado}
                    onChange={handleChange}
                    className={styles.checkbox}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="estado" className={styles.checkboxLabel}>
                    <span className={styles.checkboxCustom}></span>
                    Plan activo
                  </label>
                  <div className={styles.checkboxHelp}>
                    Un plan activo estará visible para el paciente y el equipo médico.
                    Los planes inactivos se archivan pero conservan su historial.
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>📝</span>
                Descripción *
              </h3>
              
              <div className={styles.formGroup}>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="5"
                  className={`${styles.formTextarea} ${errors.descripcion ? styles.textareaError : ''}`}
                  placeholder="Describa detalladamente el plan de tratamiento, objetivos y recomendaciones..."
                  disabled={isSubmitting}
                />
                {errors.descripcion && (
                  <span className={styles.errorMessage}>{errors.descripcion}</span>
                )}
                <div className={styles.charCount}>
                  {formData.descripcion.length} caracteres
                  {formData.descripcion.length < 10 && ' (mínimo 10)'}
                </div>
              </div>
            </div>

            {/* Resumen de Egreso */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>✅</span>
                Resumen de Egreso (Opcional)
              </h3>
              
              <div className={styles.formGroup}>
                <textarea
                  id="resumen_egreso"
                  name="resumen_egreso"
                  value={formData.resumen_egreso}
                  onChange={handleChange}
                  rows="3"
                  className={styles.formTextarea}
                  placeholder="Resumen final del tratamiento, logros y recomendaciones posteriores..."
                  disabled={isSubmitting}
                />
                <div className={styles.charCount}>
                  {formData.resumen_egreso.length} caracteres
                </div>
              </div>
            </div>

            {/* Cambios Detectados */}
            {changes.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>🔄</span>
                  Cambios a Realizar ({changes.length})
                </h3>
                
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
                      <span className={styles.changeOld} title={change.old}>
                        {change.old || '(vacío)'}
                      </span>
                      <span className={styles.changeArrow}>→</span>
                      <span className={styles.changeNew} title={change.new}>
                        {change.new || '(vacío)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Información del Sistema (solo lectura) */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>⚙️</span>
                Información del Sistema (Solo lectura)
              </h3>
              
              <div className={styles.systemInfo}>
                <div className={styles.systemInfoItem}>
                  <span className={styles.systemInfoLabel}>ID del Plan:</span>
                  <span className={styles.systemInfoValue}>{planData.id_plan}</span>
                </div>
                
                <div className={styles.systemInfoItem}>
                  <span className={styles.systemInfoLabel}>ID del Médico:</span>
                  <span className={styles.systemInfoValue}>{planData.id_medico}</span>
                </div>
                
                <div className={styles.systemInfoItem}>
                  <span className={styles.systemInfoLabel}>CI del Médico:</span>
                  <span className={styles.systemInfoValue}>{planData.medico_ci}</span>
                </div>
                
                <div className={styles.systemInfoItem}>
                  <span className={styles.systemInfoLabel}>ID del Paciente:</span>
                  <span className={styles.systemInfoValue}>{planData.id_paciente}</span>
                </div>
                
                <div className={styles.systemInfoItem}>
                  <span className={styles.systemInfoLabel}>CI del Paciente:</span>
                  <span className={styles.systemInfoValue}>{planData.paciente_ci}</span>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className={styles.actionButtons}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => closeModal('editPlan')}
                disabled={isSubmitting}
                className={styles.cancelButton}
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !isFormValid}
                className={styles.submitButton}
              >
                {isSubmitting ? (
                  <>
                    <span className={styles.spinner}></span>
                    Guardando...
                  </>
                ) : (
                  `Guardar Cambios ${changes.length > 0 ? `(${changes.length})` : ''}`
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}