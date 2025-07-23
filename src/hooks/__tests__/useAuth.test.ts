import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { User } from '@/types';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock data
const mockUser: User = {
  id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
  karma: 100,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('useAuth', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('Initial state', () => {
    it('should initialize with default values', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: mockUser })
        });

      const { result } = renderHook(() => useAuth());

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123'
        });
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });
    });

    it('should handle login errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ message: 'Invalid credentials' })
        });

      const { result } = renderHook(() => useAuth());

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.login({
            email: 'test@example.com',
            password: 'wrongpassword'
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Invalid credentials');
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle network errors during login', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth());

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.login({
            email: 'test@example.com',
            password: 'password123'
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: mockUser })
        });

      const { result } = renderHook(() => useAuth());

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.register({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        })
      });
    });

    it('should handle registration errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ message: 'Email already exists' })
        });

      const { result } = renderHook(() => useAuth());

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.register({
            username: 'testuser',
            email: 'existing@example.com',
            password: 'password123'
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Email already exists');
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: mockUser })
        })
        .mockResolvedValueOnce({
          ok: true
        });

      const { result } = renderHook(() => useAuth());

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual(mockUser);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST'
      });
    });

    it('should handle logout errors but still clear local state', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: mockUser })
        })
        .mockRejectedValueOnce(new Error('Logout failed'));

      const { result } = renderHook(() => useAuth());

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual(mockUser);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Logout failed');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('refreshUser', () => {
    it('should refresh user successfully when authenticated', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: mockUser })
        });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      });
    });

    it('should handle unauthenticated user', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it('should handle refresh errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe('Network error');
      });
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth());

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Trigger an error
      await act(async () => {
        try {
          await result.current.login({
            email: 'test@example.com',
            password: 'password123'
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Network error');

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle missing error message in response', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({})
        });

      const { result } = renderHook(() => useAuth());

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.login({
            email: 'test@example.com',
            password: 'password123'
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Login failed');
    });

    it('should handle missing user data in response', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({})
        });

      const { result } = renderHook(() => useAuth());

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123'
        });
      });

      expect(result.current.user).toBeUndefined();
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
}); 