import React from 'react';
import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button',
  startIcon,
  endIcon,
  ...props
}) {
  const variantClass = styles[variant] || styles.primary;
  const sizeClass = styles[size] || styles.medium;
  const widthClass = fullWidth ? styles.fullWidth : '';
  const loadingClass = loading ? styles.loading : '';
  const disabledClass = disabled ? styles.disabled : '';

  return (
    <button
      type={type}
      className={`${styles.button} ${variantClass} ${sizeClass} ${widthClass} ${loadingClass} ${disabledClass} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className={styles.spinner}></span>}
      {startIcon && !loading && <span className={styles.startIcon}>{startIcon}</span>}
      <span className={styles.content}>{children}</span>
      {endIcon && !loading && <span className={styles.endIcon}>{endIcon}</span>}
    </button>
  );
}