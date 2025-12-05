// src/components/dashboard/modals/ViewPlanModal.jsx
import React, { useContext, useEffect, useState } from "react";
import Modal from "./Modal";
import { DashboardContext } from "../../context/DashboardContext";

export default function ViewPlanModal() {
  const { modals, closeModal, currentViewPlan } = useContext(DashboardContext);
  const open = modals.viewPlan;
  const [plan, setPlan] = useState(null);

  useEffect(() => { if (!open) { setPlan(null); return; } setPlan(currentViewPlan || null); }, [open, currentViewPlan]);

  return (
    <Modal open={open} onClose={() => closeModal("viewPlan")} title={plan?.titulo || "Plan"}>
      <div className="meta">{plan ? `Inicio: ${plan.fecha_inicio ? new Date(plan.fecha_inicio).toLocaleString() : ""} · Médico: ${plan.medico_ci || ""}` : ""}</div>
      <div style={{ marginTop: 12 }} dangerouslySetInnerHTML={{ __html: plan ? `<pre style="white-space:pre-wrap;">${(plan.descripcion || "")}</pre>` : "" }} />
      <h4 style={{ marginTop: 14 }}>Prescripciones</h4>
      <div>{Array.isArray(plan?.prescripciones) && plan.prescripciones.length ? plan.prescripciones.map(pres => (
        <div key={pres.id_prescripcion || pres.id} className="pres-card">
          <strong>{pres.descripcion}</strong>
          <div className="meta">Frecuencia: {pres.frecuencia || ""} · Duración: {pres.duracion || ""} · Cumplimiento: {pres.cumplimiento ? "Sí" : "No"}</div>
          <div>{pres.observaciones || ""}</div>
        </div>
      )) : <div className="empty-state"><small>Sin prescripciones</small></div>}</div>
      <div className="form-actions" style={{ marginTop: 16 }}><button className="btn-secondary" onClick={() => closeModal("viewPlan")}>Cerrar</button></div>
    </Modal>
  );
}
