// src/components/dashboard/modals/EditPresModal.jsx
import React, { useState, useContext, useEffect } from "react";
import Modal from "./Modal";
import { DashboardContext } from "../../../context/DashboardContext";

export default function EditPresModal() {
  const { modals, closeModal, currentEditPres, updatePrescripcion } = useContext(DashboardContext);
  const open = modals.editPres;

  const [presId, setPresId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [cumplimiento, setCumplimiento] = useState("false");
  const [submitting, setSubmitting] = useState(false);

  // cuando currentEditPres cambie (o modal abra), sincronizamos campos
  useEffect(() => {
    if (!open || !currentEditPres) {
      setPresId(""); setDescripcion(""); setObservaciones(""); setCumplimiento("false");
      return;
    }
    setPresId(currentEditPres.id_prescripcion || currentEditPres.id || "");
    setDescripcion(currentEditPres.descripcion || "");
    setObservaciones(currentEditPres.observaciones || "");
    setCumplimiento(currentEditPres.cumplimiento ? "true" : "false");
  }, [open, currentEditPres]);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updatePrescripcion({ presId, descripcion, observaciones, cumplimiento: cumplimiento === "true" });
    } catch (err) {
      console.error("Error en EditPresModal:", err);
    }
    finally { setSubmitting(false); }
  }

  return (
    <Modal open={open} onClose={() => closeModal("editPres")} title="Editar Prescripción">
      <form onSubmit={onSubmit}>
        <input type="hidden" value={presId} readOnly />
        <div className="form-group"><label>Descripción</label><textarea rows="3" required value={descripcion} onChange={e => setDescripcion(e.target.value)} /></div>
        <div className="form-group"><label>Observaciones</label><textarea rows="2" value={observaciones} onChange={e => setObservaciones(e.target.value)} /></div>
        <div className="form-group"><label>Cumplimiento</label><select value={cumplimiento} onChange={e => setCumplimiento(e.target.value)}><option value="false">No cumplido</option><option value="true">Cumplido</option></select></div>
        <div className="form-actions"><button className="btn-primary" type="submit" disabled={submitting}>{submitting ? "Guardando..." : "Guardar"}</button><button type="button" className="btn-secondary" onClick={() => closeModal("editPres")}>Cancelar</button></div>
      </form>
    </Modal>
  );
}
