import { api } from '@/lib/api';
import type {
  ConnectedAccount,
  AvailablePlatform,
  Destination,
  StartOAuthRequest,
  OAuthConnectResponse,
  OAuthCallbackRequest,
} from '../types';

export const integrationsApi = {
  // Get all connected accounts
  getConnected: async (): Promise<ConnectedAccount[]> => {
    const response = await api.get<ConnectedAccount[]>('/integrations');
    return response.data;
  },

  // Get available platforms for connection
  getAvailable: async (): Promise<AvailablePlatform[]> => {
    const response = await api.get<AvailablePlatform[]>('/integrations/available');
    return response.data;
  },

  // Start OAuth connection flow
  connect: async (platform: string, data: StartOAuthRequest): Promise<OAuthConnectResponse> => {
    const response = await api.post<OAuthConnectResponse>(`/integrations/${platform}/connect`, data);
    return response.data;
  },

  // Handle OAuth callback
  callback: async (platform: string, data: OAuthCallbackRequest): Promise<ConnectedAccount> => {
    const response = await api.post<ConnectedAccount>(`/integrations/${platform}/callback`, data);
    return response.data;
  },

  // Disconnect account
  disconnect: async (accountId: string): Promise<void> => {
    await api.delete(`/integrations/${accountId}`);
  },

  // Get destinations for an account
  getDestinations: async (accountId: string): Promise<Destination[]> => {
    const response = await api.get<Destination[]>(`/integrations/${accountId}/destinations`);
    return response.data;
  },

  // Refresh account token
  refresh: async (accountId: string): Promise<void> => {
    await api.post(`/integrations/${accountId}/refresh`);
  },
};
