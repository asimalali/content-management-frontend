import { api } from '@/lib/api';

export interface ClientConfig {
  bypassPaymentGateway: boolean;
  allowFreeSubscriptions: boolean;
}

export const configApi = {
  getConfig: async (): Promise<ClientConfig> => {
    const response = await api.get<ClientConfig>('/config');
    return response.data;
  },
};
