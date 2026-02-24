import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trendsApi, adminTrendsApi } from '../api/trends-api';
import { creditKeys } from '@/features/credits/hooks/use-credits';
import type {
  GenerateFromTrendRequest,
  CreateMonthlyTrendRequest,
  UpdateMonthlyTrendRequest,
} from '../types';

export const trendKeys = {
  all: ['trends'] as const,
  list: (params?: { month?: number; year?: number; platform?: string }) =>
    ['trends', 'list', params] as const,
  detail: (id: string) => ['trends', id] as const,
  admin: ['admin', 'trends'] as const,
};

// ─── User Hooks ───

export function useTrends(
  params?: { month?: number; year?: number; platform?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: trendKeys.list(params),
    queryFn: () => trendsApi.getAll(params).then((r) => r.data),
    enabled: options?.enabled ?? true,
  });
}

export function useTrendDetail(id: string | undefined) {
  return useQuery({
    queryKey: trendKeys.detail(id!),
    queryFn: () => trendsApi.getById(id!).then((r) => r.data),
    enabled: !!id,
  });
}

export function useGenerateFromTrend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ trendId, data }: { trendId: string; data: GenerateFromTrendRequest }) =>
      trendsApi.generateContent(trendId, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditKeys.balance });
      queryClient.invalidateQueries({ queryKey: trendKeys.all });
    },
  });
}

// ─── Admin Hooks ───

export function useAdminTrends() {
  return useQuery({
    queryKey: trendKeys.admin,
    queryFn: () => adminTrendsApi.getAll().then((r) => r.data),
  });
}

export function useCreateTrend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMonthlyTrendRequest) =>
      adminTrendsApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trendKeys.admin });
      queryClient.invalidateQueries({ queryKey: trendKeys.all });
    },
  });
}

export function useUpdateTrend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMonthlyTrendRequest }) =>
      adminTrendsApi.update(id, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trendKeys.admin });
      queryClient.invalidateQueries({ queryKey: trendKeys.all });
    },
  });
}

export function useDeleteTrend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminTrendsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trendKeys.admin });
      queryClient.invalidateQueries({ queryKey: trendKeys.all });
    },
  });
}
