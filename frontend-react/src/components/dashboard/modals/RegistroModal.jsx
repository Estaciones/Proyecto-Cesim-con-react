// src/components/dashboard/modals/RegistroModal.jsx
import React, { useContext, useState, useEffect } from "react";
import Modal from "./Modal";
import { DashboardContext } from "../../context/DashboardContext";

export default function RegistroModal() {
  const { modals, closeModal, createRegistro, profile } = useContext(DashboardContext);
  const open = modals.registro;

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setTitulo("");
      setDescripcion("");
    } else {
      // si profile tiene id_paciente prefill
    }
  }, [open]);

  async function onSubmit(e) {
    e.preventDefault();
    const id_paciente = profile?.id_paciente || null;
    const ci = profile?.ci || null;
    if (!titulo || !descripcion) {
      return alert("Completa todos los campos"); // simple, el contexto tiene showToast; puedes mejorar
    }
    if (!id_paciente) {
      return alert("Debe seleccionar un paciente");
    }
    setSubmitting(true);
    try {
      await createRegistro({ titulo, descripcion, id_paciente, ci });
    } catch (err) {
      // error ya manejado en context
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={() => closeModal("registro")} title="Nuevo Registro en Historia Clínica">
      <form id="formRegistro" onSubmit={onSubmit}>
        <input type="hidden" value={profile?.id_paciente || ""} />
        <div className="form-group">
          <label htmlFor="reg_titulo">Título</label>
          <input id="reg_titulo" required value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="reg_descripcion">Descripción</label>
          <textarea id="reg_descripcion" rows="5" required value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Guardando..." : "Guardar"}</button>
          <button type="button" className="btn-secondary" onClick={() => closeModal("registro")}>Cancelar</button>
        </div>
      </form>
    </Modal>
  );
}
