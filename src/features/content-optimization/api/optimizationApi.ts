import { api } from '@/lib/axios';
import type {
  OptimizeRequest,
  MultiOptimizeRequest,
  PlatformOptimizationResponse,
  MultiPlatformOptimizationResponse,
} from '../types';

export const optimizationApi = {
  optimizeForPlatform: (request: OptimizeRequest) =>
    api.post<PlatformOptimizationResponse>('/api/content/optimize', request),

  optimizeForMultiplePlatforms: (request: MultiOptimizeRequest) =>
    api.post<MultiPlatformOptimizationResponse>('/api/content/optimize-multi', request),
};