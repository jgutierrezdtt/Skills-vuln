'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState('user');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let success = false;
      
      if (isRegistering) {
        success = await register(email, password, role);
      } else {
        success = await login(email, password);
      }

      if (success) {
        // Reset form
        setEmail('');
        setPassword('');
        setRole('user');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <h3 className="font-bold">⚠️ Security Warning</h3>
        <p className="text-sm">This form is vulnerable to multiple attacks for educational purposes!</p>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center">
        {isRegistering ? 'Register' : 'Login'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            required
            autoComplete="current-password"
          />
          <p className="text-xs text-gray-500 mt-1">
            🚨 Vulnerable: Only requires 3+ characters!
          </p>
        </div>

        {isRegistering && (
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <p className="text-xs text-red-600 mt-1">
              🚨 Vulnerable: Users can make themselves admin!
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
        </button>

        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
          className="w-full text-blue-500 hover:text-blue-600 font-medium py-2"
        >
          {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h4 className="font-semibold text-yellow-800">Test Credentials:</h4>
        <p className="text-sm text-yellow-700">
          Email: <code>admin@vulnerable-app.com</code><br/>
          Password: <code>admin123</code>
        </p>
        <p className="text-xs text-yellow-600 mt-2">
          Or try SQL injection: <code>admin&apos; OR &apos;1&apos;=&apos;1</code>
        </p>
      </div>
    </div>
  );
}
