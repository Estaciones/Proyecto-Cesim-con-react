import React, { useEffect, useRef } from 'react';
import styles from './Modal.module.css';

/**
 * Modal genérico reutilizable
 * @param {Object} props
 * @param {boolean} props.open - Estado de visibilidad del modal
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {string} props.title - Título del modal (opcional)
 * @param {React.ReactNode} props.children - Contenido del modal
 * @param {string} props.size - Tamaño del modal: 'sm', 'md', 'lg' (opcional, default 'md')
 * @param {boolean} props.closeOnOverlayClick - Si se cierra al hacer clic fuera (default true)
 */
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

  // Cerrar modal con Escape
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';

    // Enfocar el modal cuando se abre
    setTimeout(() => {
      const firstFocusable = contentRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

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