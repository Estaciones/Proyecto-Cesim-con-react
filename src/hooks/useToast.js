// src/hooks/useToast.js - Versión Actualizada
import { useState, useCallback } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((text, type = 'info', timeout = 3000) => {
    setToast({ text, type });
    if (timeout > 0) {
      setTimeout(() => setToast(null), timeout);
    }
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, hideToast };
}

// Exportar también como default para compatibilidad
export default useToast;