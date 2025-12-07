import React from 'react';
import styles from './Card.module.css';

export default function Card({
  children,
  padding = 'medium',
  elevation = 'medium',
  hoverable = false,
  className = '',
  onClick,
  ...props
}) {
  const paddingClass = styles[`padding-${padding}`] || styles['padding-medium'];
  const elevationClass = styles[`elevation-${elevation}`] || styles['elevation-medium'];
  const hoverableClass = hoverable ? styles.hoverable : '';
  const clickableClass = onClick ? styles.clickable : '';

  return (
    <div
      className={`${styles.card} ${paddingClass} ${elevationClass} ${hoverableClass} ${clickableClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}