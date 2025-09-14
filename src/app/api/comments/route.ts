import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

export async function GET() {
  try {
    // ❌ VULNERABILIDAD: Sin autenticación para leer comentarios
    const comments = await sql`SELECT * FROM comments ORDER BY rowid DESC`;
    
    return NextResponse.json({
      success: true,
      comments: comments,
      // ❌ VULNERABILIDAD: Exponer información del servidor
      server_info: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: 'neon'
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      // ❌ VULNERABILIDAD: Exponer detalles del error
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { comment } = await request.json();
    
    // ❌ VULNERABILIDAD: Sin validación del input
    // ❌ VULNERABILIDAD: Sin sanitización del HTML
    // ❌ VULNERABILIDAD: Sin límite de longitud
    console.log('🚨 Inserting comment:', comment);
    
    if (!comment) {
      return NextResponse.json({
        success: false,
        error: 'Comment is required'
      }, { status: 400 });
    }

    // ❌ VULNERABILIDAD: Insertar directamente sin validación
    await sql`INSERT INTO comments (comment) VALUES (${comment})`;
    
    // Obtener todos los comentarios después de insertar
    const allComments = await sql`SELECT * FROM comments ORDER BY rowid DESC`;
    
    return NextResponse.json({
      success: true,
      message: 'Comment added successfully',
      comment: comment,
      // ❌ VULNERABILIDAD: Devolver todos los comentarios sin paginación
      all_comments: allComments,
      // ❌ VULNERABILIDAD: Exponer información sensible
      debug_info: {
        comment_length: comment.length,
        contains_script: comment.includes('<script>'),
        contains_html: /<[^>]*>/g.test(comment),
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      // ❌ VULNERABILIDAD: Exponer detalles completos del error
      details: error,
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
