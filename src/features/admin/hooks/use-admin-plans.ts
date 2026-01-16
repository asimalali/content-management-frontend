import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminPlansApi } from '../api/admin-plans-api';
import type { CreatePlanRequest, UpdatePlanRequest, AddFeatureRequest } from '../types';

export const adminPlanKeys = {
  all: ['admin', 'plans'] as const,
  list: (includeInactive: boolean) =>
    ['admin', 'plans', 'list', { includeInactive }] as const,
  detail: (id: string) => ['admin', 'plans', id] as const,
};

export function useAdminPlans(includeInactive = false) {
  return useQuery({
    queryKey: adminPlanKeys.list(includeInactive),
    queryFn: () => adminPlansApi.getPlans(includeInactive),
  });
}

export function useAdminPlan(planId: string) {
  return useQuery({
    queryKey: adminPlanKeys.detail(planId),
    queryFn: () => adminPlansApi.getPlan(planId),
    enabled: !!planId,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlanRequest) => adminPlansApi.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPlanKeys.all });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: UpdatePlanRequest }) =>
      adminPlansApi.updatePlan(planId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPlanKeys.all });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => adminPlansApi.deletePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPlanKeys.all });
    },
  });
}

// Feature mutations
export function useAddFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, feature }: { planId: string; feature: AddFeatureRequest }) =>
      adminPlansApi.addFeature(planId, feature),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPlanKeys.all });
    },
  });
}

export function useUpdateFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      planId,
      featureId,
      feature,
    }: {
      planId: string;
      featureId: string;
      feature: Partial<AddFeatureRequest>;
    }) => adminPlansApi.updateFeature(planId, featureId, feature),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPlanKeys.all });
    },
  });
}

export function useDeleteFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, featureId }: { planId: string; featureId: string }) =>
      adminPlansApi.deleteFeature(planId, featureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPlanKeys.all });
    },
  });
}
