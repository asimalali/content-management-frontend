import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansApi, subscriptionApi } from '../api/subscriptions-api';
import { creditKeys } from '@/features/credits';
import type { CreateSubscriptionRequest, UpgradeSubscriptionRequest, DowngradeSubscriptionRequest } from '../types';

// Query keys
export const planKeys = {
  all: ['plans'] as const,
  detail: (id: string) => ['plans', id] as const,
};

export const subscriptionKeys = {
  current: ['subscription', 'current'] as const,
};

// ═══════════════════════════════════════════════════════════════════════════
// PLANS HOOKS
// ═══════════════════════════════════════════════════════════════════════════

// Get all plans
export function usePlans() {
  return useQuery({
    queryKey: planKeys.all,
    queryFn: plansApi.getAll,
    staleTime: 1000 * 60 * 10, // 10 minutes - plans don't change often
  });
}

// Get plan by ID
export function usePlan(planId: string | undefined) {
  return useQuery({
    queryKey: planKeys.detail(planId!),
    queryFn: () => plansApi.getById(planId!),
    enabled: !!planId,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION HOOKS
// ═══════════════════════════════════════════════════════════════════════════

// Get current subscription
export function useSubscription() {
  return useQuery({
    queryKey: subscriptionKeys.current,
    queryFn: subscriptionApi.getCurrent,
  });
}

// Create subscription
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubscriptionRequest) => subscriptionApi.create(data),
    onSuccess: () => {
      // Invalidate subscription and credits (credits are allocated on subscription)
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current });
      queryClient.invalidateQueries({ queryKey: creditKeys.balance });
    },
  });
}

// Upgrade subscription
export function useUpgradeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpgradeSubscriptionRequest) => subscriptionApi.upgrade(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current });
      queryClient.invalidateQueries({ queryKey: creditKeys.balance });
    },
  });
}

// Downgrade subscription
export function useDowngradeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DowngradeSubscriptionRequest) => subscriptionApi.downgrade(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current });
    },
  });
}

// Cancel subscription
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => subscriptionApi.cancel(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current });
    },
  });
}
