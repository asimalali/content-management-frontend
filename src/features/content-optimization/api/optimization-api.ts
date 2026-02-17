import { api } from '@/lib/api';
import type {
  OptimizeRequest,
  MultiOptimizeRequest,
  PlatformOptimizationResponse,
  MultiPlatformOptimizationResponse,
  BrandConsistencyRequest,
  BrandConsistencyResponse,
  HashtagAnalysisRequest,
  HashtagAnalysisResponse,
  RepurposeRequest,
  RepurposeResponse,
} from '../types';

export const optimizationApi = {
  optimizeForPlatform: (request: OptimizeRequest) =>
    api.post<PlatformOptimizationResponse>('/content/optimize', request),

  optimizeForMultiplePlatforms: (request: MultiOptimizeRequest) =>
    api.post<MultiPlatformOptimizationResponse>('/content/optimize-multi', request),

  checkBrandVoice: (request: BrandConsistencyRequest) =>
    api.post<BrandConsistencyResponse>('/content/check-brand-voice', request),

  analyzeHashtags: (request: HashtagAnalysisRequest) =>
    api.post<HashtagAnalysisResponse>('/content/analyze-hashtags', request),

  repurposeContent: (request: RepurposeRequest) =>
    api.post<RepurposeResponse>('/content/repurpose', request),
};