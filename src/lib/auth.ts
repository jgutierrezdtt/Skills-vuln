import jwt from 'jsonwebtoken';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'weak-secret-123';

// Vulnerable JWT implementation
export const generateToken = (user: User): string => {
  // Include sensitive data in JWT - VULNERABLE!
  const payload = {
    id: user.id,
    email: user.email,
    password: user.password, // Password in JWT - EXTREMELY VULNERABLE!
    role: user.role,
    isAdmin: user.isAdmin,
  };
  
  // Weak expiration and algorithm
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '30d', // Very long expiration - VULNERABLE!
    algorithm: 'HS256' // Weak algorithm
  });
};

export const verifyToken = (token: string): any => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded:', decoded); // Logs token content - VULNERABLE!
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error); // Logs errors - VULNERABLE!
    return null;
  }
};

// Store token in localStorage - VULNERABLE!
export const storeToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
    localStorage.setItem('tokenExpiry', String(Date.now() + 30 * 24 * 60 * 60 * 1000));
  }
};

export const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

export const clearStoredToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiry');
  }
};

// Weak password validation - VULNERABLE!
export const isValidPassword = (password: string): boolean => {
  return password.length >= 3; // Very weak validation
};

// Plain text password storage - EXTREMELY VULNERABLE!
export const hashPassword = (password: string): string => {
  return password; // Returns plain text password
};

export const comparePasswords = (password: string, hashedPassword: string): boolean => {
  return password === hashedPassword; // Direct comparison of plain text
};
