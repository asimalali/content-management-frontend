import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCreditsApi } from '../api/admin-credits-api';
import type { AdminCreditQuery, CreditAdjustmentRequest } from '../types';

export const adminCreditKeys = {
  all: ['admin', 'credits'] as const,
  list: (query: AdminCreditQuery) => ['admin', 'credits', 'list', query] as const,
  transactions: (userId: string) => ['admin', 'credits', userId, 'transactions'] as const,
};

export function useAdminCredits(query: AdminCreditQuery) {
  return useQuery({
    queryKey: adminCreditKeys.list(query),
    queryFn: () => adminCreditsApi.getUserCredits(query),
  });
}

export function useUserTransactions(userId: string, take = 100) {
  return useQuery({
    queryKey: adminCreditKeys.transactions(userId),
    queryFn: () => adminCreditsApi.getUserTransactions(userId, take),
    enabled: !!userId,
  });
}

export function useAdjustCredits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: CreditAdjustmentRequest }) =>
      adminCreditsApi.adjustCredits(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCreditKeys.all });
    },
  });
}

export function useBulkAdjustCredits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userIds,
      amount,
      type,
      reason,
    }: {
      userIds: string[];
      amount: number;
      type: 'Adjustment' | 'Refund';
      reason: string;
    }) => adminCreditsApi.bulkAdjustCredits(userIds, amount, type, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCreditKeys.all });
    },
  });
}
