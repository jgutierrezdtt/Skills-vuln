import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services';
import { ApiResponse } from '@/types';

// Vulnerable users endpoint - no authentication required!
export async function GET(request: NextRequest) {
  try {
    // Log request details - VULNERABLE!
    console.log('Get all users request:', {
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      timestamp: new Date().toISOString(),
    });

    // No authentication check - anyone can get all users!
    const users = await UserService.getAllUsers();

    // Return all user data including passwords - EXTREMELY VULNERABLE!
    const response: ApiResponse = {
      success: true,
      data: {
        users,
        count: users.length,
        message: 'All users retrieved successfully',
      },
      debug: {
        timestamp: new Date().toISOString(),
        totalPasswords: users.filter(user => user.password).length,
        adminUsers: users.filter(user => user.isAdmin).length,
        requestHeaders: Object.fromEntries(request.headers.entries()),
      }
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Get all users error:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get users',
      debug: {
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
