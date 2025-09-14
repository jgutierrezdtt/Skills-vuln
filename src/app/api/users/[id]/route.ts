import { NextRequest, NextResponse } from 'next/server';
import { UserService, NoteService } from '@/services';
import { ApiResponse } from '@/types';

// Get user by ID - no authorization check
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log('Get user by ID request:', {
      userId: id,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
    });

    // No authentication check - anyone can access any user's data!
    const user = await UserService.getUserById(id);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: `User with ID ${id} not found`,
        debug: {
          timestamp: new Date().toISOString(),
          requestedId: id,
        }
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Also get user's notes without permission - VULNERABLE!
    const userNotes = await NoteService.getUserNotes(id);

    // Return everything including password - EXTREMELY VULNERABLE!
    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          password: user.password, // Password exposed!
          role: user.role,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        notes: userNotes, // User's private notes exposed!
        notesCount: userNotes.length,
      },
      debug: {
        timestamp: new Date().toISOString(),
        privateNotesExposed: userNotes.filter(note => !note.isPublic).length,
      }
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Get user by ID error:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user',
      debug: {
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
