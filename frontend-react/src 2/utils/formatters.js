/**
 * Funciones de formato para datos
 * Convierte datos crudos en formatos amigables para mostrar
 */

import { 
  GENDER_LABELS, 
  USER_ROLE_LABELS, 
  RECORD_TYPE_LABELS, 
  PLAN_STATUS_LABELS,
  MONTHS,
  WEEKDAYS
} from './constants';

/**
 * Formatea una fecha en formato local
 * @param {string|Date} date - Fecha a formatear
 * @param {Object} options - Opciones de formato
 * @returns {string} Fecha formateada
 */
export function formatDate(date, options = {}) {
  if (!date) return 'No disponible';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Validar fecha
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }
  
  const {
    includeTime = false,
    short = false,
    locale = 'es-ES'
  } = options;
  
  if (short) {
    return dateObj.toLocaleDateString(locale);
  }
  
  if (includeTime) {
    return dateObj.toLocaleString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return dateObj.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Formatea una fecha en formato extenso
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha formateada extensa
 */
export function formatDateLong(date) {
  if (!date) return 'No disponible';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }
  
  const day = dateObj.getDate();
  const month = MONTHS[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  const weekday = WEEKDAYS[dateObj.getDay()];
  
  return `${weekday}, ${day} de ${month} de ${year}`;
}

/**
 * Formatea una hora
 * @param {string|Date} date - Fecha/hora a formatear
 * @returns {string} Hora formateada
 */
export function formatTime(date) {
  if (!date) return 'No disponible';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Hora inválida';
  }
  
  return dateObj.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formatea un nombre completo capitalizado
 * @param {string} nombre - Nombre
 * @param {string} apellido - Apellido
 * @returns {string} Nombre completo formateado
 */
export function formatFullName(nombre = '', apellido = '') {
  if (!nombre && !apellido) return 'No disponible';
  
  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
  
  const formattedNombre = nombre ? nombre.split(' ').map(capitalize).join(' ') : '';
  const formattedApellido = apellido ? apellido.split(' ').map(capitalize).join(' ') : '';
  
  return `${formattedNombre} ${formattedApellido}`.trim();
}

/**
 * Formatea un número de teléfono
 * @param {string} phone - Número de teléfono
 * @returns {string} Teléfono formateado
 */
export function formatPhone(phone) {
  if (!phone) return 'No disponible';
  
  // Limpiar caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Formatear según la longitud
  if (cleaned.length === 7) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3)}`;
  } else if (cleaned.length === 8) {
    return `${cleaned.substring(0, 4)}-${cleaned.substring(4)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  
  return phone;
}

/**
 * Formatea un número de CI (Carnet de Identidad)
 * @param {string} ci - Número de CI
 * @returns {string} CI formateado
 */
export function formatCI(ci) {
  if (!ci) return 'No disponible';
  
  const cleaned = ci.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 2)}.${cleaned.substring(2, 8)}.${cleaned.substring(8)}`;
  } else if (cleaned.length === 11) {
    return `${cleaned.substring(0, 2)}.${cleaned.substring(2, 9)}.${cleaned.substring(9)}`;
  }
  
  return ci;
}

/**
 * Formatea un género a texto legible
 * @param {string} gender - Código de género (M/F/O)
 * @returns {string} Género formateado
 */
export function formatGender(gender) {
  return GENDER_LABELS[gender] || gender || 'No especificado';
}

/**
 * Formatea un rol de usuario a texto legible
 * @param {string} role - Rol del usuario
 * @returns {string} Rol formateado
 */
export function formatUserRole(role) {
  return USER_ROLE_LABELS[role] || role || 'No especificado';
}

/**
 * Formatea un tipo de registro a texto legible
 * @param {string} type - Tipo de registro
 * @returns {string} Tipo formateado
 */
export function formatRecordType(type) {
  return RECORD_TYPE_LABELS[type] || type || 'General';
}

/**
 * Formatea un estado de plan a texto legible
 * @param {string} status - Estado del plan
 * @returns {string} Estado formateado
 */
export function formatPlanStatus(status) {
  return PLAN_STATUS_LABELS[status] || status || 'No especificado';
}

/**
 * Formatea un estado de cumplimiento a texto legible
 * @param {boolean} cumplimiento - Estado de cumplimiento
 * @returns {string} Estado formateado
 */
export function formatCompliance(cumplimiento) {
  return cumplimiento ? 'Cumplido' : 'No cumplido';
}

/**
 * Formatea una edad a partir de la fecha de nacimiento
 * @param {string|Date} birthDate - Fecha de nacimiento
 * @returns {string} Edad formateada
 */
export function formatAge(birthDate) {
  if (!birthDate) return 'No disponible';
  
  const birthDateObj = birthDate instanceof Date ? birthDate : new Date(birthDate);
  
  if (isNaN(birthDateObj.getTime())) {
    return 'Fecha inválida';
  }
  
  const today = new Date();
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  
  return `${age} años`;
}

/**
 * Formatea un número con separadores de miles
 * @param {number} number - Número a formatear
 * @param {number} decimals - Número de decimales
 * @returns {string} Número formateado
 */
export function formatNumber(number, decimals = 0) {
  if (number === null || number === undefined) return 'No disponible';
  
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
}

/**
 * Formatea un valor monetario
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Moneda (default: 'USD')
 * @returns {string} Valor monetario formateado
 */
export function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined) return 'No disponible';
  
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Formatea un porcentaje
 * @param {number} value - Valor a formatear (0-100 o 0-1)
 * @param {boolean} isDecimal - Si el valor está en decimal (0-1)
 * @returns {string} Porcentaje formateado
 */
export function formatPercentage(value, isDecimal = false) {
  if (value === null || value === undefined) return 'No disponible';
  
  const percentage = isDecimal ? value * 100 : value;
  
  return `${percentage.toFixed(1)}%`;
}

/**
 * Formatea bytes a una unidad legible (KB, MB, GB)
 * @param {number} bytes - Bytes a formatear
 * @param {number} decimals - Decimales a mostrar
 * @returns {string} Bytes formateados
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Formatea una duración en minutos a horas y minutos
 * @param {number} minutes - Minutos a formatear
 * @returns {string} Duración formateada
 */
export function formatDuration(minutes) {
  if (minutes === null || minutes === undefined) return 'No disponible';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min`;
  } else if (mins === 0) {
    return `${hours} h`;
  } else {
    return `${hours} h ${mins} min`;
  }
}

/**
 * Formatea un texto truncando si es muy largo
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @param {string} ellipsis - Caracteres de truncamiento
 * @returns {string} Texto truncado
 */
export function truncateText(text, maxLength = 100, ellipsis = '...') {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Formatea un tiempo relativo (hace X tiempo)
 * @param {string|Date} date - Fecha a comparar
 * @returns {string} Tiempo relativo formateado
 */
export function formatRelativeTime(date) {
  if (!date) return 'No disponible';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }
  
  const now = new Date();
  const diffMs = now - dateObj;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);
  
  if (diffSec < 60) return 'hace un momento';
  if (diffMin < 60) return `hace ${diffMin} minuto${diffMin > 1 ? 's' : ''}`;
  if (diffHour < 24) return `hace ${diffHour} hora${diffHour > 1 ? 's' : ''}`;
  if (diffDay < 7) return `hace ${diffDay} día${diffDay > 1 ? 's' : ''}`;
  if (diffWeek < 4) return `hace ${diffWeek} semana${diffWeek > 1 ? 's' : ''}`;
  if (diffMonth < 12) return `hace ${diffMonth} mes${diffMonth > 1 ? 'es' : ''}`;
  
  return `hace ${diffYear} año${diffYear > 1 ? 's' : ''}`;
}

/**
 * Formatea una lista de elementos en una cadena legible
 * @param {Array} items - Elementos a formatear
 * @param {string} separator - Separador (default: ', ')
 * @returns {string} Lista formateada
 */
export function formatList(items, separator = ', ') {
  if (!items || !Array.isArray(items)) return '';
  
  return items.filter(item => item && item.toString().trim()).join(separator);
}

/**
 * Formatea un objeto de dirección a una cadena legible
 * @param {Object} address - Objeto de dirección
 * @returns {string} Dirección formateada
 */
export function formatAddress(address) {
  if (!address || typeof address !== 'object') return 'No disponible';
  
  const parts = [];
  
  if (address.calle) parts.push(address.calle);
  if (address.numero) parts.push(`#${address.numero}`);
  if (address.colonia) parts.push(`Col. ${address.colonia}`);
  if (address.ciudad) parts.push(address.ciudad);
  if (address.estado) parts.push(address.estado);
  if (address.codigo_postal) parts.push(`C.P. ${address.codigo_postal}`);
  
  return parts.join(', ');
}

/**
 * Formatea un nombre de archivo truncando la extensión si es necesario
 * @param {string} filename - Nombre del archivo
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Nombre de archivo formateado
 */
export function formatFilename(filename, maxLength = 30) {
  if (!filename) return 'Sin nombre';
  
  if (filename.length <= maxLength) return filename;
  
  const lastDotIndex = filename.lastIndexOf('.');
  
  if (lastDotIndex === -1) {
    return truncateText(filename, maxLength);
  }
  
  const name = filename.substring(0, lastDotIndex);
  const ext = filename.substring(lastDotIndex);
  
  if (name.length <= maxLength - ext.length) {
    return filename;
  }
  
  return truncateText(name, maxLength - ext.length - 3) + '...' + ext;
}

/**
 * Exportar todas las funciones de formato
 */
export default {
  formatDate,
  formatDateLong,
  formatTime,
  formatFullName,
  formatPhone,
  formatCI,
  formatGender,
  formatUserRole,
  formatRecordType,
  formatPlanStatus,
  formatCompliance,
  formatAge,
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatFileSize,
  formatDuration,
  truncateText,
  formatRelativeTime,
  formatList,
  formatAddress,
  formatFilename
};