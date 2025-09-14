import { NextRequest, NextResponse } from 'next/server';
import { NoteService } from '@/services';
import { ApiResponse } from '@/types';

// Vulnerable notes endpoint - no authentication required!
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Log all search parameters - VULNERABLE!
    console.log('Notes search request:', {
      query,
      userId,
      limit,
      offset,
      headers: Object.fromEntries(request.headers.entries()),
      userAgent: request.headers.get('user-agent'),
    });

    // No authentication check - anyone can search all notes!
    const searchResults = await NoteService.searchNotes({
      query: query || undefined,
      userId: userId || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    // Return everything including sensitive user data
    const response: ApiResponse = {
      success: true,
      data: {
        notes: searchResults,
        count: searchResults.length,
        searchParams: { query, userId, limit, offset }, // Echo back params
      },
      debug: {
        timestamp: new Date().toISOString(),
        searchDuration: Math.random() * 100, // Fake timing info
        totalUsersExposed: searchResults.reduce((acc, note) => {
          const ownerEmail = note.owner?.email;
          return ownerEmail ? acc + 1 : acc;
        }, 0),
      }
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Notes search error:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
      debug: {
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// Create note without authentication - VULNERABLE!
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, ownerId, isPublic } = body;

    // Log request body with sensitive data
    console.log('Create note request:', body);

    // No authentication or authorization checks!
    // Users can create notes for other users by specifying ownerId
    // No input sanitization - XSS vulnerable

    const note = await NoteService.createNote({
      title,
      content,
      ownerId,
      isPublic: isPublic || false,
    });

    const response: ApiResponse = {
      success: true,
      data: {
        note,
        message: 'Note created successfully',
      },
      debug: {
        timestamp: new Date().toISOString(),
        requestBody: body,
      }
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: unknown) {
    console.error('Create note error:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Note creation failed',
      debug: {
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
