import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationsApi } from '../api/integrations-api';
import type { StartOAuthRequest, OAuthCallbackRequest } from '../types';

// Query keys
export const integrationKeys = {
  connected: ['integrations', 'connected'] as const,
  available: ['integrations', 'available'] as const,
  destinations: (accountId: string) => ['integrations', accountId, 'destinations'] as const,
};

// Get connected accounts
export function useConnectedAccounts() {
  return useQuery({
    queryKey: integrationKeys.connected,
    queryFn: integrationsApi.getConnected,
  });
}

// Get available platforms
export function useAvailablePlatforms() {
  return useQuery({
    queryKey: integrationKeys.available,
    queryFn: integrationsApi.getAvailable,
  });
}

// Get destinations for an account
export function useDestinations(accountId: string | undefined) {
  return useQuery({
    queryKey: integrationKeys.destinations(accountId!),
    queryFn: () => integrationsApi.getDestinations(accountId!),
    enabled: !!accountId,
  });
}

// Start OAuth connection
export function useConnectPlatform() {
  return useMutation({
    mutationFn: ({ platform, data }: { platform: string; data: StartOAuthRequest }) =>
      integrationsApi.connect(platform, data),
  });
}

// Handle OAuth callback
export function useOAuthCallback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ platform, data }: { platform: string; data: OAuthCallbackRequest }) =>
      integrationsApi.callback(platform, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.connected });
    },
  });
}

// Disconnect account
export function useDisconnectAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => integrationsApi.disconnect(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.connected });
    },
  });
}

// Refresh account token
export function useRefreshAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => integrationsApi.refresh(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.connected });
    },
  });
}
