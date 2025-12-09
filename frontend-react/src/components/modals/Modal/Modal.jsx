import React, { useEffect, useRef } from 'react';
import styles from './Modal.module.css';

export default function Modal({ 
  open, 
  onClose, 
  title, 
  children, 
  size = 'md',
  closeOnOverlayClick = true 
}) {
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  
  // Efecto solo para el Escape key
  useEffect(() => {
    if (!open) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);
  
  // Efecto solo para el scroll y focus inicial
  useEffect(() => {
    if (!open) return;
    
    document.body.style.overflow = 'hidden';
    
    // Solo enfocar al abrir
    const timer = setTimeout(() => {
      const firstFocusable = contentRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (firstFocusable && !firstFocusable.contains(document.activeElement)) {
        firstFocusable.focus();
      }
    }, 10);
    
    return () => {
      document.body.style.overflow = '';
      clearTimeout(timer);
    };
  }, [open]); // Solo depende de open
  
  if (!open) return null;
  
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === modalRef.current) {
      onClose?.();
    }
  };
  
  return (
    <div 
      ref={modalRef}
      className={styles.modalOverlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div 
        ref={contentRef}
        className={`${styles.modalContent} ${styles[size]}`}
      >
        <div className={styles.modalHeader}>
          {title && (
            <h2 id="modal-title" className={styles.modalTitle}>
              {title}
            </h2>
          )}
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        <div className={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );
}