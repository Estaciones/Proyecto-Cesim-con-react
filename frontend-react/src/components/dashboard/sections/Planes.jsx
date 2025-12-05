// src/components/dashboard/sections/Planes.jsx
import React, { useContext, useEffect } from "react";
import { DashboardContext } from "../../../context/DashboardContext";

/*
  Planes.jsx - lista de planes.
  Usa openViewPlan(plan), openEditPlan(plan).
*/
export default function Planes() {
  const {
    plans,
    loadPlanes,
    loading,
    profile,
    selectedPatient,
    openModal,
    openViewPlan,
    openEditPlan,
    openCrearPlanWithPatient
  } = useContext(DashboardContext);

  useEffect(() => {
    (async () => {
      await loadPlanes();
    })();
  }, [loadPlanes]);

  const formatShortDate = (d) => (d ? new Date(d).toLocaleDateString() : "");

  return (
    <section id="section-plan" className="content-section">
      <div className="section-header">
        <h2>Planes de Tratamiento</h2>
        <div className="header-actions">
          {selectedPatient && (
            <div className="patient-summary">
              <strong>{selectedPatient.nombre} {selectedPatient.apellido}</strong> · CI: {selectedPatient.ci}
            </div>
          )}

          {/* botón + Crear Plan visible para médicos */}
          {profile?.tipo_usuario === "medico" && (
            <button
              className="btn-primary"
              onClick={() => {
                // si hay paciente seleccionado, preseleccionarlo; sino abrir modal normal
                if (selectedPatient?.id_paciente) openCrearPlanWithPatient(selectedPatient.id_paciente);
                else openModal("crearPlan");
              }}
            >
              + Crear Plan
            </button>
          )}
        </div>
      </div>

      <div className="section-content">
        {loading && <div className="loading-state"><p>Cargando planes...</p></div>}

        {!loading && (!plans || plans.length === 0) && (
          <div className="empty-state">
            <h4>Sin planes</h4>
            <p>No hay planes de tratamiento.</p>
          </div>
        )}

        {!loading && Array.isArray(plans) && plans.length > 0 && (
          <>
            {plans.map((plan) => (
              <article className="plan-card" key={plan.id_plan || plan.id}>
                <h4>{plan.titulo}</h4>
                <div className="meta">
                  Médico: {plan.medico_ci || ""} · Inicio: {formatShortDate(plan.fecha_inicio)}
                </div>
                <p>{(plan.descripcion || "").slice(0, 300)}</p>

                {/* prescripciones preview */}
                {Array.isArray(plan.prescripciones) && plan.prescripciones.length > 0 ? (
                  <div className="pres-list">
                    {plan.prescripciones.slice(0, 2).map((p) => (
                      <div key={p.id_prescripcion || p.id} className="pres-card">
                        <strong>{p.descripcion}</strong>
                        <div className="meta">Frecuencia: {p.frecuencia || ""} · Cumplimiento: {p.cumplimiento ? "Sí" : "No"}</div>
                      </div>
                    ))}
                    {plan.prescripciones.length > 2 && <small>...más prescripciones</small>}
                  </div>
                ) : (
                  <div className="empty-state"><small>Sin prescripciones</small></div>
                )}

                <div className="card-actions">
                  <button className="btn-secondary" onClick={() => openViewPlan(plan)}>Ver</button>
                  {profile?.tipo_usuario === "medico" && (
                    <button className="btn-secondary" onClick={() => openEditPlan(plan)}>Editar Plan</button>
                  )}
                </div>
              </article>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
