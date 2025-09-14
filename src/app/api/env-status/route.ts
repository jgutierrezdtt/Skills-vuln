import { NextResponse } from 'next/server';

export async function GET() {
  // ❌ VULNERABILIDAD: Endpoint público que expone configuración del servidor
  const envStatus = {
    LAB_MODE: process.env.LAB_MODE || 'not set',
    VULNERABLE_MODE: process.env.VULNERABLE_MODE || 'not set',
    NODE_ENV: process.env.NODE_ENV || 'not set',
    JWT_SECRET: process.env.JWT_SECRET ? 'set (****)' : 'not set',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'set (****)' : 'not set',
    DATABASE_URL: process.env.DATABASE_URL ? 'set (Neon connected)' : 'not set',
    NEON_PROJECT_ID: process.env.NEON_PROJECT_ID || 'not set',
    VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
    VERCEL_REGION: process.env.VERCEL_REGION || 'not set',
  };

  // ❌ VULNERABILIDAD: Determinar si los labs están habilitados con lógica débil
  const labsEnabled = process.env.LAB_MODE === 'true' || 
                     process.env.VULNERABLE_MODE === 'true' || 
                     process.env.NODE_ENV === 'development' ||
                     // Fallback vulnerable para demos
                     true;

  return NextResponse.json({
    message: 'Environment Variables Status',
    // ❌ VULNERABILIDAD: Exponer toda la configuración del servidor
    environment: envStatus,
    labsEnabled: labsEnabled,
    recommendations: {
      missing_vars: Object.entries(envStatus)
        .filter(([key, value]) => value === 'not set')
        .map(([key]) => key),
      status: labsEnabled ? 'Labs are enabled' : 'Labs are disabled',
    },
    // ❌ VULNERABILIDAD: Instrucciones para habilitar modo vulnerable
    enable_labs: {
      vercel: 'Add LAB_MODE=true to Environment Variables in Vercel Dashboard',
      local: 'Add LAB_MODE=true to your .env.development.local file',
      alternative: 'Labs are automatically enabled in development mode'
    },
    warning: '⚠️ This endpoint exposes sensitive server configuration!'
  });
}
