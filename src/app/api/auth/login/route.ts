import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services';
import { ApiResponse } from '@/types';

// Vulnerable login endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Log request body - VULNERABLE!
    console.log('Login request:', body);

    // No rate limiting - brute force vulnerable
    // No CSRF protection
    // No input validation

    const result = await AuthService.login({ email, password });

    if (!result) {
      // Detailed error message helps attackers - VULNERABLE!
      const response: ApiResponse = {
        success: false,
        error: 'Invalid credentials. Check email and password.',
        debug: {
          params: { email, password }, // Sensitive data in response!
          timestamp: new Date().toISOString(),
        }
      };
      return NextResponse.json(response, { status: 401 });
    }

    const { user, token } = result;

    // Return sensitive data - VULNERABLE!
    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          password: user.password, // Password in response - EXTREMELY VULNERABLE!
          role: user.role,
          isAdmin: user.isAdmin,
        },
        token,
      },
      debug: {
        loginTime: new Date().toISOString(),
        userAgent: request.headers.get('user-agent'),
      }
    };

    // Set vulnerable cookie
    const responseWithCookie = NextResponse.json(response);
    responseWithCookie.cookies.set('authToken', token, {
      httpOnly: false, // Accessible via JS - VULNERABLE!
      secure: false, // Not secure - VULNERABLE!
      sameSite: 'none', // CSRF vulnerable
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return responseWithCookie;
      } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : 'Error';
    
    // ❌ VULNERABILIDAD: Exposición de información de error detallada
    console.error('🚨 Login Error Details:', {
      error: errorMessage,
      timestamp: new Date().toISOString(),
      stack: errorStack,
      name: errorName,
      // ❌ Información sensible en logs
      attempt: 'failed_login',
      ip: 'exposed_in_logs'
    });

    return NextResponse.json({
      error: 'Login failed',
      details: errorMessage,
      vulnerability: 'Error information exposure'
    }, { status: 500 });
  }
