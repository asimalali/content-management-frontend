import { useMutation } from '@tanstack/react-query';
import { optimizationApi } from '../api/optimizationApi';
import type { OptimizeRequest, MultiOptimizeRequest } from '../types';

export function useOptimizeForPlatform() {
  return useMutation({
    mutationFn: (request: OptimizeRequest) => optimizationApi.optimizeForPlatform(request),
  });
}

export function useOptimizeForMultiplePlatforms() {
  return useMutation({
    mutationFn: (request: MultiOptimizeRequest) => optimizationApi.optimizeForMultiplePlatforms(request),
  });
}