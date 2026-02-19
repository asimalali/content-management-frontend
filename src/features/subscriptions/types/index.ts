// Subscription Types - matching backend DTOs

export type SubscriptionStatus = 'Active' | 'Cancelled' | 'Expired' | 'PastDue';

export interface PlanFeature {
  key: string;
  value: string;
  displayName: string;
  isVisible: boolean;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  priceYearly?: number;
  creditsMonthly: number;
  features: PlanFeature[];
}

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  pendingPlanId?: string;
  pendingPlanName?: string;
  pendingPlanEffectiveAt?: string;
}

export interface CreateSubscriptionRequest {
  planId: string;
  paymentMethodId?: string;
  paymentGateway?: string;
}

export interface UpgradeSubscriptionRequest {
  newPlanId: string;
}

export interface DowngradeSubscriptionRequest {
  newPlanId: string;
}
