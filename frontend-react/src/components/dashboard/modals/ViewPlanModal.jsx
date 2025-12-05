// src/components/dashboard/modals/ViewPlanModal.jsx
import React, { useContext } from "react";
import Modal from "./Modal";
import { DashboardContext } from "../../context/DashboardContext";

export default function ViewPlanModal() {
  const { modals, closeModal, currentViewPlan } = useContext(DashboardContext);
  const open = modals.viewPlan;
  
  // Derivamos el plan directamente del contexto
  const plan = open ? currentViewPlan : null;

  return (
    <Modal 
      open={open} 
      onClose={() => closeModal("viewPlan")} 
      title={plan?.titulo || "Plan"}
    >
      {plan && (
        <>
          <div className="meta">
            {plan.fecha_inicio && (
              <div>Inicio: {new Date(plan.fecha_inicio).toLocaleString()}</div>
            )}
            {plan.medico_ci && (
              <div>Médico: {plan.medico_ci}</div>
            )}
            {plan.estado && (
              <div>Estado: {plan.estado}</div>
            )}
          </div>
          
          {plan.descripcion && (
            <div style={{ marginTop: 12 }}>
              <pre style={{ 
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
                margin: 0,
                padding: 0
              }}>
                {plan.descripcion}
              </pre>
            </div>
          )}
          
          <h4 style={{ marginTop: 14 }}>Prescripciones</h4>
          
          {Array.isArray(plan.prescripciones) && plan.prescripciones.length > 0 ? (
            plan.prescripciones.map(pres => (
              <div 
                key={pres.id_prescripcion || pres.id} 
                className="pres-card"
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                  padding: "12px",
                  marginBottom: "8px",
                  backgroundColor: "#f9f9f9"
                }}
              >
                <strong>{pres.descripcion || "Sin descripción"}</strong>
                <div className="meta" style={{ fontSize: "0.9em", color: "#666", marginTop: "4px" }}>
                  {pres.frecuencia && `Frecuencia: ${pres.frecuencia}`}
                  {pres.duracion && ` · Duración: ${pres.duracion}`}
                  {` · Cumplimiento: ${pres.cumplimiento ? "Sí" : "No"}`}
                </div>
                {pres.observaciones && (
                  <div style={{ marginTop: "8px" }}>
                    {pres.observaciones}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ textAlign: "center", color: "#999", padding: "20px" }}>
              <small>Sin prescripciones</small>
            </div>
          )}
        </>
      )}
      
      <div className="form-actions" style={{ marginTop: 16 }}>
        <button 
          className="btn-secondary" 
          onClick={() => closeModal("viewPlan")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
}