import { api } from '@/lib/api';
import type {
  AdminPlan,
  PlanFeature,
  CreatePlanRequest,
  UpdatePlanRequest,
  AddFeatureRequest,
} from '../types';

export const adminPlansApi = {
  getPlans: async (includeInactive = false): Promise<AdminPlan[]> => {
    const response = await api.get<AdminPlan[]>(
      `/admin/plans?includeInactive=${includeInactive}`
    );
    return response.data;
  },

  getPlan: async (planId: string): Promise<AdminPlan> => {
    const response = await api.get<AdminPlan>(`/admin/plans/${planId}`);
    return response.data;
  },

  createPlan: async (data: CreatePlanRequest): Promise<AdminPlan> => {
    const response = await api.post<AdminPlan>('/admin/plans', data);
    return response.data;
  },

  updatePlan: async (planId: string, data: UpdatePlanRequest): Promise<AdminPlan> => {
    const response = await api.put<AdminPlan>(`/admin/plans/${planId}`, data);
    return response.data;
  },

  deletePlan: async (planId: string): Promise<void> => {
    await api.delete(`/admin/plans/${planId}`);
  },

  // Feature management
  addFeature: async (planId: string, feature: AddFeatureRequest): Promise<PlanFeature> => {
    const response = await api.post<PlanFeature>(
      `/admin/plans/${planId}/features`,
      feature
    );
    return response.data;
  },

  updateFeature: async (
    planId: string,
    featureId: string,
    feature: Partial<AddFeatureRequest>
  ): Promise<PlanFeature> => {
    const response = await api.put<PlanFeature>(
      `/admin/plans/${planId}/features/${featureId}`,
      feature
    );
    return response.data;
  },

  deleteFeature: async (planId: string, featureId: string): Promise<void> => {
    await api.delete(`/admin/plans/${planId}/features/${featureId}`);
  },
};
