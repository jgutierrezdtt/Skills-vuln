'use client';

import { useState, useEffect } from 'react';
import { getStoredToken, clearStoredToken, storeToken } from '@/lib/auth';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Load token from localStorage - VULNERABLE!
    const storedToken = getStoredToken();
    if (storedToken) {
      setToken(storedToken);
      // In a real app, we'd validate the token here
      // For this vulnerable app, we'll just trust localStorage
      console.log('🚨 Loading token from localStorage:', storedToken);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🚨 Attempting login with:', { email, password }); // Log credentials!

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (data.success) {
        const { user: userData, token: userToken } = data.data;
        
        // Store sensitive data in localStorage - VULNERABLE!
        storeToken(userToken);
        localStorage.setItem('user', JSON.stringify(userData)); // Store user data including password!
        
        setUser(userData);
        setToken(userToken);
        
        console.log('🚨 Login successful, stored sensitive data:', { userData, userToken });
        return true;
      } else {
        console.error('Login failed:', data.error);
        alert(`Login failed: ${data.error}`); // Show detailed error to user
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(`Login error: ${error}`); // Expose error details
      return false;
    }
  };

  const register = async (email: string, password: string, role?: string): Promise<boolean> => {
    try {
      console.log('🚨 Attempting registration with:', { email, password, role });

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();
      
      if (data.success) {
        const { user: userData, token: userToken } = data.data;
        
        // Store everything in localStorage - VULNERABLE!
        storeToken(userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setToken(userToken);
        
        console.log('🚨 Registration successful:', { userData, userToken });
        return true;
      } else {
        console.error('Registration failed:', data.error);
        alert(`Registration failed: ${data.error}`);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(`Registration error: ${error}`);
      return false;
    }
  };

  const logout = () => {
    clearStoredToken();
    localStorage.removeItem('user'); // Clear user data
    setUser(null);
    setToken(null);
    console.log('🚨 User logged out, but session may still be valid on server');
  };

  return {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };
};
