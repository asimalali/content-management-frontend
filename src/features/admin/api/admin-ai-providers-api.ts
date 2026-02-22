import { api } from '@/lib/api';
import type {
  AiProviderConfiguration,
  UpdateAiProviderRequest,
  AiProviderTestResult,
} from '../types';

export const adminAiProvidersApi = {
  getAll: () =>
    api.get<AiProviderConfiguration[]>('/admin/ai-providers'),

  getByKey: (providerKey: string) =>
    api.get<AiProviderConfiguration>(`/admin/ai-providers/${providerKey}`),

  update: (providerKey: string, data: UpdateAiProviderRequest) =>
    api.put<AiProviderConfiguration>(`/admin/ai-providers/${providerKey}`, data),

  activateText: (providerKey: string) =>
    api.post<AiProviderConfiguration>(`/admin/ai-providers/${providerKey}/activate`),

  activateImage: (providerKey: string) =>
    api.post<AiProviderConfiguration>(`/admin/ai-providers/${providerKey}/activate-image`),

  testConnection: (providerKey: string) =>
    api.post<AiProviderTestResult>(`/admin/ai-providers/${providerKey}/test`),
};
