import { api } from '@/lib/api';
import type {
  PaymentGateway,
  CreateCheckoutRequest,
  CheckoutResponse,
  PaymentMethod,
} from '../types';

export const paymentsApi = {
  // Get available payment gateways
  getGateways: async (): Promise<PaymentGateway[]> => {
    const response = await api.get<PaymentGateway[]>('/payments/gateways');
    return response.data;
  },

  // Create checkout session for subscription payment
  createCheckout: async (data: CreateCheckoutRequest): Promise<CheckoutResponse> => {
    const response = await api.post<CheckoutResponse>('/payments/checkout', data);
    return response.data;
  },

  // Get user's saved payment methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await api.get<PaymentMethod[]>('/payments/methods');
    return response.data;
  },
};
