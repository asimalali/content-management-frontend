import { api } from '@/lib/api';
import type { Plan, Subscription, CreateSubscriptionRequest, UpgradeSubscriptionRequest, DowngradeSubscriptionRequest } from '../types';

export const plansApi = {
  // Get all available plans
  getAll: async (): Promise<Plan[]> => {
    const response = await api.get<Plan[]>('/plans');
    return response.data;
  },

  // Get plan by ID
  getById: async (planId: string): Promise<Plan> => {
    const response = await api.get<Plan>(`/plans/${planId}`);
    return response.data;
  },

  // Get plan by slug
  getBySlug: async (slug: string): Promise<Plan> => {
    const response = await api.get<Plan>(`/plans/slug/${slug}`);
    return response.data;
  },
};

export const subscriptionApi = {
  // Get current user's subscription
  getCurrent: async (): Promise<Subscription | null> => {
    try {
      const response = await api.get<Subscription>('/subscription');
      return response.data;
    } catch (error: unknown) {
      // Return null if no subscription found (404)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
      throw error;
    }
  },

  // Create a new subscription
  create: async (data: CreateSubscriptionRequest): Promise<Subscription> => {
    const response = await api.post<Subscription>('/subscription', data);
    return response.data;
  },

  // Upgrade subscription to a new plan
  upgrade: async (data: UpgradeSubscriptionRequest): Promise<Subscription> => {
    const response = await api.put<Subscription>('/subscription/upgrade', data);
    return response.data;
  },

  // Downgrade subscription (scheduled for end of billing period)
  downgrade: async (data: DowngradeSubscriptionRequest): Promise<Subscription> => {
    const response = await api.put<Subscription>('/subscription/downgrade', data);
    return response.data;
  },

  // Cancel subscription
  cancel: async (): Promise<void> => {
    await api.delete('/subscription');
  },
};
