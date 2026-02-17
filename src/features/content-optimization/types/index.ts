import type { Platform } from '@/features/integrations';

export interface OptimizeRequest {
  ProjectId: string;
  OriginalText: string;
  Hashtags?: string[];
  TargetPlatform: Platform;
  Language?: string;
}

export interface MultiOptimizeRequest {
  ProjectId: string;
  OriginalText: string;
  Hashtags?: string[];
  TargetPlatforms: Platform[];
  Language?: string;
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
  contentId?: string;
  onOptimizationComplete?: (optimizedTexts: Record<string, string>) => void;
}

// Brand Voice Consistency
export interface BrandConsistencyRequest {
  ProjectId: string;
  ContentText: string;
  Language?: string;
}

export interface BrandAspectScores {
  tone: number;
  vocabulary: number;
  audienceAlignment: number;
}

export interface BrandConsistencyResponse {
  overallScore: number;
  aspectScores: BrandAspectScores;
  feedback: string[];
  suggestions: string[];
}

export interface BrandFeedbackPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  result?: BrandConsistencyResponse;
  contentText?: string;
  projectId?: string;
  language?: string;
}

// Hashtag Analysis
export interface HashtagAnalysisRequest {
  ProjectId: string;
  ContentText: string;
  TargetPlatform: Platform;
  ContentTopic?: string;
  Language?: string;
}

export interface HashtagSuggestion {
  tag: string;
  reason: string;
}

export interface HashtagAnalysisResponse {
  reach: HashtagSuggestion[];
  targeted: HashtagSuggestion[];
  niche: HashtagSuggestion[];
  strategyNotes: string;
}

export interface HashtagAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
  contentText: string;
  projectId: string;
  contentId?: string;
  onHashtagsSelected?: (hashtags: string[]) => void;
}

// Content Repurposing
export interface RepurposeRequest {
  ContentId: string;
  ProjectId: string;
  TargetPlatforms: Platform[];
  Language?: string;
}

export interface RepurposedVariant {
  platform: Platform;
  content: string;
  suggestedHashtags: string[];
  adaptationNotes: string;
}

export interface RepurposeResponse {
  originalText: string;
  variants: RepurposedVariant[];
}

export interface RepurposeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  projectId: string;
  contentId?: string;
}