import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Vulnerable configuration: no connection limits, verbose logging
export const db = globalThis.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Logs everything including sensitive data
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}

// Vulnerable raw SQL execution helper
export const executeRawQuery = async (query: string) => {
  try {
    console.log('Executing raw query:', query); // Logs SQL queries - VULNERABLE!
    const result = await db.$queryRawUnsafe(query);
    return result;
  } catch (error) {
    console.error('SQL Error:', error); // Exposes SQL errors - VULNERABLE!
    throw error;
  }
};

// Direct SQL injection helper - EXTREMELY VULNERABLE!
export const buildUnsafeQuery = (baseQuery: string, userInput: string) => {
  return `${baseQuery} '${userInput}'`; // Direct string concatenation
};

export default db;
