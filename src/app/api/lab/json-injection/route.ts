import { NextRequest, NextResponse } from 'next/server';

// Tipo para los datos del usuario
interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  preferences?: any;
}

// Base de datos simulada de usuarios
const users: UserData[] = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    preferences: {
      theme: 'dark',
      notifications: true
    }
  },
  {
    id: 2,
    name: 'Regular User',
    email: 'user@example.com',
    role: 'user',
    preferences: {
      theme: 'light',
      notifications: false
    }
  },
  {
    id: 3,
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    preferences: {
      theme: 'system',
      notifications: true
    }
  }
];

// Función para sanitizar JSON - elimina propiedades potencialmente peligrosas
function sanitizeJson(data: any): any {
  if (Array.isArray(data)) {
    return data.map(item => sanitizeJson(item));
  } else if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const key in data) {
      // Excluir propiedades sensibles o peligrosas
      if (
        key !== 'role' && 
        key !== 'password' && 
        key !== 'token' && 
        key !== '__proto__' && 
        key !== 'constructor' && 
        !key.startsWith('_')
      ) {
        sanitized[key] = sanitizeJson(data[key]);
      }
    }
    return sanitized;
  }
  return data;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secure = searchParams.get('secure') === 'true';
  const query = searchParams.get('query') || '';
  
  try {
    // Buscar usuarios que coincidan con la consulta
    let filteredUsers = users.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) || 
      user.email.toLowerCase().includes(query.toLowerCase())
    );
    
    // Si está habilitado el modo seguro, sanitizar los datos antes de devolverlos
    if (secure) {
      filteredUsers = sanitizeJson(filteredUsers);
    }
    
    // Incluir una advertencia en los encabezados si el modo seguro está desactivado
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (!secure) {
      headers['X-Security-Warning'] = 'JSON sanitization disabled - vulnerable to JSON injection';
    }
    
    return NextResponse.json({ 
      users: filteredUsers,
      secure: secure,
      query: query,
      count: filteredUsers.length
    }, { headers });
    
  } catch (error) {
    console.error('Error processing JSON request:', error);
    return NextResponse.json({ 
      error: 'Error processing request',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secure = searchParams.get('secure') === 'true';
  
  try {
    // Obtener datos del cuerpo de la solicitud
    const requestData = await request.json();
    
    // Simular un proceso de guardado (en una aplicación real, esto guardaría en base de datos)
    let responseData = { 
      success: true, 
      message: 'Data processed successfully',
      data: requestData
    };
    
    // Si está habilitado el modo seguro, sanitizar los datos antes de procesarlos
    if (secure) {
      responseData.data = sanitizeJson(requestData);
    }
    
    // Incluir una advertencia en los encabezados si el modo seguro está desactivado
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (!secure) {
      headers['X-Security-Warning'] = 'JSON sanitization disabled - vulnerable to JSON injection';
    }
    
    return NextResponse.json(responseData, { headers });
    
  } catch (error) {
    console.error('Error processing JSON request:', error);
    return NextResponse.json({ 
      error: 'Error processing request',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}