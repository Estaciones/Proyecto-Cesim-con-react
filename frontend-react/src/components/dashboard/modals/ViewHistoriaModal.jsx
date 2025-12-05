// src/components/dashboard/modals/ViewHistoriaModal.jsx
import React, { useContext, useEffect, useState } from "react";
import Modal from "./Modal";
import { DashboardContext } from "../../context/DashboardContext";

export default function ViewHistoriaModal() {
  const { modals, closeModal, currentViewHistoria } = useContext(DashboardContext);
  const open = modals.viewHistoria;
  const [record, setRecord] = useState(null);

  useEffect(() => { if (!open) { setRecord(null); return; } setRecord(currentViewHistoria || null); }, [open, currentViewHistoria]);

  return (
    <Modal open={open} onClose={() => closeModal("viewHistoria")} title={record?.titulo || "Registro"}>
      <div className="meta">{record ? `Creado: ${record.fecha_creacion ? new Date(record.fecha_creacion).toLocaleString() : ""}${record.fecha_actualizacion ? " · Actualizado: " + new Date(record.fecha_actualizacion).toLocaleString() : ""}` : ""}</div>
      <div style={{ marginTop: 12 }} dangerouslySetInnerHTML={{ __html: record ? `<pre style="white-space:pre-wrap;">${(record.descripcion || "")}</pre>` : "" }} />
      <div className="form-actions" style={{ marginTop: 16 }}><button className="btn-secondary" onClick={() => closeModal("viewHistoria")}>Cerrar</button></div>
    </Modal>
  );
}
