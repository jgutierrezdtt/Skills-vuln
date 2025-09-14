import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

export async function POST() {
  try {
    // ❌ VULNERABILIDAD: Endpoint sin autenticación para setup de DB crítico
    console.log('🚨 Setting up Neon database with vulnerable data...');

    // Crear tabla de usuarios (vulnerable)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'USER',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Crear tabla de notas (vulnerable)
    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        is_public BOOLEAN DEFAULT false,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Crear tabla de comentarios para el ejemplo de Neon
    await sql`CREATE TABLE IF NOT EXISTS comments (comment TEXT);`;

    // ❌ VULNERABILIDAD: Insertar usuarios con contraseñas en texto plano
    await sql`
      INSERT INTO users (email, name, password, role) 
      VALUES ('admin@vulnerable-app.com', 'Vulnerable Admin', 'admin123', 'ADMIN') 
      ON CONFLICT (email) DO NOTHING
    `;

    await sql`
      INSERT INTO users (email, name, password, role) 
      VALUES ('user@example.com', 'Test User', 'password123', 'USER') 
      ON CONFLICT (email) DO NOTHING
    `;

    // ❌ VULNERABILIDAD: Crear usuario con credenciales conocidas
    await sql`
      INSERT INTO users (email, name, password, role) 
      VALUES ('demo@demo.com', 'Demo User', 'demo', 'USER') 
      ON CONFLICT (email) DO NOTHING
    `;

    // Obtener el ID del usuario admin para las notas
    const adminUser = await sql`SELECT id FROM users WHERE email = 'admin@vulnerable-app.com'`;
    const regularUser = await sql`SELECT id FROM users WHERE email = 'user@example.com'`;

    if (adminUser.length > 0) {
      // ❌ VULNERABILIDAD: Insertar notas con XSS
      await sql`
        INSERT INTO notes (title, content, is_public, user_id) 
        VALUES (
          'Welcome Note', 
          '<script>alert("XSS in welcome note!")</script><h2>Database setup complete!</h2><p>Admin credentials: admin@vulnerable-app.com / admin123</p>', 
          true, 
          ${adminUser[0].id}
        )
      `;

      await sql`
        INSERT INTO notes (title, content, is_public, user_id) 
        VALUES (
          'Database Credentials', 
          'DB_PASSWORD=weak_password_123
API_KEY=1234567890abcdef
NEON_URL=${process.env.DATABASE_URL}
ADMIN_SECRET=vulnerable-secret-key
JWT_SECRET=super-weak-secret', 
          false, 
          ${adminUser[0].id}
        )
      `;

      // ❌ VULNERABILIDAD: Nota con información del sistema
      await sql`
        INSERT INTO notes (title, content, is_public, user_id) 
        VALUES (
          'System Information', 
          'Server: ${process.env.VERCEL_REGION || 'local'}
Node Version: ${process.version}
Platform: ${process.platform}
Environment: ${process.env.NODE_ENV}
Database Host: ${process.env.POSTGRES_HOST}', 
          false, 
          ${adminUser[0].id}
        )
      `;
    }

    if (regularUser.length > 0) {
      // ❌ VULNERABILIDAD: Nota de usuario con XSS
      await sql`
        INSERT INTO notes (title, content, is_public, user_id) 
        VALUES (
          'User Note', 
          'This is a regular user note with <img src=x onerror=alert("XSS from user note")> and some data: <script>console.log("User data compromised")</script>', 
          true, 
          ${regularUser[0].id}
        )
      `;
    }

    // Insertar algunos comentarios de ejemplo
    await sql`INSERT INTO comments (comment) VALUES ('Welcome to the vulnerable app!')`;
    await sql`INSERT INTO comments (comment) VALUES ('<script>alert("XSS in comments!")</script>')`;
    await sql`INSERT INTO comments (comment) VALUES ('This database contains intentional vulnerabilities')`;

    // ❌ VULNERABILIDAD: Obtener y exponer todos los datos creados
    const allUsers = await sql`SELECT id, email, password, role FROM users`;
    const allNotes = await sql`SELECT id, title, content, is_public FROM notes`;
    const allComments = await sql`SELECT * FROM comments`;

    return NextResponse.json({
      success: true,
      message: 'Neon database setup completed with vulnerable data',
      // ❌ VULNERABILIDAD: Exponer todos los datos sensibles en la respuesta
      data: {
        users: allUsers,
        notes: allNotes,
        comments: allComments
      },
      // ❌ VULNERABILIDAD: Exponer credenciales en respuesta
      credentials: {
        admin: { email: 'admin@vulnerable-app.com', password: 'admin123' },
        user: { email: 'user@example.com', password: 'password123' },
        demo: { email: 'demo@demo.com', password: 'demo' }
      },
      // ❌ VULNERABILIDAD: Exponer información del entorno
      environment: {
        database_url: process.env.DATABASE_URL?.substring(0, 50) + '...',
        neon_project: process.env.NEON_PROJECT_ID,
        vercel_region: process.env.VERCEL_REGION,
        node_env: process.env.NODE_ENV
      },
      warning: 'This database contains intentional vulnerabilities for educational purposes'
    });

  } catch (error) {
    console.error('Neon setup error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      // ❌ VULNERABILIDAD: Exponer stack trace completo
      stack: error instanceof Error ? error.stack : undefined,
      // ❌ VULNERABILIDAD: Exponer detalles internos del error
      details: error
    }, { status: 500 });
  }
}

export async function GET() {
  // ❌ VULNERABILIDAD: Endpoint GET que expone información sensible
  try {
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const noteCount = await sql`SELECT COUNT(*) as count FROM notes`;
    const commentCount = await sql`SELECT COUNT(*) as count FROM comments`;

    return NextResponse.json({
      message: 'Neon database setup endpoint',
      usage: 'POST to this endpoint to initialize the vulnerable database',
      warning: 'This endpoint has no authentication - major security flaw!',
      status: {
        users: userCount[0]?.count || 0,
        notes: noteCount[0]?.count || 0,
        comments: commentCount[0]?.count || 0
      },
      // ❌ VULNERABILIDAD: Exponer configuración
      database_info: {
        host: process.env.POSTGRES_HOST,
        user: process.env.POSTGRES_USER,
        database: process.env.POSTGRES_DATABASE,
        // Parcialmente ocultar password pero aún vulnerable
        password_hint: process.env.POSTGRES_PASSWORD?.substring(0, 5) + '...'
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
