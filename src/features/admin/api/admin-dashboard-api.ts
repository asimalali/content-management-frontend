import { api } from '@/lib/api';
import type { DashboardStats } from '../types';

export const adminDashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/admin/dashboard/stats');
    return response.data;
  },
};
