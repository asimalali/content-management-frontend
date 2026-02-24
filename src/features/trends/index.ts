export {
  useTrends,
  useTrendDetail,
  useGenerateFromTrend,
  useAdminTrends,
  useCreateTrend,
  useUpdateTrend,
  useDeleteTrend,
  trendKeys,
} from './hooks/use-trends';

export type {
  MonthlyTrendResponse,
  GenerateFromTrendRequest,
  GenerateFromTrendResponse,
  CreateMonthlyTrendRequest,
  UpdateMonthlyTrendRequest,
} from './types';
