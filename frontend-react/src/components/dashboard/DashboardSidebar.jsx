// src/components/dashboard/DashboardSidebar.jsx
import React, { useContext } from "react";
import { DashboardContext } from "../../context/DashboardContext";

/*
  Sidebar: construye los items según el rol (misma lógica que el JS original).
  Llamamos a onNavigate(sectionId) para cambiar la sección activa.
*/
export default function DashboardSidebar({ activeSection, onNavigate }) {
  const { profile } = useContext(DashboardContext);

  const role = profile?.tipo_usuario || profile?.tipo || "usuario";

  const getItems = () => {
    if (role === "paciente") {
      return [
        { id: "historia", label: "Mi Historia Clínica" },
        { id: "plan", label: "Mi Plan de Cuidados" },
        { id: "comunicacion", label: "Comunicación" },
      ];
    } else if (role === "medico") {
      return [
        { id: "pacientes", label: "Mis Pacientes" },
        { id: "historia", label: "Historias Clínicas" },
        { id: "plan", label: "Planes de Cuidado" },
        { id: "comunicacion", label: "Comunicación" },
      ];
    } else if (role === "gestor_casos" || role === "gestor_cuidados") {
      return [
        { id: "pacientes", label: "Pacientes Asignados" },
        { id: "historia", label: "Historias Clínicas" },
        { id: "plan", label: "Planes de Cuidado" },
        { id: "comunicacion", label: "Comunicación" },
      ];
    } else {
      return [{ id: "historia", label: "Historia Clínica" }];
    }
  };

  const items = getItems();

  return (
    <aside className="dashboard-sidebar">
      <nav>
        <ul id="navList">
          {items.map((it) => (
            <li
              key={it.id}
              className={`nav-item ${activeSection === it.id ? "active" : ""}`}
              data-section={it.id}
              onClick={() => onNavigate(it.id)}
            >
              {it.label}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
