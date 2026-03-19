export const ERROR_MESSAGES: Record<string, string> = {
  'INVALID_API_KEY': 'La clave API no es válida. Por favor verifica tus ajustes.',
  'INSUFFICIENT_PERMISSIONS': 'No tienes permisos suficientes para esta operación.',
  'VALIDATION_ERROR': 'Los parámetros de la solicitud no son válidos.',
  'INSUFFICIENT_BALANCE': 'No tienes suficientes fondos para realizar esta transacción.',
  'ASSET_NOT_FOUND': 'El activo solicitado no existe.',
  'TRADE_FAILED': 'No se pudo ejecutar la operación bursátil.',
  'RATE_LIMIT_EXCEEDED': 'Demasiadas solicitudes. Por favor espera un momento.',
  'INTERNAL_ERROR': 'Ocurrió un error en el servidor. Inténtalo más tarde.'
};

export const getFriendlyMessage = (code: string) => {
  return ERROR_MESSAGES[code] || 'Algo salió mal. Por favor, intenta de nuevo.';
};
