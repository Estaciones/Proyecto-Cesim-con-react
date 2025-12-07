import { useState, useCallback, useEffect } from "react"

/**
 * Tipos de toast disponibles
 * @typedef {'success'|'error'|'warning'|'info'} ToastType
 */

/**
 * Estructura de un toast
 * @typedef {Object} Toast
 * @property {string} id - ID único del toast
 * @property {string} message - Mensaje a mostrar
 * @property {ToastType} type - Tipo de toast
 * @property {number} duration - Duración en milisegundos
 * @property {number} createdAt - Timestamp de creación
 */

/**
 * Hook personalizado para manejar notificaciones toast
 * @param {Object} options - Opciones del hook
 * @param {number} options.defaultDuration - Duración por defecto en ms (default: 5000)
 * @param {number} options.maxToasts - Máximo de toasts visibles (default: 3)
 * @returns {Object} Estado y funciones de toast
 */
export function useToast(options = {}) {
  const { defaultDuration = 5000, maxToasts = 3 } = options

  const [toasts, setToasts] = useState([])
  const [paused, setPaused] = useState(false)

  /**
   * Generar ID único para toast
   * @returns {string} ID único
   */
  const generateId = useCallback(() => {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  /**
   * Mostrar un toast
   * @param {string} message - Mensaje a mostrar
   * @param {ToastType} type - Tipo de toast
   * @param {number} duration - Duración en ms (0 = permanente)
   *
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message, type = "info", duration = defaultDuration) => {
      const id = generateId()
      const newToast = {
        id,
        message,
        type,
        duration: duration === 0 ? null : duration,
        createdAt: Date.now()
      }

      setToasts((prev) => {
        const updatedToasts = [newToast, ...prev]

        // Limitar número de toasts visibles
        if (updatedToasts.length > maxToasts) {
          return updatedToasts.slice(0, maxToasts)
        }

        return updatedToasts
      })

      // Devolver función para eliminar este toast específico
      return () => removeToast(id)
    },
    [defaultDuration, generateId, maxToasts, removeToast]
  )

  /**
   * Mostrar toast de éxito
   * @param {string} message - Mensaje a mostrar
   * @param {number} duration - Duración en ms
   */
  const showSuccess = useCallback(
    (message, duration = defaultDuration) => {
      return showToast(message, "success", duration)
    },
    [showToast, defaultDuration]
  )

  /**
   * Mostrar toast de error
   * @param {string} message - Mensaje a mostrar
   * @param {number} duration - Duración en ms
   */
  const showError = useCallback(
    (message, duration = defaultDuration) => {
      return showToast(message, "error", duration)
    },
    [showToast, defaultDuration]
  )

  /**
   * Mostrar toast de advertencia
   * @param {string} message - Mensaje a mostrar
   * @param {number} duration - Duración en ms
   */
  const showWarning = useCallback(
    (message, duration = defaultDuration) => {
      return showToast(message, "warning", duration)
    },
    [showToast, defaultDuration]
  )

  /**
   * Mostrar toast informativo
   * @param {string} message - Mensaje a mostrar
   * @param {number} duration - Duración en ms
   */
  const showInfo = useCallback(
    (message, duration = defaultDuration) => {
      return showToast(message, "info", duration)
    },
    [showToast, defaultDuration]
  )

  /**
   * Eliminar toast por ID
   * @param {string} id - ID del toast a eliminar
   */

  /**
   * Eliminar todos los toasts
   */
  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  /**
   * Pausar/Reanudar toasts
   * @param {boolean} pause - Estado de pausa
   */
  const pauseToasts = useCallback((pause = true) => {
    setPaused(pause)
  }, [])

  /**
   * Obtener clase CSS según tipo de toast
   * @param {ToastType} type - Tipo de toast
   * @returns {string} Clase CSS
   */
  const getToastClass = useCallback((type) => {
    const classes = {
      success: "toast-success",
      error: "toast-error",
      warning: "toast-warning",
      info: "toast-info"
    }
    return classes[type] || "toast-info"
  }, [])

  /**
   * Obtener icono según tipo de toast
   * @param {ToastType} type - Tipo de toast
   * @returns {string} Emoji del icono
   */
  const getToastIcon = useCallback((type) => {
    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️"
    }
    return icons[type] || "ℹ️"
  }, [])

  // Manejar auto-eliminación de toasts
  useEffect(() => {
    if (paused || toasts.length === 0) return

    const timeouts = toasts
      .filter((toast) => toast.duration && toast.duration > 0)
      .map((toast) => {
        const timeLeft = toast.duration - (Date.now() - toast.createdAt)

        if (timeLeft <= 0) {
          removeToast(toast.id)
          return null
        }

        return setTimeout(() => {
          removeToast(toast.id)
        }, timeLeft)
      })
      .filter((timeout) => timeout !== null)

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [toasts, paused, removeToast])

  /**
   * Componente Toast (para usar en la UI)
   * @param {Object} props - Propiedades del componente
   */
  const ToastComponent = ({ position = "top-right", className = "" }) => {
    const positionClasses = {
      "top-right": "toast-container-top-right",
      "top-left": "toast-container-top-left",
      "bottom-right": "toast-container-bottom-right",
      "bottom-left": "toast-container-bottom-left",
      "top-center": "toast-container-top-center",
      "bottom-center": "toast-container-bottom-center"
    }

    if (toasts.length === 0) return null

    return (
      <div
        className={`toast-container ${
          positionClasses[position] || "toast-container-top-right"
        } ${className}`}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast ${getToastClass(toast.type)}`}
            role="alert"
            aria-live="polite"
            onClick={() => removeToast(toast.id)}>
            <div className="toast-icon">{getToastIcon(toast.type)}</div>
            <div className="toast-content">
              <p className="toast-message">{toast.message}</p>
            </div>
            <button
              className="toast-close"
              onClick={(e) => {
                e.stopPropagation()
                removeToast(toast.id)
              }}
              aria-label="Cerrar notificación">
              ×
            </button>
          </div>
        ))}
      </div>
    )
  }

  return {
    // Estado
    toasts,
    paused,

    // Funciones principales
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAllToasts,
    pauseToasts,

    // Funciones auxiliares
    getToastClass,
    getToastIcon,

    // Componente
    ToastComponent,

    // Información
    hasToasts: toasts.length > 0,
    toastCount: toasts.length
  }
}

export default useToast
