// src/components/dashboard/modals/CrearPlanModal.jsx
import React, { useContext, useState, useEffect } from "react";
import Modal from "./Modal";
import { DashboardContext } from "../../../context/DashboardContext";

/*
  Implementa prescripciones como array de objetos en estado local.
  Cada prescripción tiene: tipo, descripcion, frecuencia, duracion.
*/
export default function CrearPlanModal() {
    const { modals, closeModal, createPlan, profile, currentCrearPlanPacienteId, patients } = useContext(DashboardContext);
    const open = modals.crearPlan;

    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [presList, setPresList] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) {
            setTitulo("");
            setDescripcion("");
            setFechaInicio("");
            setPresList([]);
            setSelectedPatient("");
        } else {
            // Si hay paciente preseleccionado por contexto, asignarlo
            if (currentCrearPlanPacienteId) {
                setSelectedPatient(currentCrearPlanPacienteId.toString());
            } else if (profile?.id_paciente) {
                // Si el usuario actual es un paciente, usar su propio ID
                setSelectedPatient(profile.id_paciente.toString());
            }
        }
    }, [open, currentCrearPlanPacienteId, profile]);

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

        // Usar currentCrearPlanPacienteId si está presente, sino usar el paciente seleccionado en el select
        let id_paciente = null;

        if (currentCrearPlanPacienteId) {
            // Si viene del contexto (paciente preseleccionado)
            id_paciente = currentCrearPlanPacienteId;
        } else if (selectedPatient) {
            // Si el usuario seleccionó un paciente manualmente
            id_paciente = parseInt(selectedPatient);
        } else if (profile?.id_paciente) {
            // Si el usuario actual es un paciente
            id_paciente = profile.id_paciente;
        }

        if (!titulo || !descripcion || !fechaInicio) {
            return alert("Completa todos los campos del plan");
        }

        if (!id_paciente) {
            return alert("Debe seleccionar un paciente");
        }

        // Validar fecha no anterior a hoy
        const fechaInicioDate = new Date(fechaInicio);
        fechaInicioDate.setHours(0, 0, 0, 0);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (fechaInicioDate < hoy) {
            return alert("La fecha de inicio no puede ser anterior a hoy");
        }

        // Filtrar prescripciones válidas
        const prescripciones = presList.filter(p => p.descripcion && p.tipo);

        setSubmitting(true);
        try {
            await createPlan({
                titulo,
                descripcion,
                fecha_inicio: fechaInicio,
                id_paciente,
                prescripciones
            });
        } catch (err) {
            console.error("Error en CrearPlanModal:", err);
        } finally {
            setSubmitting(false);
        }
    }

    // Filtrar pacientes disponibles (si el usuario no es paciente)
    const availablePatients = patients?.filter(p =>
        !profile?.id_paciente || p.id_paciente === profile.id_paciente
    ) || [];

    return (
        <Modal open={open} onClose={() => closeModal("crearPlan")} title="Crear Plan de Tratamiento">
            <form id="formCrearPlan" onSubmit={onSubmit}>
                <div className="form-group">
                    <label htmlFor="plan_titulo">Título</label>
                    <input
                        id="plan_titulo"
                        required
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Ej: Plan de tratamiento post-operatorio"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="plan_descripcion">Descripción</label>
                    <textarea
                        id="plan_descripcion"
                        rows="5"
                        required
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Descripción detallada del plan de tratamiento..."
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="plan_fecha_inicio">Fecha inicio</label>
                    <input
                        id="plan_fecha_inicio"
                        type="date"
                        required
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                    />
                </div>

                {/* Selector de paciente - solo mostrar si el usuario no es paciente y no hay paciente preseleccionado */}
                {!profile?.id_paciente && (
                    <div className="form-group">
                        <label htmlFor="plan_paciente">Paciente</label>
                        {currentCrearPlanPacienteId ? (
                            <div>
                                <input
                                    type="text"
                                    value={patients?.find(p => p.id_paciente === currentCrearPlanPacienteId)?.nombre || "Paciente seleccionado"}
                                    readOnly
                                    disabled
                                />
                                <small style={{ color: '#666' }}>Paciente preseleccionado desde la lista</small>
                            </div>
                        ) : (
                            <select
                                id="plan_paciente"
                                required
                                value={selectedPatient}
                                onChange={(e) => setSelectedPatient(e.target.value)}
                            >
                                <option value="">Seleccione un paciente</option>
                                {availablePatients.map(patient => (
                                    <option key={patient.id_paciente} value={patient.id_paciente}>
                                        {patient.nombre} {patient.apellido} - CI: {patient.ci}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                )}

                {/* Campo oculto para pacientes que son pacientes */}
                {profile?.id_paciente && (
                    <input
                        type="hidden"
                        id="plan_paciente_id"
                        value={profile.id_paciente}
                        readOnly
                    />
                )}

                <div id="prescripcionesContainer">
                    <h4>Prescripciones / Indicaciones</h4>
                    <div id="presList">
                        {presList.map((p, i) => (
                            <div className="pres-row" key={i} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '4px' }}>
                                <div className="form-group">
                                    <label>Tipo</label>
                                    <select value={p.tipo} onChange={(e) => updatePresAt(i, { tipo: e.target.value })}>
                                        <option value="">Selecciona</option>
                                        <option value="Tratamiento">Tratamiento</option>
                                        <option value="Indicacion">Indicación</option>
                                        <option value="Medicacion">Medicación</option>
                                        <option value="Ejercicio">Ejercicio</option>
                                        <option value="Dieta">Dieta</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Descripción</label>
                                    <input
                                        value={p.descripcion}
                                        onChange={(e) => updatePresAt(i, { descripcion: e.target.value })}
                                        placeholder="Descripción detallada de la prescripción"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Frecuencia</label>
                                    <input
                                        value={p.frecuencia}
                                        onChange={(e) => updatePresAt(i, { frecuencia: e.target.value })}
                                        placeholder="Ej: 3 veces al día, cada 8 horas"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Duración</label>
                                    <input
                                        value={p.duracion}
                                        onChange={(e) => updatePresAt(i, { duracion: e.target.value })}
                                        placeholder="Ej: 7 días, 2 semanas"
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn-secondary" onClick={() => removePres(i)}>Eliminar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button type="button" id="addPresBtn" className="btn-secondary" onClick={addPres} style={{ marginTop: '10px' }}>
                        + Añadir prescripción
                    </button>
                </div>

                <div className="form-actions" style={{ marginTop: '20px' }}>
                    <button type="submit" className="btn-primary" disabled={submitting}>
                        {submitting ? "Creando..." : "Crear Plan"}
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => closeModal("crearPlan")}>
                        Cancelar
                    </button>
                </div>
            </form>
        </Modal>
    );
}