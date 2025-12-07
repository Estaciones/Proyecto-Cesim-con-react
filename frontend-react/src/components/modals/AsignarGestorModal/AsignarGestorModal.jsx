import React, { useContext, useEffect, useState, useCallback } from 'react';
import Modal from '../Modal/Modal';
import { DashboardContext } from '../../../context/DashboardContext';
import styles from './AsignarGestorModal.module.css';

export default function AsignarGestorModal() {
  const {
    modals,
    closeModal,
    assignGestor,
    currentAsignarPacienteId,
    showToast
  } = useContext(DashboardContext);

  const open = modals.asignarGestor;
  const [gestores, setGestores] = useState([]);
  const [selectedGestor, setSelectedGestor] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadGestores = useCallback(async () => {
    setLoading(true);
    try {
      const API_URL = 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/gestores`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar gestores');
      }

      const data = await response.json();
      setGestores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando gestores:', error);
      showToast('Error al cargar la lista de gestores', 'error');
      setGestores([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Cargar gestores cuando se abre el modal
  useEffect(() => {
    if (open) {
      loadGestores();
      setSelectedGestor('');
    }
  }, [open, loadGestores]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedGestor) {
      showToast('Selecciona un gestor de casos', 'error');
      return;
    }

    if (!currentAsignarPacienteId) {
      showToast('No se pudo identificar al paciente', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await assignGestor({
        id_gestor: selectedGestor,
        id_paciente: currentAsignarPacienteId
      });
      // El contexto ya maneja el cierre y toast de éxito
    } catch (error) {
      console.error('Error asignando gestor:', error);
      // El contexto ya maneja el error
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrentPatientName = () => {
    // Esta función debería obtener el nombre del paciente desde el contexto
    // Por ahora, mostramos solo el ID
    return `Paciente ID: ${currentAsignarPacienteId}`;
  };

  return (
    <Modal
      open={open}
      onClose={() => closeModal('asignarGestor')}
      title="Asignar Gestor de Casos"
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.patientInfo}>
          <h4>Paciente a asignar:</h4>
          <p className={styles.patientName}>{getCurrentPatientName()}</p>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="gestorSelect" className={styles.label}>
            Seleccionar Gestor *
          </label>

          {loading ? (
            <div className={styles.loadingState}>
              <span className={styles.spinner}></span>
              Cargando gestores disponibles...
            </div>
          ) : gestores.length === 0 ? (
            <div className={styles.emptyState}>
              No hay gestores disponibles para asignar
            </div>
          ) : (
            <select
              id="gestorSelect"
              value={selectedGestor}
              onChange={(e) => setSelectedGestor(e.target.value)}
              className={styles.select}
              required
              disabled={submitting}
            >
              <option value="">Selecciona un gestor</option>
              {gestores.map(gestor => (
                <option key={gestor.id_gestor} value={gestor.id_gestor}>
                  {gestor.nombre} {gestor.apellido} - CI: {gestor.ci}
                  {gestor.especialidad ? ` (${gestor.especialidad})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className={styles.gestoresInfo}>
          <h4>Total de gestores disponibles: {gestores.length}</h4>
          {gestores.length > 0 && (
            <div className={styles.gestoresList}>
              <small>Selecciona un gestor para asignar al paciente</small>
            </div>
          )}
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => closeModal('asignarGestor')}
            className={styles.cancelButton}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting || !selectedGestor || gestores.length === 0}
          >
            {submitting ? (
              <>
                <span className={styles.spinner}></span>
                Asignando...
              </>
            ) : 'Asignar Gestor'}
          </button>
        </div>
      </form>
    </Modal>
  );
}