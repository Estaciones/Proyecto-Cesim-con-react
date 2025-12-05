// src/components/dashboard/sections/Historia.jsx
import React, { useContext, useEffect } from "react";
import { DashboardContext } from "../../../context/DashboardContext";

/*
  Historia: muestra la lista de registros (historia)
  - Usa context.historia y context.loadHistoria
  - Cuando se implemente el modal, se llamará a funciones del context o a handlers expuestos
*/
export default function Historia() {
  const { historia, loadHistoria, loading, selectedPatient, profile } = useContext(DashboardContext);

  useEffect(() => {
    // carga inicial al montar la sección
    (async () => {
      await loadHistoria();
    })();
  }, [loadHistoria]);

  if (loading) {
    return (
      <section id="section-historia" className="content-section">
        <div className="section-header"><h2>Historia Clínica</h2></div>
        <div className="section-content"><div className="loading-state"><p>Cargando historia clínica...</p></div></div>
      </section>
    );
  }

  if (!historia || historia.length === 0) {
    return (
      <section id="section-historia" className="content-section">
        <div className="section-header"><h2>Historia Clínica</h2></div>
        <div className="section-content"><div className="empty-state"><h4>Sin registros</h4><p>Aún no hay registros en la historia clínica.</p></div></div>
      </section>
    );
  }

  return (
    <section id="section-historia" className="content-section">
      <div className="section-header">
        <h2>Historia Clínica</h2>
        <div className="header-actions">
          {/* Aquí luego pondremos botones como "+ Nuevo Registro" para médicos */}
          {profile?.tipo_usuario === "medico" && <button className="btn-primary">+ Nuevo Registro</button>}
        </div>
      </div>
      <div className="section-content">
        {historia.map((rec) => (
          <article className="hist-record" key={rec.id_registro}>
            <h4>{rec.titulo}</h4>
            <div className="meta">Creado: {rec.fecha_creacion ? new Date(rec.fecha_creacion).toLocaleDateString() : ""}</div>
            <p>{(rec.descripcion || "").slice(0, 300)}</p>
            <div className="card-actions">
              <button className="btn-secondary">Ver</button>
              {profile?.tipo_usuario === "medico" && <button className="btn-secondary">Editar</button>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
