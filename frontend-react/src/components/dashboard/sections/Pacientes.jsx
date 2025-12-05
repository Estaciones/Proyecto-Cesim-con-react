// src/components/dashboard/sections/Pacientes.jsx
import React, { useContext, useEffect, useState } from "react";
import { DashboardContext } from "../../../context/DashboardContext";

/*
  Pacientes.jsx - lista de pacientes.
  Usa selectPatient(paciente), openAsignarGestor(pacienteId), openCrearPlanWithPatient(pacienteId)
*/
export default function Pacientes() {
  const {
    patients,
    loadPatients,
    loading,
    profile,
    selectPatient,
    openAsignarGestor,
    openCrearPlanWithPatient,
  } = useContext(DashboardContext);

  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      await loadPatients();
    })();
  }, [loadPatients]);

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
          <input
            id="searchPacientes"
            className="input-search"
            placeholder="Buscar por nombre, CI o email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="section-content">
        {loading && <div className="loading-state"><p>Cargando lista de pacientes...</p></div>}

        {!loading && (!patients || patients.length === 0) && (
          <div className="empty-state">
            <p>No hay pacientes asignados.</p>
          </div>
        )}

        {!loading && Array.isArray(filtered) && filtered.length > 0 && (
          <div id="pacientesList" className="pacientes-grid">
            {filtered.map((p) => (
              <div className="paciente-card" key={p.id_paciente || p.ci}>
                <h4>{p.nombre} {p.apellido}</h4>
                <div className="meta">{p.ci} · {p.direccion || ""}</div>
                <div className="card-actions">
                  <button className="btn-primary btn-open" onClick={() => selectPatient({ id_paciente: p.id_paciente, ci: p.ci, nombre: p.nombre, apellido: p.apellido })}>
                    Abrir
                  </button>

                  {/* Médico puede asignar gestor y crear plan */}
                  {profile?.tipo_usuario === "medico" && (
                    <>
                      <button className="btn-secondary btn-assign" onClick={() => openAsignarGestor(p.id_paciente)}>
                        Asignar gestor
                      </button>
                      <button className="btn-secondary" onClick={() => openCrearPlanWithPatient(p.id_paciente)}>
                        + Crear Plan
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && Array.isArray(filtered) && filtered.length === 0 && (
          <div className="empty-state">
            <p>No hay pacientes que coincidan con la búsqueda.</p>
          </div>
        )}
      </div>
    </section>
  );
}
