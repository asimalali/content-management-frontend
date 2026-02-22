// Payment Types - matching backend DTOs

export interface PaymentGateway {
  gatewayKey: string;
  displayName: string;
  supportedCurrencies: string[];
}

export interface CreateCheckoutRequest {
  planId: string;
  gatewayKey?: string;
  currency?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResponse {
  success: boolean;
  sessionId?: string;
  checkoutUrl?: string;
  errorMessage?: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand?: string;
  isDefault: boolean;
}

export type PaymentStatus = 'Pending' | 'Succeeded' | 'Failed' | 'Refunded';
export type PaymentType = 'Subscription' | 'OneTime' | 'Refund';

export interface PaymentRecord {
  id: string;
  subscriptionId: string;
  provider: string;
  externalTransactionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  type: PaymentType;
  description?: string;
  createdAt: string;
}
