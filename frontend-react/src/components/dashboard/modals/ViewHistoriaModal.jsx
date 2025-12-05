// src/components/dashboard/modals/ViewHistoriaModal.jsx
import React, { useContext } from "react";
import Modal from "./Modal";
import { DashboardContext } from "../../../context/DashboardContext";

export default function ViewHistoriaModal() {
  const { modals, closeModal, currentViewHistoria } = useContext(DashboardContext);
  const open = modals.viewHistoria;
  
  // El registro es null si el modal está cerrado, o currentViewHistoria si está abierto
  const record = open ? currentViewHistoria : null;

  return (
    <Modal 
      open={open} 
      onClose={() => closeModal("viewHistoria")} 
      title={record?.titulo || "Registro"}
    >
      <div className="meta">
        {record && (
          <>
            {record.fecha_creacion && (
              <div>Creado: {new Date(record.fecha_creacion).toLocaleString()}</div>
            )}
            {record.fecha_actualizacion && (
              <div>
                Actualizado: {new Date(record.fecha_actualizacion).toLocaleString()}
              </div>
            )}
          </>
        )}
      </div>
      
      {record?.descripcion && (
        <div style={{ marginTop: 12 }}>
          <pre style={{ 
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
            margin: 0,
            padding: 0
          }}>
            {record.descripcion}
          </pre>
        </div>
      )}
      
      <div className="form-actions" style={{ marginTop: 16 }}>
        <button 
          className="btn-secondary" 
          onClick={() => closeModal("viewHistoria")}
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
}