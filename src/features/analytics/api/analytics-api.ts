import { api } from '@/lib/api';
import type { AnalyticsBestTimes, AnalyticsSummary } from '../types';

export const analyticsApi = {
  getSummary: async (projectId: string): Promise<AnalyticsSummary> => {
    const response = await api.get<AnalyticsSummary>(`/analytics/${projectId}/summary`);
    return response.data;
  },

  getBestTimes: async (projectId: string): Promise<AnalyticsBestTimes> => {
    const response = await api.get<AnalyticsBestTimes>(`/analytics/${projectId}/best-times`);
    return response.data;
  },
};
