import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from './Modal.module.css';

const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  const sizeClass = styles[`modal-${size}`];
  const modalRoot = document.getElementById('modal-root');

  if (!modalRoot) {
    console.error('Modal root no encontrado');
    return null;
  }

  return ReactDOM.createPortal(
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.wrapper}>
        <div className={`${styles.modal} ${sizeClass}`} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button className={styles.close} onClick={onClose} aria-label="Cerrar">
              ×
            </button>
          </div>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </>,
    modalRoot
  );
};

export default Modal;