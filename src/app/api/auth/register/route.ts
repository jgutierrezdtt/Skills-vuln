import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services';
import { ApiResponse } from '@/types';

// Vulnerable registration endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    // Log everything - VULNERABLE!
    console.log('Registration request:', { email, password, role });

    // No input validation
    // No rate limiting
    // Users can set any role, including admin - VULNERABLE!

    const result = await AuthService.register({ email, password, role });
    const { user, token } = result;

    // Return everything including password - VULNERABLE!
    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          password: user.password, // Password in response!
          role: user.role,
          isAdmin: user.isAdmin,
        },
        token,
        message: `User registered successfully with role: ${user.role}`,
      },
      debug: {
        timestamp: new Date().toISOString(),
        requestBody: body, // Echo back request
      }
    };

    // Set vulnerable cookie
    const responseWithCookie = NextResponse.json(response);
    responseWithCookie.cookies.set('authToken', token, {
      httpOnly: false,
      secure: false,
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return responseWithCookie;
  } catch (error: unknown) {
    console.error('Registration API error:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
      debug: {
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
