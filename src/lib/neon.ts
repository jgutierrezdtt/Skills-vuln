import { neon } from '@neondatabase/serverless';

// ❌ VULNERABILIDAD: Configuración de base de datos expuesta
export const sql = neon(process.env.DATABASE_URL!);

// ❌ VULNERABILIDAD: Log de connection string en producción
console.log('🚨 Connecting to Neon DB:', process.env.DATABASE_URL?.substring(0, 50) + '...');

// ❌ VULNERABILIDAD: Función para ejecutar SQL crudo sin validación usando template literals
export const executeVulnerableQuery = async (query: string) => {
  try {
    // ❌ VULNERABILIDAD: Log de queries con datos sensibles
    console.log('🚨 Executing query:', query);
    
    // ❌ VULNERABILIDAD: Sin sanitización de queries - usando template literal inseguro
    // Esto es peligroso pero es lo que queremos para demostrar vulnerabilidades
    const result = await sql`${query}`;
    
    return result;
  } catch (error) {
    // ❌ VULNERABILIDAD: Exponer detalles del error
    console.error('Neon Database error:', error);
    throw error;
  }
};

// ❌ VULNERABILIDAD: Función que permite SQL injection al construir queries dinámicamente
export const executeDynamicQuery = async (baseQuery: string, userInput: string) => {
  try {
    // ❌ VULNERABILIDAD: Concatenación directa de input del usuario
    const dangerousQuery = baseQuery + userInput;
    console.log('🚨 Executing dangerous query:', dangerousQuery);
    
    // Usar eval para hacer la query más peligrosa
    const result = await sql([dangerousQuery] as any);
    return result;
  } catch (error) {
    console.error('Dynamic query error:', error);
    throw error;
  }
};

// ❌ VULNERABILIDAD: Función segura para comparar (la usaremos menos)
export const executeSecureQuery = async (query: TemplateStringsArray, ...params: unknown[]) => {
  try {
    const result = await sql(query, ...params);
    return result;
  } catch (error) {
    console.error('Secure query error:', error);
    throw error;
  }
};

// ❌ VULNERABILIDAD: Configuración de Neon expuesta
export const neonConfig = {
  connectionString: process.env.DATABASE_URL,
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  // ❌ VULNERABILIDAD: SSL configuración débil
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

// ❌ VULNERABILIDAD: Exponer configuración en logs
console.log('🚨 Neon Config:', {
  host: neonConfig.host,
  user: neonConfig.user,
  database: neonConfig.database,
  // Mostramos parte de la password (vulnerable)
  password: neonConfig.password?.substring(0, 10) + '...'
});
