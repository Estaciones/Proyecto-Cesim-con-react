// src/components/dashboard/sections/Pacientes.jsx
import React, { useContext, useEffect, useState } from "react";
import { DashboardContext } from "../../../context/DashboardContext";

export default function Pacientes() {
  const { patients, loadPatients, loading, profile, selectPatient } = useContext(DashboardContext);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      await loadPatients();
    })();
  }, [loadPatients]);

  if (loading) {
    return (
      <section id="section-pacientes" className="content-section">
        <div className="section-header"><h2>Mis Pacientes</h2></div>
        <div className="section-content"><div className="loading-state"><p>Cargando lista de pacientes...</p></div></div>
      </section>
    );
  }

  const filtered = Array.isArray(patients) && patients.length
    ? patients.filter((p) => {
        const text = `${p.nombre} ${p.apellido} ${p.ci} ${p.email || ""}`.toLowerCase();
        return text.includes(query.toLowerCase());
      })
    : [];

  return (
    <section id="section-pacientes" className="content-section">
      <div className="section-header">
        <h2>Mis Pacientes</h2>
        <div className="header-actions">
          <input id="searchPacientes" className="input-search" placeholder="Buscar por nombre, CI o email..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="section-content">
        <div id="pacientesList" className="pacientes-grid">
          {filtered.length === 0 ? (
            <div className="empty-state"><p>No hay pacientes que coincidan.</p></div>
          ) : (
            filtered.map((p) => (
              <div className="paciente-card" key={p.id_paciente || p.ci}>
                <h4>{p.nombre} {p.apellido}</h4>
                <div className="meta">{p.ci} · {p.direccion || ""}</div>
                <div className="card-actions">
                  <button className="btn-primary btn-open" onClick={() => selectPatient({ id_paciente: p.id_paciente, ci: p.ci, nombre: p.nombre, apellido: p.apellido })}>Abrir</button>
                  {profile?.tipo_usuario === "medico" && <button className="btn-secondary btn-assign">Asignar gestor</button>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
