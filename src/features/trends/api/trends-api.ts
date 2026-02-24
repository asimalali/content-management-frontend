import { api } from '@/lib/api';
import type {
  MonthlyTrendResponse,
  GenerateFromTrendRequest,
  GenerateFromTrendResponse,
  CreateMonthlyTrendRequest,
  UpdateMonthlyTrendRequest,
} from '../types';

export const trendsApi = {
  getAll: (params?: { month?: number; year?: number; platform?: string }) =>
    api.get<MonthlyTrendResponse[]>('/trends', { params }),

  getById: (id: string) =>
    api.get<MonthlyTrendResponse>(`/trends/${id}`),

  generateContent: (id: string, data: GenerateFromTrendRequest) =>
    api.post<GenerateFromTrendResponse>(`/trends/${id}/generate-content`, data),
};

export const adminTrendsApi = {
  getAll: () =>
    api.get<MonthlyTrendResponse[]>('/admin/trends'),

  create: (data: CreateMonthlyTrendRequest) =>
    api.post<MonthlyTrendResponse>('/admin/trends', data),

  update: (id: string, data: UpdateMonthlyTrendRequest) =>
    api.put<MonthlyTrendResponse>(`/admin/trends/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/trends/${id}`),
};
