// src/components/dashboard/Dashboard.jsx
import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardContext } from "../../context/DashboardContext";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import Historia from "./sections/Historia";
import Planes from "./sections/Planes";
import Pacientes from "./sections/Pacientes";
import "../../styles/dashboard.css"; // coloca aquí tu CSS (ver nota abajo)
import RegistroModal from "./modals/RegistroModal";
import CrearPlanModal from "./modals/CrearPlanModal";
import NuevoPacienteModal from "./modals/NuevoPacienteModal";
import AsignarGestorModal from "./modals/AsignarGestorModal";
import EditPresModal from "./modals/EditPresModal";
import EditHistoriaModal from "./modals/EditHistoriaModal";
import ViewHistoriaModal from "./modals/ViewHistoriaModal";
import ViewPlanModal from "./modals/ViewPlanModal";

/*
  Dashboard: página contenedora.
  - Se usa DashboardContext para el estado global.
  - Redirige a /login si no hay usuario.
  - Muestra Header, Sidebar y la sección activa (historia/plan/pacientes/comunicacion).
*/
export default function Dashboard() {
    const navigate = useNavigate();
    const { user, profile, activeSection, setActiveSection, loadProfile, logout } = useContext(DashboardContext);

    useEffect(() => {
        // si no hay usuario en contexto, redirige al login
        if (!user) {
            navigate("/login");
        } else {
            // asegurar que profile esté cargado
            (async () => {
                await loadProfile();
            })();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    if (!user) return null; // o un fallback loading

    return (
        <div className="dashboard-container">
            <DashboardHeader onLogout={() => { logout(); navigate("/login"); }} />
            <div className="dashboard-inner">
                <DashboardSidebar activeSection={activeSection} onNavigate={(section) => setActiveSection(section)} />
                <main className="dashboard-main">
                    {activeSection === "historia" && <Historia />}
                    {activeSection === "plan" && <Planes />}
                    {activeSection === "pacientes" && <Pacientes />}
                    {activeSection === "comunicacion" && (
                        <section className="content-section">
                            <h2>Comunicación</h2>
                            <div className="section-content">
                                <p>Funcionalidad próximamente.</p>
                            </div>
                        </section>
                    )}
                </main>
            </div>

            {/* Toast simple (visual) */}
            <ToastPlaceholder />
            <RegistroModal />
            <CrearPlanModal />
            <NuevoPacienteModal />
            <AsignarGestorModal />
            <EditPresModal />
            <EditHistoriaModal />
            <ViewHistoriaModal />
            <ViewPlanModal />
        </div>
    );
}

/* Pequeño placeholder para mostrar un toast desde el context (puedes reemplazar por un componente mejor) */
function ToastPlaceholder() {
    const { toast } = React.useContext(DashboardContext);
    if (!toast) return null;
    const style = {
        position: "fixed",
        right: 20,
        bottom: 20,
        padding: "10px 14px",
        borderRadius: 8,
        color: "#fff",
        background: toast.type === "error" ? "#ff6b6b" : toast.type === "success" ? "#2ed573" : "#0b84ff",
        zIndex: 9999,
    };
    return <div style={style}>{toast.text}</div>;
}
