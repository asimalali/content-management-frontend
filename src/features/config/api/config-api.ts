import { api } from '@/lib/api';

export interface ClientConfig {
  bypassPaymentGateway: boolean;
  allowFreeSubscriptions: boolean;
  features: Record<string, boolean>;
  enabledPlatforms: string[];
}

export const configApi = {
  getConfig: async (): Promise<ClientConfig> => {
    const response = await api.get<ClientConfig>('/config');
    return response.data;
  },
};
