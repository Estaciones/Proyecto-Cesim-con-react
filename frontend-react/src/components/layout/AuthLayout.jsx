import React from 'react';
import { Outlet } from 'react-router-dom';
import './AuthLayout.module.css';

/**
 * Layout para páginas de autenticación (Login y Register)
 * Diseño centrado sin sidebar ni header
 */
export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-background">
        {/* Puedes agregar un fondo decorativo aquí */}
      </div>
      <div className="auth-content">
        <Outlet />
      </div>
    </div>
  );
}