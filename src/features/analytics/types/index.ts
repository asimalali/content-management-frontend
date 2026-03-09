import type { Platform } from '@/features/integrations';

export interface AnalyticsSummary {
  projectId: string;
  totalPublishedPosts: number;
  totalPublishedJobs: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalViews: number;
  averageEngagementScore: number;
  platformBreakdown: PlatformAnalytics[];
  topPosts: TopPostAnalytics[];
  engagementHeatmap: EngagementHeatmapPoint[];
}

export interface PlatformAnalytics {
  platform: Platform;
  publishedJobs: number;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  averageEngagementScore: number;
}

export interface TopPostAnalytics {
  jobId: string;
  postId: string;
  platform: Platform;
  postText: string;
  publishedAt?: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  engagementScore: number;
  platformUrl?: string;
}

export interface EngagementHeatmapPoint {
  dayOfWeek: number;
  hourOfDay: number;
  averageEngagementScore: number;
  sampleSize: number;
}

export interface AnalyticsBestTimes {
  projectId: string;
  lookbackDays: number;
  minimumSampleSize: number;
  recommendations: BestTimeRecommendation[];
  message?: string;
}

export interface BestTimeRecommendation {
  platform: Platform;
  dayOfWeek: number;
  hourOfDay: number;
  minute: number;
  averageEngagementScore: number;
  sampleSize: number;
  confidence: number;
  nextOccurrenceUtc: string;
}
