/**
 * Constantes de la aplicación
 * Centraliza valores que se usan en múltiples lugares
 */

// Base URL de la API
export const API_BASE = "http://localhost:3000/api";

// Roles de usuario
export const USER_ROLES = {
  PACIENTE: 'paciente',
  MEDICO: 'medico',
  GESTOR_CASOS: 'gestor_casos',
  ADMIN: 'admin'
};

// Nombres legibles de roles
export const USER_ROLE_LABELS = {
  paciente: 'Paciente',
  medico: 'Médico',
  gestor_casos: 'Gestor de Casos',
  admin: 'Administrador'
};

// Tipos de registro de historia clínica
export const RECORD_TYPES = {
  GENERAL: 'general',
  CONSULTA: 'consulta',
  EVALUACION: 'evaluacion',
  SEGUIMIENTO: 'seguimiento',
  TRATAMIENTO: 'tratamiento',
  DIAGNOSTICO: 'diagnostico'
};

// Nombres legibles de tipos de registro
export const RECORD_TYPE_LABELS = {
  general: 'General',
  consulta: 'Consulta',
  evaluacion: 'Evaluación',
  seguimiento: 'Seguimiento',
  tratamiento: 'Tratamiento',
  diagnostico: 'Diagnóstico'
};

// Tipos de prescripciones
export const PRESCRIPTION_TYPES = {
  TRATAMIENTO: 'Tratamiento',
  INDICACION: 'Indicacion',
  MEDICACION: 'Medicacion',
  EJERCICIO: 'Ejercicio',
  DIETA: 'Dieta'
};

// Estados de planes
export const PLAN_STATUS = {
  ACTIVO: 'activo',
  COMPLETADO: 'completado',
  CANCELADO: 'cancelado',
  PENDIENTE: 'pendiente'
};

// Nombres legibles de estados
export const PLAN_STATUS_LABELS = {
  activo: 'Activo',
  completado: 'Completado',
  cancelado: 'Cancelado',
  pendiente: 'Pendiente'
};

// Géneros
export const GENDERS = {
  MASCULINO: 'M',
  FEMENINO: 'F',
  OTRO: 'O'
};

// Nombres legibles de géneros
export const GENDER_LABELS = {
  M: 'Masculino',
  F: 'Femenino',
  O: 'Otro'
};

// Rutas de la aplicación
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  HISTORIA: '/dashboard/historia',
  PLANES: '/dashboard/planes',
  PACIENTES: '/dashboard/pacientes',
  COMUNICACION: '/dashboard/comunicacion',
  PERFIL: '/dashboard/perfil',
  CONFIGURACION: '/dashboard/configuracion'
};

// Tiempos en milisegundos
export const TIMES = {
  TOAST_DURATION: 5000,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
  DEBOUNCE_DELAY: 300,
  LOADING_TIMEOUT: 10000
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  // Validación
  REQUIRED_FIELD: 'Este campo es obligatorio',
  INVALID_EMAIL: 'Ingresa un email válido',
  INVALID_PHONE: 'El teléfono debe tener 7-10 dígitos',
  INVALID_CI: 'El CI debe tener 10-11 dígitos',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres',
  PASSWORD_REQUIREMENTS: 'La contraseña debe incluir mayúsculas, números y caracteres especiales',
  PASSWORDS_DONT_MATCH: 'Las contraseñas no coinciden',
  
  // Autenticación
  LOGIN_FAILED: 'Credenciales incorrectas',
  SESSION_EXPIRED: 'Tu sesión ha expirado',
  UNAUTHORIZED: 'No tienes permiso para realizar esta acción',
  FORBIDDEN: 'Acceso denegado',
  
  // API
  NETWORK_ERROR: 'Error de conexión con el servidor',
  SERVER_ERROR: 'Error interno del servidor',
  NOT_FOUND: 'Recurso no encontrado',
  CONFLICT: 'El recurso ya existe',
  
  // Formularios
  FORM_INVALID: 'Por favor corrige los errores en el formulario',
  UPLOAD_FAILED: 'Error al subir el archivo',
  FILE_TOO_LARGE: 'El archivo es demasiado grande'
};

// Mensajes de éxito comunes
export const SUCCESS_MESSAGES = {
  // Autenticación
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  LOGOUT_SUCCESS: 'Sesión cerrada exitosamente',
  REGISTER_SUCCESS: 'Registro exitoso',
  
  // CRUD
  CREATE_SUCCESS: 'Registro creado exitosamente',
  UPDATE_SUCCESS: 'Registro actualizado exitosamente',
  DELETE_SUCCESS: 'Registro eliminado exitosamente',
  SAVE_SUCCESS: 'Cambios guardados exitosamente',
  
  // Operaciones específicas
  PATIENT_CREATED: 'Paciente registrado exitosamente',
  PLAN_CREATED: 'Plan de tratamiento creado exitosamente',
  RECORD_CREATED: 'Registro clínico creado exitosamente',
  GESTOR_ASSIGNED: 'Gestor asignado exitosamente',
  PRESCRIPTION_UPDATED: 'Prescripción actualizada exitosamente'
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZES: [5, 10, 20, 50],
  MAX_LIMIT: 100
};

// Expresiones regulares para validaciones
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\d{7,10}$/,
  CI: /^\d{10,11}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  NAME: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
  ALPHANUMERIC: /^[A-Za-z0-9\s]+$/,
  NUMERIC: /^\d+$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/
};

// Configuración de archivos
export const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx']
};

// Clases CSS comunes
export const CSS_CLASSES = {
  // Estados
  ACTIVE: 'active',
  DISABLED: 'disabled',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO: 'info',
  
  // Variantes de botones
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  OUTLINE: 'outline',
  DANGER: 'danger',
  
  // Tamaños
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg'
};

// Configuración de modales
export const MODAL_SIZES = {
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg',
  XLARGE: 'xl'
};

// Configuración de toast
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// LocalStorage keys
export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar-collapsed',
  SELECTED_PATIENT: 'selected-patient'
};

// Temas de la aplicación
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

// Idiomas soportados
export const LANGUAGES = {
  ES: 'es',
  EN: 'en'
};

// Meses en español
export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Días de la semana en español
export const WEEKDAYS = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

// Configuración de tablas
export const TABLE_CONFIG = {
  DEFAULT_SORT_FIELD: 'created_at',
  DEFAULT_SORT_ORDER: 'desc',
  MIN_ROWS: 5,
  MAX_ROWS: 100
};

// Estados de cumplimiento
export const COMPLIANCE_STATUS = {
  COMPLETED: true,
  PENDING: false
};

// Unidades de tiempo para prescripciones
export const TIME_UNITS = {
  HOURS: 'horas',
  DAYS: 'días',
  WEEKS: 'semanas',
  MONTHS: 'meses'
};

// Frecuencias comunes
export const FREQUENCIES = [
  'Una vez al día',
  'Dos veces al día',
  'Tres veces al día',
  'Cada 8 horas',
  'Cada 12 horas',
  'Cada 24 horas',
  'Cada 48 horas',
  'Una vez a la semana',
  'Dos veces a la semana',
  'Tres veces a la semana'
];

// Mediciones y unidades
export const MEASUREMENTS = {
  WEIGHT: 'kg',
  HEIGHT: 'cm',
  TEMPERATURE: '°C',
  PRESSURE_SYSTOLIC: 'mmHg',
  PRESSURE_DIASTOLIC: 'mmHg',
  HEART_RATE: 'lpm',
  OXYGEN_SATURATION: '%'
};

// Tipos de contacto de emergencia
export const EMERGENCY_CONTACT_TYPES = {
  FAMILY: 'familia',
  FRIEND: 'amigo',
  NEIGHBOR: 'vecino',
  WORK: 'trabajo',
  OTHER: 'otro'
};

// Exportar todo como objeto principal
export default {
  API_BASE,
  USER_ROLES,
  USER_ROLE_LABELS,
  RECORD_TYPES,
  RECORD_TYPE_LABELS,
  PRESCRIPTION_TYPES,
  PLAN_STATUS,
  PLAN_STATUS_LABELS,
  GENDERS,
  GENDER_LABELS,
  ROUTES,
  TIMES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PAGINATION,
  REGEX,
  FILE_CONFIG,
  CSS_CLASSES,
  MODAL_SIZES,
  TOAST_TYPES,
  STORAGE_KEYS,
  THEMES,
  LANGUAGES,
  MONTHS,
  WEEKDAYS,
  TABLE_CONFIG,
  COMPLIANCE_STATUS,
  TIME_UNITS,
  FREQUENCIES,
  MEASUREMENTS,
  EMERGENCY_CONTACT_TYPES
};