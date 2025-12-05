// src/components/dashboard/modals/EditHistoriaModal.jsx
import React, { useContext, useEffect, useState } from "react";
import Modal from "./Modal";
import { DashboardContext } from "../../context/DashboardContext";

export default function EditHistoriaModal() {
  const { modals, closeModal, currentEditHistoria, updateHistoria } = useContext(DashboardContext);
  const open = modals.editHistoria;

  const [recordId, setRecordId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !currentEditHistoria) {
      setRecordId(""); setTitulo(""); setDescripcion("");
      return;
    }
    setRecordId(currentEditHistoria.id_registro || currentEditHistoria.id || "");
    setTitulo(currentEditHistoria.titulo || "");
    setDescripcion(currentEditHistoria.descripcion || "");
  }, [open, currentEditHistoria]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!titulo || !descripcion) return alert("Completa todos los campos");
    setSubmitting(true);
    try {
      await updateHistoria({ recordId, titulo, descripcion });
    } catch (err) {}
    finally { setSubmitting(false); }
  }

  return (
    <Modal open={open} onClose={() => closeModal("editHistoria")} title="Editar Registro">
      <form onSubmit={onSubmit}>
        <input type="hidden" value={recordId} readOnly />
        <div className="form-group"><label>Título</label><input required value={titulo} onChange={e => setTitulo(e.target.value)} /></div>
        <div className="form-group"><label>Descripción</label><textarea rows="6" required value={descripcion} onChange={e => setDescripcion(e.target.value)} /></div>
        <div className="form-actions"><button className="btn-primary" type="submit" disabled={submitting}>{submitting ? "Guardando..." : "Guardar cambios"}</button><button type="button" className="btn-secondary" onClick={() => closeModal("editHistoria")}>Cancelar</button></div>
      </form>
    </Modal>
  );
}
