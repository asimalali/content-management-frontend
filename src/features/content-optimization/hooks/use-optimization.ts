import { useMutation } from '@tanstack/react-query';
import { optimizationApi } from '../api/optimization-api';
import type {
  OptimizeRequest,
  MultiOptimizeRequest,
  BrandConsistencyRequest,
  HashtagAnalysisRequest,
  RepurposeRequest,
} from '../types';

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

export function useCheckBrandVoice() {
  return useMutation({
    mutationFn: (request: BrandConsistencyRequest) => optimizationApi.checkBrandVoice(request),
  });
}

export function useAnalyzeHashtags() {
  return useMutation({
    mutationFn: (request: HashtagAnalysisRequest) => optimizationApi.analyzeHashtags(request),
  });
}

export function useRepurposeContent() {
  return useMutation({
    mutationFn: (request: RepurposeRequest) => optimizationApi.repurposeContent(request),
  });
}