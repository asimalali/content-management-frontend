import { useQuery } from '@tanstack/react-query';
import { adminPaymentsApi } from '../api/admin-payments-api';

export const adminPaymentKeys = {
  all: ['admin', 'payments'] as const,
  list: (take: number) => ['admin', 'payments', 'list', { take }] as const,
};

export function useAdminPayments(take = 50) {
  return useQuery({
    queryKey: adminPaymentKeys.list(take),
    queryFn: () => adminPaymentsApi.getPayments(take),
  });
}
