import type { Platform } from '@/types/integration';

export interface OptimizeRequest {
  projectId: string;
  originalText: string;
  hashtags?: string[];
  targetPlatform: Platform;
  language?: string;
}

export interface MultiOptimizeRequest {
  projectId: string;
  originalText: string;
  hashtags?: string[];
  targetPlatforms: Platform[];
  language?: string;
}

export interface PlatformOptimizationResponse {
  platform: Platform;
  optimizedText: string;
  suggestedHashtags: string[];
  optimizationNotes?: string;
}

export interface MultiPlatformOptimizationResponse {
  originalText: string;
  optimizations: PlatformOptimizationResponse[];
  totalPlatforms: number;
}

export interface OptimizationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  hashtags?: string[];
  projectId: string;
  onOptimizationComplete?: (optimizedTexts: Record<string, string>) => void;
}