import { useQuery, useMutation } from '@tanstack/react-query';
import { paymentsApi } from '../api/payments-api';
import type { CreateCheckoutRequest } from '../types';

// Query keys
export const paymentKeys = {
  gateways: ['payments', 'gateways'] as const,
  methods: ['payments', 'methods'] as const,
};

// Get available payment gateways
export function usePaymentGateways() {
  return useQuery({
    queryKey: paymentKeys.gateways,
    queryFn: paymentsApi.getGateways,
    staleTime: 1000 * 60 * 10, // 10 minutes - gateways don't change often
  });
}

// Get user's payment methods
export function usePaymentMethods() {
  return useQuery({
    queryKey: paymentKeys.methods,
    queryFn: paymentsApi.getPaymentMethods,
  });
}

// Create checkout session
export function useCreateCheckout() {
  return useMutation({
    mutationFn: (data: CreateCheckoutRequest) => paymentsApi.createCheckout(data),
    onSuccess: (response) => {
      // Redirect to checkout URL if successful
      if (response.success && response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      }
    },
  });
}
