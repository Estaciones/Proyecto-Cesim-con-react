// src/components/dashboard/DashboardSidebar.jsx
import React from "react";

/*
  Sidebar del dashboard.
  - Usa props: activeSection y onNavigate(sectionName).
  - Las secciones posibles: historia, plan, pacientes, comunicacion.
*/
export default function DashboardSidebar({ activeSection, onNavigate }) {
  const options = [
    { id: "historia", label: "Historia Clínica", icon: "📘" },
    { id: "plan", label: "Planes", icon: "📝" },
    { id: "pacientes", label: "Pacientes", icon: "👥" },
    { id: "comunicacion", label: "Comunicación", icon: "💬" },
  ];

  return (
    <aside className="dashboard-sidebar">
      <nav className="sidebar-nav">
        {options.map((op) => (
          <button
            key={op.id}
            className={
              "sidebar-btn" +
              (activeSection === op.id ? " sidebar-btn-active" : "")
            }
            onClick={() => onNavigate(op.id)}
          >
            <span className="sidebar-icon">{op.icon}</span>
            {op.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
