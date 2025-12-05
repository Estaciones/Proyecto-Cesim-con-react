// src/components/dashboard/modals/NuevoPacienteModal.jsx
import React, { useContext, useState, useEffect } from "react";
import Modal from "./Modal";
import { DashboardContext } from "../../../context/DashboardContext";

export default function NuevoPacienteModal() {
  const { modals, closeModal, createPatient, profile } = useContext(DashboardContext);
  const open = modals.nuevoPaciente;

  const [form, setForm] = useState({
    ci: "", nombre: "", apellido: "", genero: "", telefono: "",
    direccion: "", alergias: "", condiciones_cronicas: "",
    contacto_emergencia_nombre: "", contacto_emergencia_telefono: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (!open) setForm({ ci: "", nombre: "", apellido: "", genero: "", telefono: "", direccion: "", alergias: "", condiciones_cronicas: "", contacto_emergencia_nombre: "", contacto_emergencia_telefono: "" }); }, [open]);

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const payload = { ...form, id_medico: profile?.id_usuario };
    if (!payload.ci || !payload.nombre || !payload.apellido) {
      return alert("CI, nombre y apellido son obligatorios");
    }
    if (!payload.id_medico) return alert("No se pudo determinar el id del médico");

    setSubmitting(true);
    try {
      await createPatient(payload);
    } catch (err) {console.error("Error en NuevoPacienteModal:", err);}
    finally { setSubmitting(false); }
  }

  return (
    <Modal open={open} onClose={() => closeModal("nuevoPaciente")} title="Nuevo Paciente">
      <form id="formNuevoPaciente" onSubmit={onSubmit}>
        <div className="form-group"><label>CI</label><input name="ci" maxLength={11} required value={form.ci} onChange={onChange} /></div>
        <div className="form-group"><label>Nombre</label><input name="nombre" required value={form.nombre} onChange={onChange} /></div>
        <div className="form-group"><label>Apellido</label><input name="apellido" required value={form.apellido} onChange={onChange} /></div>
        <div className="form-group"><label>Género</label><select name="genero" value={form.genero} onChange={onChange}><option value="">Selecciona</option><option value="M">Masculino</option><option value="F">Femenino</option></select></div>
        <div className="form-group"><label>Teléfono</label><input name="telefono" maxLength={10} value={form.telefono} onChange={onChange} /></div>
        <hr />
        <div className="form-group"><label>Dirección</label><input name="direccion" value={form.direccion} onChange={onChange} /></div>
        <div className="form-group"><label>Alergias</label><input name="alergias" value={form.alergias} onChange={onChange} /></div>
        <div className="form-group"><label>Condiciones crónicas</label><input name="condiciones_cronicas" value={form.condiciones_cronicas} onChange={onChange} /></div>
        <div className="form-group"><label>Contacto emergencia (nombre)</label><input name="contacto_emergencia_nombre" value={form.contacto_emergencia_nombre} onChange={onChange} /></div>
        <div className="form-group"><label>Contacto emergencia (tel)</label><input name="contacto_emergencia_telefono" maxLength={10} value={form.contacto_emergencia_telefono} onChange={onChange} /></div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Creando..." : "Crear y Asignar paciente"}</button>
          <button type="button" className="btn-secondary" onClick={() => closeModal("nuevoPaciente")}>Cancelar</button>
        </div>
      </form>
    </Modal>
  );
}
