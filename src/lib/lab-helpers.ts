// ❌ VULNERABILIDAD: Función helper con lógica débil de autorización
export function isLabModeEnabled(): boolean {
  // ❌ VULNERABILIDAD: Múltiples formas de habilitar el modo vulnerable
  return process.env.LAB_MODE === 'true' || 
         process.env.VULNERABLE_MODE === 'true' || 
         process.env.NODE_ENV === 'development' ||
         // ❌ VULNERABILIDAD: Siempre habilitado si no está en Vercel production
         !process.env.VERCEL_ENV ||
         // ❌ VULNERABILIDAD: Fallback que siempre permite demos
         true;
}

// ❌ VULNERABILIDAD: Respuesta estándar que da pistas sobre bypass
export function getLabDisabledResponse() {
  return {
    error: 'Lab mode disabled',
    hint: 'Set LAB_MODE=true in environment variables',
    bypass: 'Labs are enabled by default in this vulnerable app',
    check_status: '/api/env-status',
    environment: process.env.NODE_ENV,
    // ❌ VULNERABILIDAD: Exponer información del entorno
    debug_info: {
      vercel_env: process.env.VERCEL_ENV,
      lab_mode: process.env.LAB_MODE,
      vulnerable_mode: process.env.VULNERABLE_MODE
    }
  };
}

// ❌ VULNERABILIDAD: Log vulnerable de actividad de labs
export function logLabActivity(labName: string, userInput?: string) {
  console.log(`🚨 LAB ACTIVITY: ${labName}`);
  console.log(`🚨 Environment: ${process.env.NODE_ENV}`);
  console.log(`🚨 User Input: ${userInput}`);
  console.log(`🚨 Timestamp: ${new Date().toISOString()}`);
  console.log(`🚨 IP: ${process.env.VERCEL_REGION || 'unknown'}`);
}
