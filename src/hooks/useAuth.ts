import { useState, useCallback, useEffect } from 'react';
import { User } from '@/types';

/**
 * Credentials required for user login
 */
interface LoginCredentials {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Data required for user registration
 */
interface RegisterData {
  /** Unique username for the account */
  username: string;
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Current authentication state
 */
interface AuthState {
  /** Currently authenticated user or null if not authenticated */
  user: User | null;
  /** Whether the user is currently authenticated */
  isAuthenticated: boolean;
  /** Whether an authentication operation is in progress */
  isLoading: boolean;
  /** Current error message, if any */
  error: string | null;
}

/**
 * Return type for the useAuth hook
 */
interface UseAuthReturn extends AuthState {
  /** Function to authenticate a user with email and password */
  login: (credentials: LoginCredentials) => Promise<void>;
  /** Function to register a new user account */
  register: (data: RegisterData) => Promise<void>;
  /** Function to log out the current user */
  logout: () => Promise<void>;
  /** Function to refresh the current user's session */
  refreshUser: () => Promise<void>;
  /** Function to clear any current error state */
  clearError: () => void;
}

/**
 * Custom hook for managing user authentication state and operations
 * 
 * This hook provides a complete authentication system including:
 * - User login and registration
 * - Session management and persistence
 * - Automatic authentication check on mount
 * - Error handling and loading states
 * 
 * @returns {UseAuthReturn} Object containing authentication state and functions
 * 
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { login, isLoading, error } = useAuth();
 *   
 *   const handleSubmit = async (credentials) => {
 *     try {
 *       await login(credentials);
 *       // User is now logged in
 *     } catch (error) {
 *       // Handle login error
 *     }
 *   };
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Authenticates a user with email and password
   * 
   * @param credentials - User's login credentials
   * @throws {Error} When login fails due to invalid credentials or network issues
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Registers a new user account
   * 
   * @param data - User registration data
   * @throws {Error} When registration fails due to validation errors or network issues
   */
  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const responseData = await response.json();
      setUser(responseData.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logs out the current user
   * 
   * Clears the user session both on the server and in local state.
   * Even if the server logout fails, the local state is cleared.
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      // Even if logout fails, we should clear the local state
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refreshes the current user's session
   * 
   * Checks if the user is still authenticated by calling the /api/auth/me endpoint.
   * If the user is not authenticated, clears the local state.
   */
  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        // User is not authenticated
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      const data = await response.json();
      setUser(data.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clears any current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
    clearError,
  };
} 