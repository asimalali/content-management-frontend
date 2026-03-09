import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics-api';

export const analyticsKeys = {
  all: ['analytics'] as const,
  summary: (projectId: string) => ['analytics', projectId, 'summary'] as const,
  bestTimes: (projectId: string) => ['analytics', projectId, 'best-times'] as const,
};

export function useAnalyticsSummary(projectId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: analyticsKeys.summary(projectId!),
    queryFn: () => analyticsApi.getSummary(projectId!),
    enabled: !!projectId && enabled,
  });
}

export function useAnalyticsBestTimes(projectId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: analyticsKeys.bestTimes(projectId!),
    queryFn: () => analyticsApi.getBestTimes(projectId!),
    enabled: !!projectId && enabled,
  });
}
