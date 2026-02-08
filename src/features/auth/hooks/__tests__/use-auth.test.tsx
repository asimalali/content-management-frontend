import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../use-auth';
import { tokenStorage } from '@/lib/api';
import type { ReactNode } from 'react';

// Mock tokenStorage
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual('@/lib/api');
  return {
    ...actual,
    tokenStorage: {
      getAccessToken: vi.fn(),
      setTokens: vi.fn(),
      clearTokens: vi.fn(),
    },
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should return null user when no token exists', async () => {
      vi.mocked(tokenStorage.getAccessToken).mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('register', () => {
    it('should set pending state after calling register', async () => {
      vi.mocked(tokenStorage.getAccessToken).mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.register({ email: 'test@test.com' });
      });

      await waitFor(() => {
        expect(result.current.pendingEmail).toBe('test@test.com');
      });
    });
  });

  describe('login', () => {
    it('should set pending state after calling login', async () => {
      vi.mocked(tokenStorage.getAccessToken).mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.login({ email: 'login@test.com' });
      });

      await waitFor(() => {
        expect(result.current.pendingEmail).toBe('login@test.com');
      });
    });
  });

  describe('clearPendingAuth', () => {
    it('should clear pending state', async () => {
      vi.mocked(tokenStorage.getAccessToken).mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Set pending state via login
      act(() => {
        result.current.login({ email: 'test@test.com' });
      });

      await waitFor(() => {
        expect(result.current.pendingEmail).toBe('test@test.com');
      });

      // Clear pending state
      act(() => {
        result.current.clearPendingAuth();
      });

      expect(result.current.pendingUserId).toBeNull();
      expect(result.current.pendingEmail).toBeNull();
    });
  });

  describe('logout', () => {
    it('should call clearTokens when logging out', async () => {
      vi.mocked(tokenStorage.getAccessToken).mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.logout();
      });

      await waitFor(() => {
        expect(tokenStorage.clearTokens).toHaveBeenCalled();
      });
    });
  });
});
