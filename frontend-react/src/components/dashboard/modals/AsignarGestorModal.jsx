// src/components/dashboard/modals/AsignarGestorModal.jsx
import React, { useContext, useEffect, useState } from "react";
import Modal from "./Modal";
import { DashboardContext } from "../../context/DashboardContext";
import { apiUrl } from "../../../utils/api";

export default function AsignarGestorModal() {
  const { modals, closeModal, assignGestor, currentAsignarPacienteId } = useContext(DashboardContext);
  const open = modals.asignarGestor;
  const [gestores, setGestores] = useState([]);
  const [selected, setSelected] = useState("");
  const [loadingGest, setLoadingGest] = useState(false);

  useEffect(() => {
    if (!open) { setGestores([]); setSelected(""); return; }
    setSelected("");
    (async () => {
      setLoadingGest(true);
      try {
        const res = await fetch(apiUrl("gestores"), { credentials: "include" });
        if (!res.ok) throw new Error("Error cargando gestores");
        const data = await res.json();
        setGestores(Array.isArray(data) ? data : []);
      } catch (err) { console.error(err); setGestores([]); } finally { setLoadingGest(false); }
    })();
  }, [open]);

  async function onSubmit(e) {
    e.preventDefault();
    const pid = currentAsignarPacienteId;
    if (!selected) return alert("Selecciona un gestor");
    if (!pid) return alert("No se proporcionó el id del paciente");
    try { await assignGestor({ id_gestor: selected, id_paciente: pid }); } catch (err) {}
  }

  return (
    <Modal open={open} onClose={() => closeModal("asignarGestor")} title="Asignar Gestor de Casos">
      <form onSubmit={onSubmit}>
        <div className="form-group"><label>Seleccionar gestor</label>
          <select required value={selected} onChange={e => setSelected(e.target.value)}>
            <option value="">Selecciona</option>
            {gestores.map(g => <option key={g.id_gestor} value={g.id_gestor}>{g.nombre} {g.apellido} ({g.ci})</option>)}
          </select>
        </div>
        <div className="form-actions"><button className="btn-primary" type="submit" disabled={loadingGest}>{loadingGest ? "Asignando..." : "Asignar"}</button><button type="button" className="btn-secondary" onClick={() => closeModal("asignarGestor")}>Cancelar</button></div>
      </form>
    </Modal>
  );
}
