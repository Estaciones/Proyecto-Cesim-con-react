// src/components/dashboard/modals/Modal.jsx
import React, { useEffect, useRef } from "react";

/*
  Modal genérico:
  - children: contenido
  - open (bool): muestra/oculta
  - onClose(): callback para cerrar
  - title (opcional)
*/
export default function Modal({ open, onClose, title, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    // foco en primer input del modal
    setTimeout(() => {
      const first = dialogRef.current?.querySelector("input, textarea, select, button");
      first?.focus();
    }, 10);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-hidden="false" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="modal-body" ref={dialogRef}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">&times;</button>
        {title && <h3>{title}</h3>}
        <div>{children}</div>
      </div>
    </div>
  );
}
