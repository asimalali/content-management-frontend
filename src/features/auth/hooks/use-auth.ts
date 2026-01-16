import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { authApi } from '../api/auth-api';
import { tokenStorage } from '@/lib/api';
import type { User } from '@/types/auth';

export function useAuth() {
  const queryClient = useQueryClient();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  // Fetch current user
  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const token = tokenStorage.getAccessToken();
      if (!token) return null;
      try {
        return await authApi.getMe();
      } catch {
        tokenStorage.clearTokens();
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data, variables) => {
      setPendingUserId(data.userId);
      setPendingEmail(variables.email);
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data, variables) => {
      setPendingUserId(data.userId);
      setPendingEmail(variables.email);
    },
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (data) => {
      tokenStorage.setTokens(data.accessToken, data.refreshToken);
      setPendingUserId(null);
      setPendingEmail(null);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  // Resend OTP mutation
  const resendOtpMutation = useMutation({
    mutationFn: authApi.resendOtp,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      tokenStorage.clearTokens();
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      tokenStorage.clearTokens();
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
    },
  });

  // Clear pending auth state
  const clearPendingAuth = useCallback(() => {
    setPendingUserId(null);
    setPendingEmail(null);
  }, []);

  return {
    // State
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
    pendingUserId,
    pendingEmail,

    // Actions
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,

    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    verifyOtp: verifyOtpMutation.mutate,
    isVerifyingOtp: verifyOtpMutation.isPending,
    verifyOtpError: verifyOtpMutation.error,

    resendOtp: resendOtpMutation.mutate,
    isResendingOtp: resendOtpMutation.isPending,

    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,

    clearPendingAuth,
  };
}
