// src/components/dashboard/DashboardHeader.jsx
import React, { useContext } from "react";
import { DashboardContext } from "../../context/DashboardContext";

/*
  Header del dashboard:
  - Muestra el nombre del usuario.
  - Botón de logout.
*/
export default function DashboardHeader({ onLogout }) {
  const { profile } = useContext(DashboardContext);

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1 className="header-title">Panel de Control</h1>
      </div>

      <div className="header-right">
        {profile && (
          <div className="user-info">
            <span className="user-name">
              {profile.nombre} {profile.apellido}
            </span>
            <span className="user-role">{profile.tipo_usuario}</span>
          </div>
        )}

        <button className="btn-logout" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
