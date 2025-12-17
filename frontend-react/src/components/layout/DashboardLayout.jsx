// src/components/layout/DashboardLayout.jsx
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './DashboardLayout.module.css';

/**
 * Layout para todas las páginas del dashboard
 * Ahora solo maneja la redirección si no hay usuario
 */
export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Si no hay usuario, redirigir al login
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null; // O un loader mientras redirige
  }

  return (
    <div className="dashboard-layout">
      <Outlet />
    </div>
  );
}