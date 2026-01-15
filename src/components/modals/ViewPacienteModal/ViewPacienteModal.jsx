// ViewPacienteModal.jsx
import React, { useEffect, useState } from 'react';
import Modal from '../Modal/Modal';
import { useModal } from '../../../hooks/useModal';
import styles from './ViewPacienteModal.module.css';

export default function ViewPacienteModal() {
  const { modals, closeModal, modalData } = useModal();

  const open = !!modals.viewPaciente;
  const patient = modalData.viewPaciente?.currentPatientData;

  const [formData, setFormData] = useState({
    direccion: '',
    alergias: '',
    condiciones_cronicas: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    telefono: '',
    email: '',
    genero: ''
  });

  useEffect(() => {
    if (open && patient) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        direccion: patient.direccion || '',
        alergias: patient.alergias || '',
        condiciones_cronicas: patient.condiciones_cronicas || '',
        contacto_emergencia_nombre: patient.contacto_emergencia_nombre || '',
        contacto_emergencia_telefono: patient.contacto_emergencia_telefono || '',
        telefono: patient.telefono || '',
        email: patient.email || '',
        genero: patient.genero || ''
      });
    }
  }, [open, patient]);

  const getGeneroTexto = (genero) => {
    const generoLimpio = genero ? genero.trim().toUpperCase() : '';
    
    switch(generoLimpio) {
      case 'M': return 'Masculino';
      case 'F': return 'Femenino';
      case 'O': return 'Otro';
      default: return 'No especificado';
    }
  };

  if (!patient) {
    return (
      <Modal
        open={open}
        onClose={() => closeModal('viewPaciente')}
        title="Información del Paciente"
        size="lg"
      >
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👤</div>
            <h3>No hay datos del paciente</h3>
            <p>No se pudo cargar la información del paciente seleccionado.</p>
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => closeModal('viewPaciente')}
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
      onClose={() => closeModal('viewPaciente')}
      title={`Paciente: ${fullName || 'Sin nombre'}`}
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
                <strong>Género:</strong> {getGeneroTexto(patient.genero || formData.genero)}
              </span>
            </div>
          </div>
        </div>

        {/* Información Básica */}
        <div className={styles.infoSection}>
          <h4 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📱</span>
            Información de Contacto
          </h4>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Teléfono</label>
              <div className={styles.infoValue}>
                {patient.telefono || formData.telefono || 'No especificado'}
              </div>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Email</label>
              <div className={styles.infoValue}>
                {patient.email || formData.email || 'No especificado'}
              </div>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Dirección</label>
              <div className={styles.infoValue}>
                {patient.direccion || formData.direccion || 'No especificada'}
              </div>
            </div>
          </div>
        </div>

        {/* Información de Salud */}
        <div className={styles.infoSection}>
          <h4 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🏥</span>
            Información Médica
          </h4>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Alergias</label>
              <div className={`${styles.infoValue} ${styles.largeField}`}>
                {patient.alergias || formData.alergias || 'No especificadas'}
              </div>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Condiciones Crónicas</label>
              <div className={`${styles.infoValue} ${styles.largeField}`}>
                {patient.condiciones_cronicas || formData.condiciones_cronicas || 'No especificadas'}
              </div>
            </div>
          </div>
        </div>

        {/* Contacto de Emergencia */}
        <div className={styles.infoSection}>
          <h4 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🆘</span>
            Contacto de Emergencia
          </h4>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Nombre</label>
              <div className={styles.infoValue}>
                {patient.contacto_emergencia_nombre || formData.contacto_emergencia_nombre || 'No especificado'}
              </div>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Teléfono</label>
              <div className={styles.infoValue}>
                {patient.contacto_emergencia_telefono || formData.contacto_emergencia_telefono || 'No especificado'}
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => closeModal('viewPaciente')}
            className={styles.closeButton}
          >
            Cerrar Vista
          </button>
        </div>
      </div>
    </Modal>
  );
}