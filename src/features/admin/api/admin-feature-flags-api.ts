import { api } from '@/lib/api';

export interface FeatureFlag {
  id: string;
  flagKey: string;
  displayName: string;
  description: string;
  category: string;
  isEnabled: boolean;
  isComingSoon: boolean;
  flagType: string;
  platformSettings?: Record<string, boolean>;
  isSystemFlag: boolean;
  displayOrder: number;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

export interface CreateFeatureFlagRequest {
  flagKey: string;
  displayName: string;
  description: string;
  category: string;
  isEnabled: boolean;
  flagType?: string;
  platformSettings?: Record<string, boolean>;
  displayOrder?: number;
}

export interface UpdateFeatureFlagRequest {
  displayName?: string;
  description?: string;
  isEnabled?: boolean;
  isComingSoon?: boolean;
  platformSettings?: Record<string, boolean>;
  displayOrder?: number;
}

export const adminFeatureFlagsApi = {
  getAllFlags: () => api.get<FeatureFlag[]>('/admin/feature-flags'),

  getFlagByKey: (flagKey: string) =>
    api.get<FeatureFlag>(`/admin/feature-flags/${flagKey}`),

  createFlag: (data: CreateFeatureFlagRequest) =>
    api.post<FeatureFlag>('/admin/feature-flags', data),

  updateFlag: (flagKey: string, data: UpdateFeatureFlagRequest) =>
    api.put<FeatureFlag>(`/admin/feature-flags/${flagKey}`, data),

  deleteFlag: (flagKey: string) =>
    api.delete(`/admin/feature-flags/${flagKey}`),

  invalidateCache: () =>
    api.post('/admin/feature-flags/invalidate-cache'),
};
