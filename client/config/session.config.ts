// Configuración del sistema de cierre de sesión automático

/**
 * Tiempo de inactividad antes de cerrar la sesión automáticamente
 * Valor en minutos (se convierte a milisegundos internamente)
 * 
 * Valores recomendados:
 * - 15 minutos: Para aplicaciones con datos sensibles
 * - 30 minutos: Para aplicaciones estándar (por defecto)
 * - 60 minutos: Para aplicaciones de uso prolongado
 */
export const INACTIVITY_TIMEOUT_MINUTES = 30;

/**
 * Tiempo antes del cierre de sesión para mostrar advertencia
 * Valor en minutos (se convierte a milisegundos internamente)
 * 
 * Por defecto: 5 minutos antes del cierre
 */
export const WARNING_TIME_MINUTES = 5;

// Conversión a milisegundos (no modificar)
export const INACTIVITY_TIMEOUT = INACTIVITY_TIMEOUT_MINUTES * 60 * 1000;
export const WARNING_TIME = WARNING_TIME_MINUTES * 60 * 1000;

/**
 * Eventos del navegador que resetean el timer de inactividad
 * Estos eventos indican que el usuario está activo
 */
export const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
