import { api } from '@/lib/api';
import type { AdminPaymentRecord } from '../types';

export const adminPaymentsApi = {
  getPayments: async (take = 50): Promise<AdminPaymentRecord[]> => {
    const response = await api.get<AdminPaymentRecord[]>(
      `/admin/payments?take=${take}`
    );
    return response.data;
  },
};
