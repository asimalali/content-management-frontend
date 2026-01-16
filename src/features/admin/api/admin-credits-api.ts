import { api } from '@/lib/api';
import type {
  PagedResult,
  AdminCreditUser,
  AdminCreditQuery,
  CreditAdjustmentRequest,
  CreditAdjustmentResponse,
  CreditTransaction,
} from '../types';

export const adminCreditsApi = {
  getUserCredits: async (query: AdminCreditQuery): Promise<PagedResult<AdminCreditUser>> => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    const response = await api.get<PagedResult<AdminCreditUser>>(`/admin/credits?${params.toString()}`);
    return response.data;
  },

  getUserTransactions: async (userId: string, take = 100): Promise<CreditTransaction[]> => {
    const response = await api.get<CreditTransaction[]>(
      `/admin/credits/${userId}/transactions?take=${take}`
    );
    return response.data;
  },

  adjustCredits: async (
    userId: string,
    data: CreditAdjustmentRequest
  ): Promise<CreditAdjustmentResponse> => {
    const response = await api.post<CreditAdjustmentResponse>(
      `/admin/credits/${userId}/adjust`,
      data
    );
    return response.data;
  },

  bulkAdjustCredits: async (
    userIds: string[],
    amount: number,
    type: 'Adjustment' | 'Refund',
    reason: string
  ) => {
    const response = await api.post('/admin/credits/bulk-adjust', {
      userIds,
      amount,
      type,
      reason,
    });
    return response.data;
  },
};
