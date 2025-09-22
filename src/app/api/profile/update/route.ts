import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // ❌ VULNERABILIDAD: No verificación de token CSRF
    const { email, role, userId } = await request.json();
    
    // ❌ VULNERABILIDAD: No verificación de autenticación
    console.log('🚨 Actualizando perfil sin verificación adecuada:', { email, role, userId });
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Se requiere ID de usuario',
      }, { status: 400 });
    }
    
    // ❌ VULNERABILIDAD: No verificación de propiedad (cualquier usuario puede actualizar cualquier perfil)
    const user = await db.user.update({
      where: { id: userId },
      data: {
        email: email,
        role: role,
        updatedAt: new Date()
      }
    });
    
    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isAdmin: user.isAdmin,
        }
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }, { status: 500 });
  }
}