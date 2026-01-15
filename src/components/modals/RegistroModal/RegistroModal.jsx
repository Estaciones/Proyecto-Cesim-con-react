import React, { useState, useEffect, useCallback } from "react";
import Modal from "../Modal/Modal";
import { useModal } from "../../../hooks/useModal";
import { useHistory } from "../../../hooks/useHistory";
import { useToast } from "../../../hooks/useToast";
import { useAuthContext } from "../../../context/AuthContext";
import { usePatients } from "../../../hooks/usePatients";
import styles from "./RegistroModal.module.css";

export default function RegistroModal() {
  const { modals, closeModal, getModalData } = useModal();
  const { createRegistro } = useHistory();
  const { showToast } = useToast();
  const { profile } = useAuthContext();
  const { patients, fetchPatients, loading: patientsLoading } = usePatients();

  const open = !!modals.registro;
  const registroData = getModalData("registro");
  const currentRegistroPacienteId = registroData.currentRegistroPacienteId;

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    id_paciente: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Buscar información del paciente seleccionado
  const selectedPatientInfo = React.useMemo(() => {
    let targetId = null;

    if (currentRegistroPacienteId) {
      targetId = currentRegistroPacienteId;
    } else if (formData.id_paciente) {
      targetId = parseInt(formData.id_paciente);
    } else if (profile?.id_paciente) {
      targetId = profile.id_paciente;
    }

    if (targetId && Array.isArray(patients)) {
      const patient = patients.find((p) => p.id_paciente === targetId);
      if (patient) {
        return {
          id: patient.id_paciente,
          nombre: `${patient.nombre} ${patient.apellido}`,
          ci: patient.ci,
        };
      }
    }
    return null;
  }, [currentRegistroPacienteId, formData.id_paciente, profile, patients]);

  // Efecto para inicializar
  useEffect(() => {
    if (open && !initialized) {
      let initialPatientId = "";
      if (currentRegistroPacienteId) {
        initialPatientId = String(currentRegistroPacienteId);
      } else if (profile?.id_paciente) {
        initialPatientId = String(profile.id_paciente);
      }

      setFormData({
        titulo: "",
        descripcion: "",
        id_paciente: initialPatientId,
      });

      // Cargar pacientes si es médico y no tiene pacientes
      if (profile?.tipo_usuario === "medico" && (!patients || patients.length === 0)) {
        fetchPatients().catch((err) => {
          console.error("Error cargando pacientes:", err);
        });
      }

      setInitialized(true);
    } else if (!open) {
      setInitialized(false);
      setFormData({
        titulo: "",
        descripcion: "",
        id_paciente: "",
      });
      setSubmitting(false);
    }
  }, [open, initialized, currentRegistroPacienteId, profile, patients, fetchPatients]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titulo.trim()) {
      showToast("El título es obligatorio", "error");
      return;
    }
    if (!formData.descripcion.trim()) {
      showToast("La descripción es obligatoria", "error");
      return;
    }

    let id_paciente = null;
    if (currentRegistroPacienteId) {
      id_paciente = currentRegistroPacienteId;
    } else if (formData.id_paciente) {
      id_paciente = parseInt(formData.id_paciente);
    } else if (profile?.id_paciente) {
      id_paciente = profile.id_paciente;
    }

    if (!id_paciente) {
      showToast("Selecciona un paciente", "error");
      return;
    }

    let ci = null;
    if (Array.isArray(patients)) {
      const patient = patients.find((p) => p.id_paciente === id_paciente);
      if (patient) ci = patient.ci;
    }
    if (!ci && profile?.ci) ci = profile.ci;

    if (!ci) {
      showToast("No se pudo identificar el CI del paciente", "error");
      return;
    }

    setSubmitting(true);
    try {
      await createRegistro({
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        id_paciente,
        ci,
      });
      showToast("Registro creado exitosamente", "success");
      closeModal("registro");
    } catch (err) {
      console.error("Error creando registro:", err);
      showToast(err.message || "Error al crear registro", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const availablePatients = Array.isArray(patients)
    ? patients.filter((p) => !profile?.id_paciente || p.id_paciente === profile.id_paciente)
    : [];

  if (!open) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={() => closeModal("registro")}
      title="Nuevo Registro Clínico"
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {selectedPatientInfo ? (
          <div className={styles.selectedPatientInfo}>
            <h4>Paciente Seleccionado</h4>
            <div className={styles.patientCard}>
              <div className={styles.avatar}>
                {selectedPatientInfo.nombre?.charAt(0) || "P"}
              </div>
              <div className={styles.patientDetails}>
                <div className={styles.name}>{selectedPatientInfo.nombre}</div>
                <div className={styles.ci}>CI: {selectedPatientInfo.ci}</div>
              </div>
              {currentRegistroPacienteId && (
                <div className={styles.badge}>Seleccionado desde la lista</div>
              )}
            </div>
          </div>
        ) : !profile?.id_paciente ? (
          <div className={styles.formGroup}>
            <label htmlFor="id_paciente" className={styles.label}>
              Paciente *
            </label>
            {patientsLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                Cargando pacientes...
              </div>
            ) : availablePatients.length > 0 ? (
              <select
                id="id_paciente"
                name="id_paciente"
                value={formData.id_paciente}
                onChange={handleInputChange}
                className={styles.select}
                required
                disabled={submitting}
              >
                <option value="">-- Selecciona un paciente --</option>
                {availablePatients.map((p) => (
                  <option key={p.id_paciente} value={p.id_paciente}>
                    {p.nombre} {p.apellido} (CI: {p.ci})
                  </option>
                ))}
              </select>
            ) : (
              <div className={styles.empty}>No hay pacientes disponibles</div>
            )}
          </div>
        ) : null}

        <div className={styles.formGroup}>
          <label htmlFor="titulo" className={styles.label}>
            Título *
          </label>
          <input
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleInputChange}
            className={styles.input}
            required
            disabled={submitting}
            placeholder="Título del registro"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="descripcion" className={styles.label}>
            Descripción *
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            className={styles.textarea}
            rows={6}
            required
            disabled={submitting}
            placeholder="Descripción detallada del registro clínico"
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => closeModal("registro")}
            className={styles.cancel}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar Registro"}
          </button>
        </div>
      </form>
    </Modal>
  );
}