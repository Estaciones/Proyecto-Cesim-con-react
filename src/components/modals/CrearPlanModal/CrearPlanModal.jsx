// CrearPlanModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useModal } from '../../../hooks/useModal';
import { usePlans } from '../../../hooks/usePlans';
import { useAuthContext } from '../../../context/AuthContext';
import { usePatients } from '../../../hooks/usePatients';
import { useToast } from '../../../hooks/useToast';
import Modal from '../Modal/Modal';
import styles from './CrearPlanModal.module.css';

export default function CrearPlanModal() {
  const { modals, closeModal, modalData } = useModal();
  const { createPlan } = usePlans();
  const { profile } = useAuthContext();
  const { patients, fetchPatients } = usePatients();
  const { showToast } = useToast();
  
  const open = !!modals.crearPlan;
  const currentPatientId = modalData?.crearPlan?.currentCrearPlanPacienteId;

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    id_paciente: '',
    id_medico: '',
    prescripciones: []
  });

  const [prescripcionForm, setPrescripcionForm] = useState({
    tipo: '',
    descripcion: '',
    frecuencia: '',
    duracion: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(false);

  const resetForm = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    let initialPatientId = '';
    
    if (currentPatientId) {
      initialPatientId = String(currentPatientId);
    } else if (profile?.id_paciente) {
      initialPatientId = String(profile.id_paciente);
    }

    const idMedico = profile?.id_usuario || profile?.id_medico || '';

    setFormData({
      titulo: '',
      descripcion: '',
      fecha_inicio: today,
      id_paciente: initialPatientId,
      id_medico: idMedico,
      prescripciones: []
    });

    setPrescripcionForm({
      tipo: '',
      descripcion: '',
      frecuencia: '',
      duracion: ''
    });

    setErrors({});
  }, [currentPatientId, profile]);

  useEffect(() => {
    if (!open) return;

    resetForm();
    
    if (!profile?.id_paciente && patients.length === 0) {
      setPatientsLoading(true);
      fetchPatients()
        .catch(() => showToast('Error al cargar pacientes', 'error'))
        .finally(() => setPatientsLoading(false));
    }
  }, [open, patients.length, profile?.id_paciente, resetForm, fetchPatients, showToast]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePrescripcionChange = (e) => {
    const { name, value } = e.target;
    setPrescripcionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addPrescripcion = () => {
    if (!prescripcionForm.descripcion.trim() || !prescripcionForm.tipo.trim()) {
      showToast('Completa al menos el tipo y descripción de la prescripción', 'warning');
      return;
    }

    const newPrescripcion = {
      ...prescripcionForm,
      id: Date.now()
    };

    setFormData(prev => ({
      ...prev,
      prescripciones: [...prev.prescripciones, newPrescripcion]
    }));

    setPrescripcionForm({
      tipo: '',
      descripcion: '',
      frecuencia: '',
      duracion: ''
    });
  };

  const removePrescripcion = (index) => {
    setFormData(prev => ({
      ...prev,
      prescripciones: prev.prescripciones.filter((_, i) => i !== index)
    }));
  };

  const handleClear = () => {
    resetForm();
    showToast('Formulario limpiado', 'info');
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

    if (!formData.id_paciente && !profile?.id_paciente) {
      newErrors.id_paciente = 'Selecciona un paciente';
    }

    if (!formData.id_medico) {
      newErrors.id_medico = 'No se pudo identificar al médico responsable';
    }

    if (formData.prescripciones.length === 0) {
      newErrors.prescripciones = 'Debe agregar al menos una prescripción';
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

    setIsSubmitting(true);

    try {
      const planData = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        fecha_inicio: formData.fecha_inicio,
        id_paciente: parseInt(formData.id_paciente || profile?.id_paciente),
        id_medico: parseInt(formData.id_medico || profile?.id_usuario || profile?.id_medico),
        prescripciones: formData.prescripciones.map(p => ({
          tipo: p.tipo.trim(),
          descripcion: p.descripcion.trim(),
          frecuencia: p.frecuencia?.trim() || '',
          duracion: p.duracion?.trim() || ''
        }))
      };

      await createPlan(planData);
      showToast('Plan creado exitosamente', 'success');
      
      setTimeout(() => {
        closeModal('crearPlan');
      }, 1500);
      
    } catch (error) {
      if (error.message && error.message.includes('fecha de inicio')) {
        showToast('La fecha de inicio no puede ser anterior a hoy', 'error');
        setErrors(prev => ({ ...prev, fecha_inicio: 'La fecha de inicio no puede ser anterior a hoy' }));
      } else if (error.message && error.message.includes('no encontrado')) {
        showToast('Paciente no encontrado', 'error');
      } else if (error.message && error.message.includes('Faltan datos requeridos')) {
        showToast('Faltan datos requeridos. Asegúrate de completar todos los campos.', 'error');
      } else {
        showToast(error.message || 'Error al crear el plan', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const availablePatients = Array.isArray(patients) ? patients : [];
  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal
      open={open}
      onClose={() => closeModal('crearPlan')}
      title="Crear Plan de Tratamiento"
      size="lg"
    >
      <div className={styles.container}>
        {/* Encabezado */}
        <div className={styles.headerSection}>
          <div className={styles.headerIcon}>📋</div>
          <div className={styles.headerInfo}>
            <h3>Nuevo Plan de Tratamiento</h3>
            <div className={styles.headerMeta}>
              {profile?.nombre && (
                <span className={styles.metaItem}>
                  <strong>Médico:</strong> {profile.nombre}
                </span>
              )}
              <span className={styles.metaItem}>
                <strong>Fecha:</strong> {new Date().toLocaleDateString('es-ES')}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Campo oculto para id_medico */}
          <input type="hidden" name="id_medico" value={formData.id_medico} />

          {/* Información Básica */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📝</span>
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
                  onChange={handleFormChange}
                  className={`${styles.input} ${errors.titulo ? styles.error : ''}`}
                  placeholder="Ej: Plan de rehabilitación post-operatoria"
                  disabled={isSubmitting}
                />
                {errors.titulo && (
                  <div className={styles.errorMessage}>{errors.titulo}</div>
                )}
                <div className={styles.inputInfo}>
                  {formData.titulo.length > 0 && (
                    <span>{formData.titulo.length} caracteres (mínimo 3)</span>
                  )}
                </div>
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
                  onChange={handleFormChange}
                  min={today}
                  className={`${styles.input} ${errors.fecha_inicio ? styles.error : ''}`}
                  disabled={isSubmitting}
                />
                {errors.fecha_inicio && (
                  <div className={styles.errorMessage}>{errors.fecha_inicio}</div>
                )}
              </div>
            </div>

            {/* Selección de paciente */}
            {!profile?.id_paciente && (
              <div className={styles.formGroup}>
                <label htmlFor="id_paciente" className={styles.label}>
                  Paciente *
                </label>
                {currentPatientId ? (
                  <div className={styles.selectedPatientContainer}>
                    <div className={styles.selectedPatient}>
                      {availablePatients.find(p => p.id_paciente == currentPatientId)?.nombre || 
                       `Paciente ID: ${currentPatientId}`}
                    </div>
                    <span className={styles.preselectBadge}>Preseleccionado</span>
                  </div>
                ) : (
                  <>
                    {patientsLoading ? (
                      <div className={styles.loadingPatients}>
                        <span className={styles.spinner}></span>
                        Cargando lista de pacientes...
                      </div>
                    ) : (
                      <select
                        id="id_paciente"
                        name="id_paciente"
                        value={formData.id_paciente}
                        onChange={handleFormChange}
                        className={`${styles.select} ${errors.id_paciente ? styles.error : ''}`}
                        disabled={isSubmitting || patientsLoading}
                      >
                        <option value="">Selecciona un paciente</option>
                        {availablePatients.map(patient => (
                          <option key={patient.id_paciente} value={patient.id_paciente}>
                            {patient.nombre} {patient.apellido} - CI: {patient.ci}
                          </option>
                        ))}
                      </select>
                    )}
                  </>
                )}
                {errors.id_paciente && (
                  <div className={styles.errorMessage}>{errors.id_paciente}</div>
                )}
              </div>
            )}

            {/* Descripción */}
            <div className={styles.formGroup}>
              <label htmlFor="descripcion" className={styles.label}>
                Descripción *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleFormChange}
                rows="4"
                className={`${styles.textarea} ${errors.descripcion ? styles.error : ''}`}
                placeholder="Describe el plan de tratamiento en detalle..."
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

          {/* Prescripciones */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>💊</span>
                Prescripciones
              </h4>
              <span className={styles.prescriptionCount}>
                {formData.prescripciones.length} añadidas
              </span>
            </div>
            
            {errors.prescripciones && (
              <div className={styles.prescriptionError}>
                <span className={styles.errorIcon}>⚠️</span>
                <span>{errors.prescripciones}</span>
              </div>
            )}

            {/* Formulario para agregar prescripción */}
            <div className={styles.prescriptionForm}>
              <div className={styles.prescriptionGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="prescripcion-tipo" className={styles.label}>
                    Tipo *
                  </label>
                  <select
                    id="prescripcion-tipo"
                    name="tipo"
                    value={prescripcionForm.tipo}
                    onChange={handlePrescripcionChange}
                    className={styles.select}
                    disabled={isSubmitting}
                  >
                    <option value="">Selecciona tipo</option>
                    <option value="Tratamiento">Tratamiento</option>
                    <option value="Indicacion">Indicación</option>
                    <option value="Medicacion">Medicación</option>
                    <option value="Ejercicio">Ejercicio</option>
                    <option value="Dieta">Dieta</option>
                    <option value="Terapia">Terapia</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="prescripcion-frecuencia" className={styles.label}>
                    Frecuencia
                  </label>
                  <input
                    type="text"
                    id="prescripcion-frecuencia"
                    name="frecuencia"
                    value={prescripcionForm.frecuencia}
                    onChange={handlePrescripcionChange}
                    placeholder="Ej: 3 veces al día"
                    className={styles.input}
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="prescripcion-duracion" className={styles.label}>
                    Duración
                  </label>
                  <input
                    type="text"
                    id="prescripcion-duracion"
                    name="duracion"
                    value={prescripcionForm.duracion}
                    onChange={handlePrescripcionChange}
                    placeholder="Ej: 7 días"
                    className={styles.input}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="prescripcion-descripcion" className={styles.label}>
                  Descripción *
                </label>
                <textarea
                  id="prescripcion-descripcion"
                  name="descripcion"
                  value={prescripcionForm.descripcion}
                  onChange={handlePrescripcionChange}
                  rows="3"
                  className={styles.textarea}
                  placeholder="Describe la prescripción en detalle..."
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="button"
                onClick={addPrescripcion}
                className={styles.addPrescriptionButton}
                disabled={isSubmitting || !prescripcionForm.descripcion.trim() || !prescripcionForm.tipo}
              >
                <span className={styles.addIcon}>+</span>
                Añadir Prescripción
              </button>
            </div>

            {/* Lista de prescripciones */}
            {formData.prescripciones.length > 0 ? (
              <div className={styles.prescriptionsList}>
                {formData.prescripciones.map((prescripcion, index) => (
                  <div key={prescripcion.id} className={styles.prescriptionCard}>
                    <div className={styles.prescriptionHeader}>
                      <div className={styles.prescriptionInfo}>
                        <span className={styles.prescriptionType}>{prescripcion.tipo}</span>
                        <span className={styles.prescriptionNumber}>#{index + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePrescripcion(index)}
                        className={styles.removeButton}
                        disabled={isSubmitting}
                        aria-label="Eliminar prescripción"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className={styles.prescriptionDescription}>
                      {prescripcion.descripcion}
                    </div>
                    
                    <div className={styles.prescriptionDetails}>
                      {prescripcion.frecuencia && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Frecuencia:</span>
                          <span className={styles.detailValue}>{prescripcion.frecuencia}</span>
                        </div>
                      )}
                      
                      {prescripcion.duracion && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Duración:</span>
                          <span className={styles.detailValue}>{prescripcion.duracion}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>💊</div>
                <p>No hay prescripciones añadidas. Agrega al menos una para continuar.</p>
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className={styles.infoNote}>
            <div className={styles.infoIcon}>ℹ️</div>
            <div className={styles.infoText}>
              <strong>Nota:</strong> Todos los campos marcados con * son obligatorios.
              El plan será asignado automáticamente al médico que está creando el plan.
            </div>
          </div>

          {/* Acciones */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={handleClear}
              className={styles.secondaryButton}
              disabled={isSubmitting}
            >
              Limpiar Todo
            </button>
            
            <div className={styles.primaryActions}>
              <button
                type="button"
                onClick={() => closeModal('crearPlan')}
                className={styles.cancelButton}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting || formData.prescripciones.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <span className={styles.spinner}></span>
                    Creando Plan...
                  </>
                ) : (
                  `Crear Plan (${formData.prescripciones.length} prescripción${formData.prescripciones.length !== 1 ? 'es' : ''})`
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}