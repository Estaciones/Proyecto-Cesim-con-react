// src/components/layout/AppLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import '../../styles/index.css';

/**
 * Layout principal de la aplicación
 * Contiene la estructura base y renderiza las páginas hijas
 */
export default function AppLayout() {
  return (
    <div className="app-container">
      <Outlet />
    </div>
  );
}