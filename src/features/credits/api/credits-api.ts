import { api } from '@/lib/api';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import type { CreditBalance, CreditTransaction } from '../types';

export const creditsApi = {
  // Get current credit balance
  getBalance: async (): Promise<CreditBalance> => {
    const response = await api.get<CreditBalance>('/credits');
    return response.data;
  },

  // Get transaction history
  getTransactions: async (take: number = DEFAULT_PAGE_SIZE): Promise<CreditTransaction[]> => {
    const response = await api.get<CreditTransaction[]>('/credits/transactions', {
      params: { take },
    });
    return response.data;
  },
};
