import { User, Note, SearchParams, ApiResponse } from '@/types';
import db, { executeRawQuery, buildUnsafeQuery } from '@/lib/db';

export class UserRepository {
  // Vulnerable login - susceptible to SQL injection
  static async loginUser(email: string, password: string): Promise<User | null> {
    try {
      // VULNERABLE: Direct string concatenation allows SQL injection
      const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
      console.log('Login query:', query); // Logs sensitive query
      
      const result = await executeRawQuery(query) as User[];
      
      if (result.length > 0) {
        console.log('Login successful for:', email);
        return result[0];
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  // Create user with no validation - VULNERABLE!
  static async createUser(userData: {
    email: string;
    password: string;
    role?: string;
    isAdmin?: boolean;
  }): Promise<User> {
    try {
      return await db.user.create({
        data: {
          email: userData.email,
          password: userData.password, // Plain text password
          role: userData.role || 'user',
          isAdmin: userData.isAdmin || false, // User can make themselves admin!
        },
      });
    } catch (error) {
      console.error('User creation error:', error);
      throw error;
    }
  }

  // Get user by ID - no access control
  static async getUserById(id: string): Promise<User | null> {
    try {
      // Vulnerable: raw query susceptible to injection
      const query = `SELECT * FROM users WHERE id = '${id}'`;
      const result = await executeRawQuery(query) as User[];
      return result[0] || null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Get all users - no authorization check
  static async getAllUsers(): Promise<User[]> {
    try {
      const users = await db.user.findMany({
        select: {
          id: true,
          email: true,
          password: true, // Password exposed - VULNERABLE!
          role: true,
          isAdmin: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return users;
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  }
}

export class NoteRepository {
  // Vulnerable search - SQL injection possible
  static async searchNotes(params: SearchParams): Promise<Note[]> {
    try {
      if (params.query) {
        // VULNERABLE: Direct string interpolation
        const query = `
          SELECT n.*, u.email as owner_email 
          FROM notes n 
          JOIN users u ON n.ownerId = u.id 
          WHERE n.title LIKE '%${params.query}%' 
          OR n.content LIKE '%${params.query}%'
        `;
        
        console.log('Search query:', query); // Logs query
        const result = await executeRawQuery(query) as Note[];
        return result;
      }
      
      return await db.note.findMany({
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              password: true, // Password exposed
              role: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Search notes error:', error);
      return [];
    }
  }

  // Create note - no input validation
  static async createNote(noteData: {
    title: string;
    content: string;
    ownerId: string;
    isPublic?: boolean;
  }): Promise<Note> {
    try {
      return await db.note.create({
        data: {
          title: noteData.title, // No sanitization - XSS vulnerable
          content: noteData.content, // No sanitization - XSS vulnerable
          ownerId: noteData.ownerId,
          isPublic: noteData.isPublic || false,
        },
        include: {
          owner: true,
        },
      });
    } catch (error) {
      console.error('Create note error:', error);
      throw error;
    }
  }

  // Get note by ID - no authorization check
  static async getNoteById(id: string): Promise<Note | null> {
    try {
      // VULNERABLE: SQL injection possible
      const query = `
        SELECT n.*, u.email as owner_email, u.password as owner_password 
        FROM notes n 
        JOIN users u ON n.ownerId = u.id 
        WHERE n.id = '${id}'
      `;
      
      const result = await executeRawQuery(query) as Note[];
      return result[0] || null;
    } catch (error) {
      console.error('Get note error:', error);
      return null;
    }
  }

  // Update note - no ownership check
  static async updateNote(id: string, updateData: Partial<Note>): Promise<Note | null> {
    try {
      return await db.note.update({
        where: { id },
        data: updateData,
        include: {
          owner: true,
        },
      });
    } catch (error) {
      console.error('Update note error:', error);
      return null;
    }
  }

  // Delete note - no ownership check
  static async deleteNote(id: string): Promise<boolean> {
    try {
      await db.note.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Delete note error:', error);
      return false;
    }
  }

  // Get notes by user - no authorization
  static async getNotesByUser(userId: string): Promise<Note[]> {
    try {
      return await db.note.findMany({
        where: { ownerId: userId },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              password: true, // Password exposed
              role: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Get user notes error:', error);
      return [];
    }
  }
}
