import React, { useState, useContext, useEffect } from 'react';
import Modal from '../Modal/Modal';
import { DashboardContext } from '../../../context/DashboardContext';
import styles from './CrearPlanModal.module.css';

export default function CrearPlanModal() {
  const { 
    modals, 
    closeModal, 
    createPlan, 
    profile, 
    patients, 
    currentCrearPlanPacienteId,
    showToast,
    loadPatients // Añadimos loadPatients del contexto si existe
  } = useContext(DashboardContext);
  
  const open = modals.crearPlan;

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    id_paciente: '',
    prescripciones: []
  });
  
  const [prescripcionForm, setPrescripcionForm] = useState({
    tipo: '',
    descripcion: '',
    frecuencia: '',
    duracion: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [patientsLoaded, setPatientsLoaded] = useState(false);

  // Cargar pacientes si no están cargados cuando se abre el modal
  useEffect(() => {
    if (open && !profile?.id_paciente) {
      const loadPatientsData = async () => {
        try {
          if (loadPatients && typeof loadPatients === 'function') {
            await loadPatients();
          }
        } catch (error) {
          console.error('Error al cargar pacientes:', error);
          showToast('Error al cargar la lista de pacientes', 'error');
        } finally {
          setPatientsLoaded(true);
        }
      };
      
      loadPatientsData();
    }
  }, [open, profile, loadPatients, showToast]);

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      const today = new Date().toISOString().split('T')[0];
      
      let initialPatientId = '';
      if (currentCrearPlanPacienteId) {
        initialPatientId = currentCrearPlanPacienteId.toString();
      } else if (profile?.id_paciente) {
        initialPatientId = profile.id_paciente.toString();
      }

      setFormData({
        titulo: '',
        descripcion: '',
        fecha_inicio: today,
        id_paciente: initialPatientId,
        prescripciones: []
      });

      setPrescripcionForm({
        tipo: '',
        descripcion: '',
        frecuencia: '',
        duracion: ''
      });
      
      // Si el usuario es paciente, ya tenemos los datos
      if (profile?.id_paciente) {
        setPatientsLoaded(true);
      }
    } else {
      // Resetear cuando se cierra el modal
      setPatientsLoaded(false);
    }
  }, [open, currentCrearPlanPacienteId, profile]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePrescripcionChange = (e) => {
    const { name, value } = e.target;
    setPrescripcionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addPrescripcion = () => {
    if (!prescripcionForm.descripcion.trim() || !prescripcionForm.tipo) {
      showToast('Completa al menos el tipo y descripción de la prescripción', 'warning');
      return;
    }

    setFormData(prev => ({
      ...prev,
      prescripciones: [
        ...prev.prescripciones,
        { ...prescripcionForm, id: Date.now() }
      ]
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.titulo.trim()) {
      showToast('El título del plan es obligatorio', 'error');
      return;
    }

    if (!formData.descripcion.trim()) {
      showToast('La descripción del plan es obligatoria', 'error');
      return;
    }

    if (!formData.fecha_inicio) {
      showToast('La fecha de inicio es obligatoria', 'error');
      return;
    }

    let id_paciente = null;
    
    // Determinar el ID del paciente
    if (currentCrearPlanPacienteId) {
      id_paciente = currentCrearPlanPacienteId;
    } else if (formData.id_paciente) {
      id_paciente = parseInt(formData.id_paciente);
    } else if (profile?.id_paciente) {
      id_paciente = profile.id_paciente;
    }

    if (!id_paciente) {
      showToast('Selecciona un paciente', 'error');
      return;
    }

    // Validar fecha
    const fechaInicio = new Date(formData.fecha_inicio);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaInicio < hoy) {
      showToast('La fecha de inicio no puede ser anterior a hoy', 'error');
      return;
    }

    // Validar prescripciones
    if (formData.prescripciones.length === 0) {
      showToast('Debe agregar al menos una prescripción', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await createPlan({
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fecha_inicio: formData.fecha_inicio,
        id_paciente: id_paciente,
        prescripciones: formData.prescripciones.map(p => ({
          tipo: p.tipo,
          descripcion: p.descripcion,
          frecuencia: p.frecuencia,
          duracion: p.duracion
        }))
      });
    } catch (error) {
      console.error('Error al crear plan:', error);
      // El contexto ya maneja el error con showToast
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrar pacientes disponibles
  const availablePatients = Array.isArray(patients) 
    ? patients.filter(p => 
        !profile?.id_paciente || p.id_paciente === profile.id_paciente
      )
    : [];

  // Verificar si estamos cargando pacientes
  const isLoadingPatients = !profile?.id_paciente && !patientsLoaded;

  return (
    <Modal
      open={open}
      onClose={() => closeModal('crearPlan')}
      title="Crear Plan de Tratamiento"
      size="lg"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="titulo" className={styles.label}>
              Título del Plan *
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleFormChange}
              placeholder="Ej: Plan post-operatorio, Tratamiento de rehabilitación"
              className={styles.input}
              required
              disabled={submitting}
            />
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
              className={styles.input}
              required
              disabled={submitting}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Selector de paciente - solo visible si el usuario no es paciente */}
        {!profile?.id_paciente && (
          <div className={styles.formGroup}>
            <label htmlFor="id_paciente" className={styles.label}>
              Paciente *
            </label>
            {currentCrearPlanPacienteId ? (
              <div className={styles.preselectedPatient}>
                <input
                  type="text"
                  value={availablePatients.find(p => p.id_paciente === currentCrearPlanPacienteId)?.nombre || 'Paciente seleccionado'}
                  readOnly
                  className={styles.input}
                />
                <span className={styles.preselectedBadge}>Preseleccionado</span>
              </div>
            ) : (
              <>
                {isLoadingPatients ? (
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
                    className={styles.select}
                    required
                    disabled={submitting || availablePatients.length === 0}
                  >
                    <option value="">
                      {availablePatients.length === 0 
                        ? "No hay pacientes disponibles" 
                        : "Selecciona un paciente"
                      }
                    </option>
                    {availablePatients.map(patient => (
                      <option key={patient.id_paciente} value={patient.id_paciente}>
                        {patient.nombre} {patient.apellido} - CI: {patient.ci}
                      </option>
                    ))}
                  </select>
                )}
              </>
            )}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="descripcion" className={styles.label}>
            Descripción del Plan *
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleFormChange}
            placeholder="Describe el plan de tratamiento en detalle..."
            className={styles.textarea}
            rows={5}
            required
            disabled={submitting}
          />
        </div>

        {/* Sección de Prescripciones */}
        <div className={styles.prescripcionesSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Prescripciones / Indicaciones</h3>
            <span className={styles.prescripcionesCount}>
              {formData.prescripciones.length} añadidas
            </span>
          </div>

          <div className={styles.prescripcionForm}>
            <div className={styles.prescripcionGrid}>
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
                  disabled={submitting}
                >
                  <option value="">Selecciona tipo</option>
                  <option value="Tratamiento">Tratamiento</option>
                  <option value="Indicacion">Indicación</option>
                  <option value="Medicacion">Medicación</option>
                  <option value="Ejercicio">Ejercicio</option>
                  <option value="Dieta">Dieta</option>
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
                  disabled={submitting}
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
                  disabled={submitting}
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
                placeholder="Describe la prescripción en detalle..."
                className={styles.textarea}
                rows={3}
                disabled={submitting}
              />
            </div>

            <button
              type="button"
              onClick={addPrescripcion}
              className={styles.addPrescripcionButton}
              disabled={submitting || !prescripcionForm.descripcion.trim() || !prescripcionForm.tipo}
            >
              + Añadir Prescripción
            </button>
          </div>

          {/* Lista de prescripciones añadidas */}
          {formData.prescripciones.length > 0 && (
            <div className={styles.prescripcionesList}>
              {formData.prescripciones.map((pres, index) => (
                <div key={pres.id} className={styles.prescripcionItem}>
                  <div className={styles.prescripcionHeader}>
                    <span className={styles.prescripcionType}>{pres.tipo}</span>
                    <button
                      type="button"
                      onClick={() => removePrescripcion(index)}
                      className={styles.removeButton}
                      disabled={submitting}
                      aria-label="Eliminar prescripción"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                  <p className={styles.prescripcionDesc}>{pres.descripcion}</p>
                  {(pres.frecuencia || pres.duracion) && (
                    <div className={styles.prescripcionMeta}>
                      {pres.frecuencia && <span>Frecuencia: {pres.frecuencia}</span>}
                      {pres.duracion && <span>Duración: {pres.duracion}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {formData.prescripciones.length === 0 && (
            <div className={styles.noPrescripciones}>
              <p>No hay prescripciones añadidas. Agrega al menos una prescripción para continuar.</p>
            </div>
          )}
        </div>

        <div className={styles.formFooter}>
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => closeModal('crearPlan')}
              className={styles.cancelButton}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting || formData.prescripciones.length === 0}
              title={formData.prescripciones.length === 0 ? 'Agrega al menos una prescripción' : ''}
            >
              {submitting ? (
                <>
                  <span className={styles.spinner}></span>
                  Creando Plan...
                </>
              ) : `Crear Plan (${formData.prescripciones.length} prescripciones)`}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}