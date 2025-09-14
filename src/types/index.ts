export interface User {
  id: string;
  email: string;
  password?: string; // Sometimes exposed in API responses - VULNERABLE!
  role: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  owner?: User;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  // Debug info exposed in production - VULNERABLE!
  debug?: {
    query?: string;
    params?: any;
    stack?: string;
    timestamp?: string;
    loginTime?: string;
    name?: string;
    userAgent?: string;
    [key: string]: any; // Allow any debug properties
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  role?: string; // User can set their own role - VULNERABLE!
}

export interface SearchParams {
  query?: string;
  userId?: string; // Direct user ID exposure - VULNERABLE!
  limit?: number;
  offset?: number;
}
