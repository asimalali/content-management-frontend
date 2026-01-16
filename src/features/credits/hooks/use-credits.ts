import { useQuery } from '@tanstack/react-query';
import { creditsApi } from '../api/credits-api';

// Query keys - exported for use in other features
export const creditKeys = {
  balance: ['credits', 'balance'] as const,
  transactions: ['credits', 'transactions'] as const,
};

// Get credit balance
export function useCreditBalance() {
  return useQuery({
    queryKey: creditKeys.balance,
    queryFn: creditsApi.getBalance,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get transaction history
export function useCreditTransactions(take: number = 50) {
  return useQuery({
    queryKey: creditKeys.transactions,
    queryFn: () => creditsApi.getTransactions(take),
  });
}
