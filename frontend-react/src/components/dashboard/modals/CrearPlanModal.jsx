// src/components/dashboard/modals/CrearPlanModal.jsx
import React, { useContext, useState, useEffect } from "react";
import Modal from "./Modal";
import { DashboardContext } from "../../context/DashboardContext";

/*
  Implementa prescripciones como array de objetos en estado local.
  Cada prescripción tiene: tipo, descripcion, frecuencia, duracion.
*/
export default function CrearPlanModal() {
    const { modals, closeModal, createPlan, profile, currentCrearPlanPacienteId } = useContext(DashboardContext);
    const open = modals.crearPlan;

    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [presList, setPresList] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) {
            setTitulo(""); setDescripcion(""); setFechaInicio(""); setPresList([]);
        } else {
            // si hay paciente preseleccionado por contexto, asignarlo
            if (currentCrearPlanPacienteId) {
                // colocarlo en hidden o usar directamente al crear
                // form input plan_paciente_id ya estaba presente: mantiene su value desde profile o desde currentCrearPlanPacienteId
            }
        }
    }, [open, currentCrearPlanPacienteId]);

    function addPres() {
        setPresList((p) => [...p, { tipo: "", descripcion: "", frecuencia: "", duracion: "" }]);
    }

    function updatePresAt(index, changes) {
        setPresList((p) => p.map((item, i) => (i === index ? { ...item, ...changes } : item)));
    }

    function removePres(i) {
        setPresList((p) => p.filter((_, idx) => idx !== i));
    }

    async function onSubmit(e) {
        e.preventDefault();
        const paciente = currentCrearPlanPacienteId || profile?.id_paciente || null
        const id_paciente = profile?.id_paciente || null;
        if (!titulo || !descripcion || !fechaInicio) {
            return alert("Completa todos los campos del plan");
        }
        if (!id_paciente) {
            return alert("Debe seleccionar un paciente");
        }
        // validar fecha no anterior a hoy
        const fechaInicioDate = new Date(fechaInicio);
        fechaInicioDate.setHours(0, 0, 0, 0);
        const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
        if (fechaInicioDate < hoy) {
            return alert("La fecha de inicio no puede ser anterior a hoy");
        }

        // filtrar prescripciones válidas
        const prescripciones = presList.filter(p => p.descripcion && p.tipo);

        setSubmitting(true);
        try {
            await createPlan({ titulo, descripcion, fecha_inicio: fechaInicio, id_paciente, prescripciones });
        } catch (err) {
            // error manejado en contexto
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal open={open} onClose={() => closeModal("crearPlan")} title="Crear Plan de Tratamiento">
            <form id="formCrearPlan" onSubmit={onSubmit}>
                <input type="hidden" id="plan_paciente_id" value={profile?.id_paciente || ""} readOnly />
                <div className="form-group">
                    <label htmlFor="plan_titulo">Título</label>
                    <input id="plan_titulo" required value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="plan_descripcion">Descripción</label>
                    <textarea id="plan_descripcion" rows="5" required value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="plan_fecha_inicio">Fecha inicio</label>
                    <input id="plan_fecha_inicio" type="date" required value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                </div>

                <div id="prescripcionesContainer">
                    <h4>Prescripciones / Indicaciones</h4>
                    <div id="presList">
                        {presList.map((p, i) => (
                            <div className="pres-row" key={i}>
                                <div className="form-group">
                                    <label>Tipo</label>
                                    <select value={p.tipo} onChange={(e) => updatePresAt(i, { tipo: e.target.value })}>
                                        <option value="">Selecciona</option>
                                        <option value="Tratamiento">Tratamiento</option>
                                        <option value="Indicacion">Indicación</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Descripción</label>
                                    <input value={p.descripcion} onChange={(e) => updatePresAt(i, { descripcion: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Frecuencia</label>
                                    <input value={p.frecuencia} onChange={(e) => updatePresAt(i, { frecuencia: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Duración</label>
                                    <input value={p.duracion} onChange={(e) => updatePresAt(i, { duracion: e.target.value })} />
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn-secondary" onClick={() => removePres(i)}>Eliminar</button>
                                </div>
                                <hr />
                            </div>
                        ))}
                    </div>
                    <button type="button" id="addPresBtn" className="btn-secondary" onClick={addPres}>+ Añadir prescripción</button>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Creando..." : "Crear Plan"}</button>
                    <button type="button" className="btn-secondary" onClick={() => closeModal("crearPlan")}>Cancelar</button>
                </div>
            </form>
        </Modal>
    );
}
