import { useQuery } from '@tanstack/react-query';
import { configApi } from '../api/config-api';

export const configKeys = {
  all: ['config'] as const,
};

export function useConfig() {
  return useQuery({
    queryKey: configKeys.all,
    queryFn: configApi.getConfig,
    staleTime: 0, // Always fetch fresh config (feature flags need real-time updates)
  });
}
