import React, { useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { DashboardContext } from '../../context/DashboardContext';
import DashboardHeader from '../auth/dashboard/Header/Header';
import DashboardSidebar from '../auth/dashboard/Sidebar/Sidebar';
import './DashboardLayout.module.css';

/**
 * Layout para todas las páginas del dashboard
 * Incluye Header, Sidebar y contenido principal
 */
export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, profile, logout } = useContext(DashboardContext);

  // Si no hay usuario, redirigir al login
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null; // O un loader mientras redirige
  }

  return (
    <div className="dashboard-layout">
      <DashboardHeader 
        user={profile} 
        onLogout={handleLogout} 
      />
      
      <div className="dashboard-main-container">
        <DashboardSidebar />
        
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}