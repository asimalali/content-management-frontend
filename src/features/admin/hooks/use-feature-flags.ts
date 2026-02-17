import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminFeatureFlagsApi,
  type UpdateFeatureFlagRequest,
  type FeatureFlag,
} from '../api/admin-feature-flags-api';

export const featureFlagKeys = {
  all: ['admin', 'feature-flags'] as const,
  detail: (key: string) => ['admin', 'feature-flags', key] as const,
};

/**
 * Query hook to fetch all feature flags (admin).
 * Returns all flags regardless of enabled status.
 */
export function useFeatureFlags() {
  return useQuery({
    queryKey: featureFlagKeys.all,
    queryFn: async () => {
      const response = await adminFeatureFlagsApi.getAllFlags();
      return response.data;
    },
  });
}

/**
 * Query hook to fetch a specific feature flag by key (admin).
 */
export function useFeatureFlagByKey(flagKey: string) {
  return useQuery({
    queryKey: featureFlagKeys.detail(flagKey),
    queryFn: async () => {
      const response = await adminFeatureFlagsApi.getFlagByKey(flagKey);
      return response.data;
    },
    enabled: !!flagKey,
  });
}

/**
 * Mutation hook to update a feature flag (admin).
 * Automatically invalidates caches for real-time updates.
 * Frontend refetches config immediately after update (real-time via HTTP).
 */
export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ flagKey, data }: { flagKey: string; data: UpdateFeatureFlagRequest }) =>
      adminFeatureFlagsApi.updateFlag(flagKey, data),
    onSuccess: () => {
      // Immediate invalidation for real-time updates via HTTP
      queryClient.invalidateQueries({ queryKey: featureFlagKeys.all });
      queryClient.invalidateQueries({ queryKey: ['config'] });

      // Force refetch to get fresh data immediately (real-time via HTTP)
      queryClient.refetchQueries({ queryKey: ['config'] });
    },
  });
}

/**
 * Mutation hook to delete a feature flag (admin).
 * System flags cannot be deleted, only toggled.
 */
export function useDeleteFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flagKey: string) => adminFeatureFlagsApi.deleteFlag(flagKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureFlagKeys.all });
      queryClient.invalidateQueries({ queryKey: ['config'] });
    },
  });
}

/**
 * Mutation hook to manually invalidate feature flag cache (emergency use).
 * Useful for forcing immediate updates across all clients.
 */
export function useInvalidateFeatureFlagCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminFeatureFlagsApi.invalidateCache(),
    onSuccess: () => {
      // Force immediate refetch for real-time updates
      queryClient.invalidateQueries({ queryKey: ['config'] });
      queryClient.refetchQueries({ queryKey: ['config'] });
    },
  });
}
