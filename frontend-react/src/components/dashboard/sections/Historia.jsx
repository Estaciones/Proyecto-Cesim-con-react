// src/components/dashboard/sections/Historia.jsx
import React, { useContext, useEffect } from "react";
import { DashboardContext } from "../../../context/DashboardContext";

/*
  Historia.jsx - lista de registros.
  Usa openViewHistoria(record) y openEditHistoria(record).
*/
export default function Historia() {
  const {
    historia,
    loadHistoria,
    loading,
    profile,
    selectedPatient,
    openModal,
    openViewHistoria,
    openEditHistoria,
  } = useContext(DashboardContext);

  useEffect(() => {
    (async () => {
      await loadHistoria();
    })();
  }, [loadHistoria]);

  // helper local
  const formatShortDate = (d) => (d ? new Date(d).toLocaleDateString() : "");

  return (
    <section id="section-historia" className="content-section">
      <div className="section-header">
        <h2>Historia Clínica</h2>
        <div className="header-actions">
          {/* Banner paciente seleccionado */}
          {selectedPatient && (
            <div className="patient-summary">
              <strong>{selectedPatient.nombre} {selectedPatient.apellido}</strong> · CI: {selectedPatient.ci}
            </div>
          )}

          {/* Solo médicos pueden crear un nuevo registro */}
          {profile?.tipo_usuario === "medico" && (
            <button className="btn-primary" onClick={() => openModal("registro")}>+ Nuevo Registro</button>
          )}
        </div>
      </div>

      <div className="section-content">
        {loading && <div className="loading-state"><p>Cargando historia clínica...</p></div>}

        {!loading && (!historia || historia.length === 0) && (
          <div className="empty-state">
            <h4>Sin registros</h4>
            <p>Aún no hay registros en la historia clínica.</p>
          </div>
        )}

        {!loading && Array.isArray(historia) && historia.length > 0 && (
          <>
            {historia.map((record) => (
              <article className="hist-record" key={record.id_registro || record.id}>
                <h4>{record.titulo}</h4>
                <div className="meta">
                  Creado: {formatShortDate(record.fecha_creacion)}
                  {record.fecha_actualizacion ? ` · Actualizado: ${formatShortDate(record.fecha_actualizacion)}` : ""}
                </div>
                <p>{(record.descripcion || "").slice(0, 250)}</p>
                <div className="card-actions">
                  <button className="btn-secondary" onClick={() => openViewHistoria(record)}>Ver</button>
                  {profile?.tipo_usuario === "medico" && (
                    <button className="btn-secondary" onClick={() => openEditHistoria(record)}>Editar</button>
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
