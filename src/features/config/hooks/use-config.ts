import { useQuery } from '@tanstack/react-query';
import { configApi } from '../api/config-api';

export const configKeys = {
  all: ['config'] as const,
};

export function useConfig() {
  return useQuery({
    queryKey: configKeys.all,
    queryFn: configApi.getConfig,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
}
