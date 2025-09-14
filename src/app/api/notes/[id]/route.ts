import { NextRequest, NextResponse } from 'next/server';
import { NoteService } from '@/services';
import { ApiResponse } from '@/types';

// Vulnerable individual note operations
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Log request details - VULNERABLE!
    console.log('Get note request:', {
      noteId: id,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    });

    // No authentication check - anyone can access any note!
    const note = await NoteService.getNoteById(id);

    if (!note) {
      const response: ApiResponse = {
        success: false,
        error: `Note with ID ${id} not found`,
        debug: {
          timestamp: new Date().toISOString(),
          requestedId: id,
        }
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Return note with owner's sensitive information
    const response: ApiResponse = {
      success: true,
      data: {
        note,
        ownerInfo: note.owner, // Includes password if available!
      },
      debug: {
        timestamp: new Date().toISOString(),
        noteAge: Date.now() - new Date(note.createdAt).getTime(),
      }
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Get note error:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get note',
      debug: {
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// Update note without ownership check - VULNERABLE!
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    console.log('Update note request:', { noteId: id, updateData: body });

    // No authentication or ownership check - anyone can update any note!
    const updatedNote = await NoteService.updateNote(id, body);

    if (!updatedNote) {
      const response: ApiResponse = {
        success: false,
        error: `Note with ID ${id} not found or could not be updated`,
        debug: {
          timestamp: new Date().toISOString(),
          requestedId: id,
          updateData: body,
        }
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: {
        note: updatedNote,
        message: 'Note updated successfully',
      },
      debug: {
        timestamp: new Date().toISOString(),
        originalData: body,
      }
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Update note error:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update note',
      debug: {
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// Delete note without ownership check - VULNERABLE!
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log('Delete note request:', {
      noteId: id,
      userAgent: request.headers.get('user-agent'),
    });

    // No authentication or ownership check - anyone can delete any note!
    const deleted = await NoteService.deleteNote(id);

    if (!deleted) {
      const response: ApiResponse = {
        success: false,
        error: `Note with ID ${id} not found or could not be deleted`,
        debug: {
          timestamp: new Date().toISOString(),
          requestedId: id,
        }
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: {
        message: `Note ${id} deleted successfully`,
        deletedId: id,
      },
      debug: {
        timestamp: new Date().toISOString(),
        deletedBy: 'anonymous', // No user tracking
      }
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Delete note error:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete note',
      debug: {
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
