// Publishing Types - matching backend DTOs

export type PostJobStatus = 'Draft' | 'Scheduled' | 'Publishing' | 'Published' | 'Failed' | 'Cancelled';

export interface Post {
  id: string;
  projectId: string;
  postText: string;
  hashtags: string[];
  createdAt: string;
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
}

export interface PostJob {
  id: string;
  connectedAccountId: string;
  platformName: string;
  destinationName: string;
  status: PostJobStatus;
  publishedAt?: string;
  platformPostId?: string;
  platformUrl?: string;
  errorMessage?: string;
}

export interface PublishDestination {
  connectedAccountId: string;
  destinationId: string;
}

export interface MediaItemInput {
  url: string;
  type: string;
  altText?: string;
}

export interface CreatePostRequest {
  projectId: string;
  contentItemId?: string;
  postText: string;
  hashtags?: string[];
}

export interface InstantPublishRequest {
  projectId: string;
  contentItemId?: string;
  postText: string;
  hashtags?: string[];
  destinations: PublishDestination[];
  mediaItems?: MediaItemInput[];
}

export interface PublishResult {
  postId: string;
  jobs: PostJob[];
  successful: number;
  failed: number;
}

export interface PostMetricsData {
  success: boolean;
  status?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  errorMessage?: string;
  lastUpdated?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCHEDULING TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface SchedulePostRequest {
  projectId: string;
  contentItemId?: string;
  postText: string;
  hashtags?: string[];
  destinations: PublishDestination[];
  scheduledAt: string; // ISO datetime string
  mediaItems?: MediaItemInput[];
  optimizedTexts?: Record<string, string>;
}

export interface ScheduledPostResponse {
  postId: string;
  projectId: string;
  postText: string;
  hashtags: string[];
  scheduledAt: string;
  createdAt: string;
  jobs: ScheduledJobInfo[];
}

export interface ScheduledJobInfo {
  jobId: string;
  connectedAccountId: string;
  platformName: string;
  destinationName: string;
  status: PostJobStatus;
  scheduledAt: string;
}

export interface RescheduleRequest {
  newScheduledAt: string; // ISO datetime string
}
