// EditPacienteModal.jsx
import React, { useEffect, useState } from 'react';
import Modal from '../Modal/Modal';
import { useModal } from '../../../hooks/useModal';
import { usePatients } from '../../../hooks/usePatients';
import { useToast } from '../../../hooks/useToast';
import styles from './EditPacienteModal.module.css';

export default function EditPacienteModal() {
  const { modals, closeModal, modalData } = useModal();
  const { updatePatient } = usePatients();
  const { showToast } = useToast();

  const open = !!modals.editPaciente;
  const patient = modalData.editPaciente?.currentPatientData;

  const [formData, setFormData] = useState({
    direccion: '',
    alergias: '',
    condiciones_cronicas: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    telefono: '',
    email: '',
    genero: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && patient) {
      const generoLimpio = patient.genero ? patient.genero.trim() : '';
      
      setFormData({
        direccion: patient.direccion || '',
        alergias: patient.alergias || '',
        condiciones_cronicas: patient.condiciones_cronicas || '',
        contacto_emergencia_nombre: patient.contacto_emergencia_nombre || '',
        contacto_emergencia_telefono: patient.contacto_emergencia_telefono || '',
        telefono: patient.telefono || '',
        email: patient.email || '',
        genero: generoLimpio,
      });
    }
  }, [open, patient]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (
      name === 'telefono' ||
      name === 'contacto_emergencia_telefono'
    ) {
      const numericValue = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (formData.telefono && formData.telefono.length < 7) {
      showToast('El teléfono debe tener al menos 7 dígitos', 'error');
      return false;
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      showToast('El email no es válido', 'error');
      return false;
    }

    if (
      formData.contacto_emergencia_telefono &&
      formData.contacto_emergencia_telefono.length < 7
    ) {
      showToast(
        'El teléfono de emergencia debe tener al menos 7 dígitos',
        'error'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!patient?.id_paciente) {
      showToast('No se pudo identificar al paciente', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const pacienteData = {
        direccion: formData.direccion || '',
        alergias: formData.alergias || '',
        condiciones_cronicas: formData.condiciones_cronicas || '',
        contacto_emergencia_nombre: formData.contacto_emergencia_nombre || '',
        contacto_emergencia_telefono: formData.contacto_emergencia_telefono || '',
        telefono: formData.telefono || '',
        genero: formData.genero ? formData.genero.trim().toUpperCase() : '',
      };

      await updatePatient(patient.id_paciente, pacienteData);
      showToast('Paciente actualizado exitosamente', 'success');
      closeModal('editPaciente');
    } catch (error) {
      showToast(error.message || 'Error al actualizar paciente', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    if (patient) {
      const generoLimpio = patient.genero ? patient.genero.trim() : '';
      
      setFormData({
        direccion: patient.direccion || '',
        alergias: patient.alergias || '',
        condiciones_cronicas: patient.condiciones_cronicas || '',
        contacto_emergencia_nombre: patient.contacto_emergencia_nombre || '',
        contacto_emergencia_telefono: patient.contacto_emergencia_telefono || '',
        telefono: patient.telefono || '',
        email: patient.email || '',
        genero: generoLimpio,
      });
    }
  };

  if (!patient) {
    return (
      <Modal
        open={open}
        onClose={() => closeModal('editPaciente')}
        title="Editar Paciente"
        size="lg"
      >
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👤</div>
            <h3>No hay datos del paciente</h3>
            <p>No se pudo cargar la información del paciente.</p>
            <button
              type="button"
              onClick={() => closeModal('editPaciente')}
              className={styles.closeButton}
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  const fullName = `${patient.nombre || ''} ${patient.apellido || ''}`.trim();

  return (
    <Modal
      open={open}
      onClose={() => closeModal('editPaciente')}
      title="Editar Información del Paciente"
      size="lg"
    >
      <div className={styles.container}>
        {/* Encabezado del Paciente */}
        <div className={styles.headerSection}>
          <div className={styles.avatar}>
            {fullName.charAt(0)}
          </div>
          <div className={styles.headerInfo}>
            <h3 className={styles.patientName}>{fullName || 'Paciente'}</h3>
            <div className={styles.metaInfo}>
              <span className={styles.metaItem}>
                <strong>CI:</strong> {patient.ci || 'No especificado'}
              </span>
              <span className={styles.metaItem}>
                <strong>ID:</strong> {patient.id_paciente}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Información Básica */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📱</span>
              Información de Contacto
            </h4>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="genero" className={styles.label}>
                  Género
                </label>
                <select
                  id="genero"
                  name="genero"
                  value={formData.genero}
                  onChange={handleInputChange}
                  className={styles.select}
                  disabled={submitting}
                >
                  <option value="">Seleccione género</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="telefono" className={styles.label}>
                  Teléfono
                </label>
                <input
                  type="text"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="Ej: 04121234567"
                  className={styles.input}
                  maxLength="10"
                  disabled={submitting}
                />
                {formData.telefono && (
                  <div className={styles.inputInfo}>
                    <span>{formData.telefono.length} dígitos</span>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || patient.email || ''}
                  className={styles.input}
                  readOnly
                  disabled
                  placeholder="Email del usuario"
                />
                <div className={styles.inputHelp}>
                  <span className={styles.helpIcon}>ℹ️</span>
                  <span>El email no se puede modificar aquí</span>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Salud */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>🏥</span>
              Información de Salud
            </h4>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="direccion" className={styles.label}>
                  Dirección
                </label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  placeholder="Dirección completa del paciente"
                  className={styles.input}
                  disabled={submitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="alergias" className={styles.label}>
                  Alergias Conocidas
                </label>
                <input
                  type="text"
                  id="alergias"
                  name="alergias"
                  value={formData.alergias}
                  onChange={handleInputChange}
                  placeholder="Ej: Penicilina, Ibuprofeno"
                  className={styles.input}
                  disabled={submitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="condiciones_cronicas" className={styles.label}>
                  Condiciones Crónicas
                </label>
                <input
                  type="text"
                  id="condiciones_cronicas"
                  name="condiciones_cronicas"
                  value={formData.condiciones_cronicas}
                  onChange={handleInputChange}
                  placeholder="Ej: Diabetes, Hipertensión"
                  className={styles.input}
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          {/* Contacto de Emergencia */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>🆘</span>
              Contacto de Emergencia
            </h4>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="contacto_emergencia_nombre" className={styles.label}>
                  Nombre del Contacto
                </label>
                <input
                  type="text"
                  id="contacto_emergencia_nombre"
                  name="contacto_emergencia_nombre"
                  value={formData.contacto_emergencia_nombre}
                  onChange={handleInputChange}
                  placeholder="Nombre completo del contacto"
                  className={styles.input}
                  disabled={submitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contacto_emergencia_telefono" className={styles.label}>
                  Teléfono de Emergencia
                </label>
                <input
                  type="text"
                  id="contacto_emergencia_telefono"
                  name="contacto_emergencia_telefono"
                  value={formData.contacto_emergencia_telefono}
                  onChange={handleInputChange}
                  placeholder="Ej: 04121234567"
                  className={styles.input}
                  maxLength="10"
                  disabled={submitting}
                />
                {formData.contacto_emergencia_telefono && (
                  <div className={styles.inputInfo}>
                    <span>{formData.contacto_emergencia_telefono.length} dígitos</span>
                  </div>
                )}
              </div>
            </div>
          </div>

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
                onClick={() => closeModal('editPaciente')}
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
                    Actualizando...
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