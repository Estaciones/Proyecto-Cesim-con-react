// src/components/dashboard/DashboardHeader.jsx
import React, { useContext } from "react";
import { DashboardContext } from "../../context/DashboardContext";

/*
  Header separado para mayor claridad.
  Recibe onLogout prop desde el Dashboard contenedor (para navegar).
*/
export default function DashboardHeader({ onLogout }) {
  const { profile } = useContext(DashboardContext);

  const userName = profile?.nombre_usuario || profile?.email || "Usuario";
  const role = (profile?.tipo_usuario || profile?.tipo || "usuario").toUpperCase();

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1 id="appTitle">Panel</h1>
        <span id="userWelcome">Bienvenido, <strong id="userName">{userName}</strong></span>
      </div>
      <div className="header-right">
        <span id="userRole" className="badge">{role === "GESTOR_CASOS" ? "GESTOR DE CASOS" : role}</span>
        <button id="logoutBtn" className="btn-ghost" onClick={onLogout}>Cerrar Sesión</button>
      </div>
    </header>
  );
}
