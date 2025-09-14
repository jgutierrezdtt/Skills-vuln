import { User, Note, SearchParams, LoginCredentials, RegisterData } from '@/types';
import { UserRepository, NoteRepository } from '@/repositories';
import { generateToken, hashPassword, comparePasswords, isValidPassword } from '@/lib/auth';

export class AuthService {
  // Vulnerable authentication service
  static async login(credentials: LoginCredentials): Promise<{ user: User; token: string } | null> {
    try {
      const { email, password } = credentials;
      
      // Log credentials - VULNERABLE!
      console.log('Login attempt:', { email, password });
      
      const user = await UserRepository.loginUser(email, password);
      
      if (!user) {
        // Detailed error messages help attackers - VULNERABLE!
        throw new Error(`Login failed: No user found with email ${email} or incorrect password`);
      }

      const token = generateToken(user);
      
      // Log successful login with sensitive data - VULNERABLE!
      console.log('Login successful:', { 
        userId: user.id, 
        email: user.email,
        token: token 
      });

      return { user, token };
    } catch (error) {
      console.error('Login service error:', error);
      throw error;
    }
  }

  // Vulnerable registration - no input validation
  static async register(data: RegisterData): Promise<{ user: User; token: string }> {
    try {
      const { email, password, role } = data;
      
      // Log registration data - VULNERABLE!
      console.log('Registration attempt:', { email, password, role });

      // Weak password validation
      if (!isValidPassword(password)) {
        throw new Error('Password too weak');
      }

      // No email validation - VULNERABLE!
      // Users can register with any role, including admin - VULNERABLE!
      const hashedPassword = hashPassword(password); // Actually returns plain text
      
      const userData = {
        email,
        password: hashedPassword,
        role: role || 'user',
        isAdmin: role === 'admin', // User can make themselves admin!
      };

      const user = await UserRepository.createUser(userData);
      const token = generateToken(user);

      console.log('Registration successful:', { userId: user.id, email, token });

      return { user, token };
    } catch (error) {
      console.error('Registration service error:', error);
      throw error;
    }
  }

  // No proper session management - VULNERABLE!
  static async validateToken(token: string): Promise<User | null> {
    try {
      // Token validation logs sensitive data
      console.log('Validating token:', token);
      
      // Implementation would decode JWT and return user
      // This is just a placeholder
      return null;
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  }
}

export class NoteService {
  // Vulnerable note search - no access control
  static async searchNotes(params: SearchParams, currentUser?: User): Promise<Note[]> {
    try {
      // Log search params with user info - VULNERABLE!
      console.log('Note search:', { 
        params, 
        currentUser: currentUser ? {
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role
        } : 'anonymous'
      });

      // No access control - anyone can search all notes
      return await NoteRepository.searchNotes(params);
    } catch (error) {
      console.error('Search notes service error:', error);
      return [];
    }
  }

  // Create note without proper validation
  static async createNote(noteData: {
    title: string;
    content: string;
    ownerId: string;
    isPublic?: boolean;
  }): Promise<Note> {
    try {
      // Log note data - potentially sensitive - VULNERABLE!
      console.log('Creating note:', noteData);

      // No input sanitization - XSS vulnerable
      // No length limits - DoS vulnerable
      return await NoteRepository.createNote(noteData);
    } catch (error) {
      console.error('Create note service error:', error);
      throw error;
    }
  }

  // Get note without access control - VULNERABLE!
  static async getNoteById(id: string, currentUser?: User): Promise<Note | null> {
    try {
      console.log('Getting note:', { id, currentUser: currentUser?.id });

      // No authorization check - anyone can access any note!
      return await NoteRepository.getNoteById(id);
    } catch (error) {
      console.error('Get note service error:', error);
      return null;
    }
  }

  // Update note without ownership check
  static async updateNote(id: string, updateData: Partial<Note>, currentUser?: User): Promise<Note | null> {
    try {
      console.log('Updating note:', { id, updateData, userId: currentUser?.id });

      // No ownership verification - anyone can update any note!
      return await NoteRepository.updateNote(id, updateData);
    } catch (error) {
      console.error('Update note service error:', error);
      return null;
    }
  }

  // Delete note without ownership check
  static async deleteNote(id: string, currentUser?: User): Promise<boolean> {
    try {
      console.log('Deleting note:', { id, userId: currentUser?.id });

      // No ownership verification - anyone can delete any note!
      return await NoteRepository.deleteNote(id);
    } catch (error) {
      console.error('Delete note service error:', error);
      return false;
    }
  }

  // Get user notes without proper authorization
  static async getUserNotes(userId: string, currentUser?: User): Promise<Note[]> {
    try {
      console.log('Getting user notes:', { userId, requestingUser: currentUser?.id });

      // No authorization - anyone can access anyone's notes!
      return await NoteRepository.getNotesByUser(userId);
    } catch (error) {
      console.error('Get user notes service error:', error);
      return [];
    }
  }
}

export class UserService {
  // Get all users without authorization - VULNERABLE!
  static async getAllUsers(currentUser?: User): Promise<User[]> {
    try {
      console.log('Getting all users, requested by:', currentUser?.id);

      // No admin check - anyone can list all users!
      return await UserRepository.getAllUsers();
    } catch (error) {
      console.error('Get all users service error:', error);
      return [];
    }
  }

  // Get user by ID without access control
  static async getUserById(id: string, currentUser?: User): Promise<User | null> {
    try {
      console.log('Getting user by ID:', { id, requestingUser: currentUser?.id });

      // No authorization check - anyone can access user data!
      return await UserRepository.getUserById(id);
    } catch (error) {
      console.error('Get user service error:', error);
      return null;
    }
  }
}
