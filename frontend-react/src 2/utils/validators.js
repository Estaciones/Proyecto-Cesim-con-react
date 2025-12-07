/**
 * Funciones de validación para formularios y datos
 */

import { REGEX } from './constants';

/**
 * Valida si un campo es requerido
 * @param {*} value - Valor a validar
 * @param {string} fieldName - Nombre del campo (opcional, para mensajes)
 * @returns {string|null} Mensaje de error o null si es válido
 */
export function validateRequired(value, fieldName = 'Este campo') {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} es obligatorio`;
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldName} es obligatorio`;
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return `${fieldName} es obligatorio`;
  }
  
  return null;
}

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {string|null} Mensaje de error o null si es válido
 */
export function validateEmail(email) {
  if (!email) return null; // No validar si está vacío (usar required para eso)
  
  if (!REGEX.EMAIL.test(email)) {
    return 'Ingresa un email válido';
  }
  
  return null;
}

/**
 * Valida un número de teléfono
 * @param {string} phone - Teléfono a validar
 * @returns {string|null} Mensaje de error o null si es válido
 */
export function validatePhone(phone) {
  if (!phone) return null;
  
  if (!REGEX.PHONE.test(phone)) {
    return 'El teléfono debe tener entre 7 y 10 dígitos';
  }
  
  return null;
}

/**
 * Valida un número de CI (Carnet de Identidad)
 * @param {string} ci - CI a validar
 * @returns {string|null} Mensaje de error o null si es válido
 */
export function validateCI(ci) {
  if (!ci) return 'El CI es obligatorio';
  
  if (!REGEX.CI.test(ci)) {
    return 'El CI debe tener entre 10 y 11 dígitos';
  }
  
  return null;
}

/**
 * Valida una contraseña
 * @param {string} password - Contraseña a validar
 * @param {Object} options - Opciones de validación
 * @returns {string|null} Mensaje de error o null si es válido
 */
export function validatePassword(password, options = {}) {
  const {
    minLength = 8,
    requireUppercase = true,
    requireNumber = true,
    requireSpecial = true
  } = options;
  
  if (!password) return 'La contraseña es obligatoria';
  
  if (password.length < minLength) {
    return `La contraseña debe tener al menos ${minLength} caracteres`;
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    return 'La contraseña debe incluir al menos una letra mayúscula';
  }
  
  if (requireNumber && !/\d/.test(password)) {
    return 'La contraseña debe incluir al menos un número';
  }
  
  if (requireSpecial && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return 'La contraseña debe incluir al menos un carácter especial';
  }
  
  return null;
}

/**
 * Valida que dos contraseñas coincidan
 * @param {string} password - Contraseña
 * @param {string} confirmPassword - Confirmación de contraseña
 * @returns {string|null} Mensaje de error o null si es válido
 */
export function validatePasswordMatch(password, confirmPassword) {
  if (!password || !confirmPassword) return null;
  
  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden';
  }
  
  return null;
}

/**
 * Valida una fecha
 * @param {string|Date} date - Fecha a validar
 * @param {Object} options - Opciones de validación
 * @returns {string|null} Mensaje de error o null si es válido
 */
export function validateDate(date, options = {}) {
  const {
    minDate = null,
    maxDate = null,
    required = true,
    futureOnly = false,
    pastOnly = false
  } = options;
  
  if (!date && !required) return null;
  
  if (!date) return 'La fecha es obligatoria';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'La fecha no es válida';
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (futureOnly && dateObj < today) {
    return 'La fecha debe ser futura';
  }
  
  if (pastOnly && dateObj > today) {
    return 'La fecha debe ser pasada';
  }
  
  if (minDate) {
    const minDateObj = minDate instanceof Date ? minDate : new Date(minDate);
    if (dateObj < minDateObj) {
      return `La fecha debe ser posterior a ${minDateObj.toLocaleDateString('es-ES')}`;
    }
  }
  
  if (maxDate) {
    const maxDateObj = maxDate instanceof Date ? maxDate : new Date(maxDate);
    if (dateObj > maxDateObj) {
      return `La fecha debe ser anterior a ${maxDateObj.toLocaleDateString('es-ES')}`;
    }
  }
  
  return null;
}

/**
 * Valida un número
 * @param {*} value - Valor a validar
 * @param {Object} options - Opciones de validación
 * @returns {string|null} Mensaje de error o null si es válido
 */
export function validateNumber(value, options = {}) {
  const {
    min = null,
    max = null,
    required = true,
    integer = false,
    positive = false
  } = options;
  
  if ((value === null || value === undefined || value === '') && !required) {
    return null;
  }
  
  if (value === null || value === undefined || value === '') {
    return 'Este campo es obligatorio';
  }
  
  const num = Number(value);
  
  if (isNaN(num)) {
    return 'Debe ser un número válido';
  }
  
  if (integer && !Number.isInteger(num)) {
    return 'Debe ser un número entero';
  }
  
  if (positive && num <= 0) {
    return 'Debe ser un número positivo';
  }
  
  if (min !== null && num < min) {
    return `El valor mínimo es ${min}`;
  }
  
  if (max !== null && num > max) {
    return `El valor máximo es ${max}`;
  }
  
  return null;
}

/**
 * Valida un texto (solo letras y espacios)
 * @param {string} text - Texto a validar
 * @param {Object} options - Opciones de validación
 * @returns {string|null} Mensaje de error o null si es válido
 */
export function validateText(text, options = {}) {
  const {
    minLength = null,
    maxLength = null,
    required = true,
    allowNumbers = false,
    allowSpaces = true
  } = options;
  
  if (!text && !required) return null;
  
  if (!text) return 'Este campo es obligatorio';
  
  const trimmed = text.trim();
  
  if (minLength !== null && trimmed.length < minLength) {
    return `Mínimo ${minLength} caracteres`;
  }
  
  if (maxLength !== null && trimmed.length > maxLength) {
    return `Máximo ${maxLength} caracteres`;
  }
  
  // Validar caracteres permitidos
  let pattern = 'A-Za-zÁÉÍÓÚáéíóúÑñ';
  if (allowNumbers) pattern += '0-9';
  if (allowSpaces) pattern += '\\s';
  
  const regex = new RegExp(`^[${pattern}]+$`);
  
  if (!regex.test(trimmed)) {
    let message = 'Solo se permiten letras';
    if (allowNumbers) message += ' y números';
    if (allowSpaces) message += ' y espacios';
    return message;
  }
  
  return null;
}

/**
 * Valida una URL
 * @param {string} url - URL a validar
 * @returns {string|null} Mensaje de error o null si es válido
 */
export function validateURL(url) {
  if (!url) return null;
  
  try {
    new URL(url);
    return null;
  } catch {
    return 'La URL no es válida';
  }
}

/**
 * Valida un archivo
 * @param {File} file - Archivo a validar
 * @param {Object} options - Opciones de validación
 * @returns {string|null} Mensaje de error o null si es válido
 */
export function validateFile(file, options = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB por defecto
    allowedTypes = [],
    allowedExtensions = []
  } = options;
  
  if (!file) return 'No se seleccionó ningún archivo';
  
  // Validar tamaño
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return `El archivo es demasiado grande (máximo ${maxSizeMB}MB)`;
  }
  
  // Validar tipo MIME
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`;
  }
  
  // Validar extensión
  if (allowedExtensions.length > 0) {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return `Extensión no permitida. Extensiones permitidas: ${allowedExtensions.join(', ')}`;
    }
  }
  
  return null;
}

/**
 * Valida un formulario completo
 * @param {Object} formData - Datos del formulario
 * @param {Object} validationRules - Reglas de validación por campo
 * @returns {Object} Objeto con errores y validez
 */
export function validateForm(formData, validationRules) {
  const errors = {};
  let isValid = true;
  
  Object.keys(validationRules).forEach(fieldName => {
    const value = formData[fieldName];
    const rules = validationRules[fieldName];
    
    if (!rules) return;
    
    for (const rule of rules) {
      let error = null;
      
      if (typeof rule === 'function') {
        error = rule(value, formData);
      } else if (rule === 'required') {
        error = validateRequired(value, fieldName);
      } else if (rule === 'email') {
        error = validateEmail(value);
      } else if (rule === 'phone') {
        error = validatePhone(value);
      } else if (rule === 'ci') {
        error = validateCI(value);
      } else if (rule.startsWith('min:')) {
        const min = parseInt(rule.split(':')[1]);
        error = validateNumber(value, { min, required: false });
      } else if (rule.startsWith('max:')) {
        const max = parseInt(rule.split(':')[1]);
        error = validateNumber(value, { max, required: false });
      } else if (rule.startsWith('minLength:')) {
        const minLength = parseInt(rule.split(':')[1]);
        if (value && value.length < minLength) {
          error = `Mínimo ${minLength} caracteres`;
        }
      } else if (rule.startsWith('maxLength:')) {
        const maxLength = parseInt(rule.split(':')[1]);
        if (value && value.length > maxLength) {
          error = `Máximo ${maxLength} caracteres`;
        }
      }
      
      if (error) {
        errors[fieldName] = error;
        isValid = false;
        break;
      }
    }
  });
  
  return { errors, isValid };
}

/**
 * Valida los datos de registro de usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Object} Objeto con errores y validez
 */
export function validateUserRegistration(userData) {
  const errors = {};
  
  // Nombre de usuario
  errors.nombre_usuario = validateRequired(userData.nombre_usuario, 'Nombre de usuario');
  
  // Email
  errors.email = validateRequired(userData.email, 'Email') || validateEmail(userData.email);
  
  // Contraseña
  errors.password = validatePassword(userData.password);
  
  // Confirmar contraseña
  if (userData.confirmPassword) {
    errors.confirmPassword = validatePasswordMatch(userData.password, userData.confirmPassword);
  }
  
  // Nombre
  errors.nombre = validateRequired(userData.nombre, 'Nombre');
  
  // Apellidos
  errors.apellidos = validateRequired(userData.apellidos, 'Apellidos');
  
  // Género
  errors.genero = validateRequired(userData.genero, 'Género');
  
  // CI
  errors.ci = validateCI(userData.ci);
  
  // Teléfono
  if (userData.telefono) {
    errors.telefono = validatePhone(userData.telefono);
  }
  
  // Tipo de usuario
  errors.tipo_usuario = validateRequired(userData.tipo_usuario, 'Tipo de usuario');
  
  // Filtrar errores nulos
  const filteredErrors = Object.fromEntries(
    Object.entries(errors).filter(([, value]) => value !== null)
  );
  
  return {
    errors: filteredErrors,
    isValid: Object.keys(filteredErrors).length === 0
  };
}

/**
 * Valida los datos de un paciente
 * @param {Object} patientData - Datos del paciente
 * @returns {Object} Objeto con errores y validez
 */
export function validatePatient(patientData) {
  const errors = {};
  
  // CI
  errors.ci = validateCI(patientData.ci);
  
  // Nombre
  errors.nombre = validateRequired(patientData.nombre, 'Nombre');
  
  // Apellido
  errors.apellido = validateRequired(patientData.apellido, 'Apellido');
  
  // Teléfono
  if (patientData.telefono) {
    errors.telefono = validatePhone(patientData.telefono);
  }
  
  // Email
  if (patientData.email) {
    errors.email = validateEmail(patientData.email);
  }
  
  // Filtrar errores nulos
  const filteredErrors = Object.fromEntries(
    Object.entries(errors).filter(([, value]) => value !== null)
  );
  
  return {
    errors: filteredErrors,
    isValid: Object.keys(filteredErrors).length === 0
  };
}

/**
 * Valida los datos de un registro clínico
 * @param {Object} recordData - Datos del registro
 * @returns {Object} Objeto con errores y validez
 */
export function validateMedicalRecord(recordData) {
  const errors = {};
  
  // Título
  errors.titulo = validateRequired(recordData.titulo, 'Título');
  
  // Descripción
  errors.descripcion = validateRequired(recordData.descripcion, 'Descripción');
  
  // Tipo
  errors.tipo = validateRequired(recordData.tipo, 'Tipo de registro');
  
  // Filtrar errores nulos
  const filteredErrors = Object.fromEntries(
    Object.entries(errors).filter(([, value]) => value !== null)
  );
  
  return {
    errors: filteredErrors,
    isValid: Object.keys(filteredErrors).length === 0
  };
}

/**
 * Valida los datos de un plan de tratamiento
 * @param {Object} planData - Datos del plan
 * @returns {Object} Objeto con errores y validez
 */
export function validateTreatmentPlan(planData) {
  const errors = {};
  
  // Título
  errors.titulo = validateRequired(planData.titulo, 'Título');
  
  // Descripción
  errors.descripcion = validateRequired(planData.descripcion, 'Descripción');
  
  // Fecha de inicio
  errors.fecha_inicio = validateDate(planData.fecha_inicio, {
    required: true,
    futureOnly: true
  });
  
  // ID del paciente
  errors.id_paciente = validateRequired(planData.id_paciente, 'Paciente');
  
  // Prescripciones
  if (!planData.prescripciones || planData.prescripciones.length === 0) {
    errors.prescripciones = 'Debe agregar al menos una prescripción';
  } else {
    planData.prescripciones.forEach((pres, index) => {
      if (!pres.descripcion || pres.descripcion.trim() === '') {
        errors[`prescripcion_${index}_descripcion`] = 'La descripción es obligatoria';
      }
      if (!pres.tipo || pres.tipo.trim() === '') {
        errors[`prescripcion_${index}_tipo`] = 'El tipo es obligatorio';
      }
    });
  }
  
  // Filtrar errores nulos
  const filteredErrors = Object.fromEntries(
    Object.entries(errors).filter(([, value]) => value !== null)
  );
  
  return {
    errors: filteredErrors,
    isValid: Object.keys(filteredErrors).length === 0
  };
}

/**
 * Sanitiza un texto para prevenir XSS
 * @param {string} text - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
export function sanitizeText(text) {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitiza un objeto completo recursivamente
 * @param {*} data - Datos a sanitizar
 * @returns {*} Datos sanitizados
 */
export function sanitizeObject(data) {
  if (typeof data === 'string') {
    return sanitizeText(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeObject(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const key in data) {
      sanitized[key] = sanitizeObject(data[key]);
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Normaliza un texto (quita acentos, convierte a minúsculas)
 * @param {string} text - Texto a normalizar
 * @returns {string} Texto normalizado
 */
export function normalizeText(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita acentos
    .trim();
}

/**
 * Exportar todas las funciones de validación
 */
export default {
  validateRequired,
  validateEmail,
  validatePhone,
  validateCI,
  validatePassword,
  validatePasswordMatch,
  validateDate,
  validateNumber,
  validateText,
  validateURL,
  validateFile,
  validateForm,
  validateUserRegistration,
  validatePatient,
  validateMedicalRecord,
  validateTreatmentPlan,
  sanitizeText,
  sanitizeObject,
  normalizeText
};