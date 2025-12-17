// src/components/layout/AuthLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.css';

/**
 * Layout para páginas de autenticación (Login y Register)
 * Diseño centrado sin sidebar ni header
 */
export default function AuthLayout() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}