import { useQuery } from '@tanstack/react-query';
import { adminDashboardApi } from '../api/admin-dashboard-api';

export const adminDashboardKeys = {
  all: ['admin', 'dashboard'] as const,
  stats: ['admin', 'dashboard', 'stats'] as const,
};

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminDashboardKeys.stats,
    queryFn: adminDashboardApi.getStats,
  });
}
