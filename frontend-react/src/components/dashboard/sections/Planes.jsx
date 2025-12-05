// src/components/dashboard/sections/Planes.jsx
import React, { useContext, useEffect } from "react";
import { DashboardContext } from "../../../context/DashboardContext";

export default function Planes() {
  const { plans, loadPlanes, loading, profile } = useContext(DashboardContext);

  useEffect(() => {
    (async () => {
      await loadPlanes();
    })();
  }, [loadPlanes]);

  if (loading) {
    return (
      <section id="section-plan" className="content-section">
        <div className="section-header"><h2>Planes de Tratamiento</h2></div>
        <div className="section-content"><div className="loading-state"><p>Cargando planes...</p></div></div>
      </section>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <section id="section-plan" className="content-section">
        <div className="section-header"><h2>Planes de Tratamiento</h2></div>
        <div className="section-content"><div className="empty-state"><h4>Sin planes</h4><p>No hay planes de tratamiento.</p></div></div>
      </section>
    );
  }

  return (
    <section id="section-plan" className="content-section">
      <div className="section-header">
        <h2>Planes de Tratamiento</h2>
        <div className="header-actions">
          {profile?.tipo_usuario === "medico" && <button className="btn-primary">+ Crear Plan</button>}
        </div>
      </div>
      <div className="section-content">
        {plans.map((plan) => (
          <article className="plan-card" key={plan.id_plan}>
            <h4>{plan.titulo}</h4>
            <div className="meta">Inicio: {plan.fecha_inicio ? new Date(plan.fecha_inicio).toLocaleDateString() : ""}</div>
            <p>{(plan.descripcion || "").slice(0, 300)}</p>
            <div className="card-actions">
              <button className="btn-secondary">Ver</button>
              {profile?.tipo_usuario === "medico" && <button className="btn-secondary">Editar Plan</button>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
