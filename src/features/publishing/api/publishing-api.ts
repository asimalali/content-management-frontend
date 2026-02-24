import { api } from '@/lib/api';
import type {
  Post,
  PostJob,
  CreatePostRequest,
  InstantPublishRequest,
  PublishResult,
  PostMetricsData,
  SchedulePostRequest,
  ScheduledPostResponse,
  RescheduleRequest,
} from '../types';

export const publishingApi = {
  // Get user's posts
  getPosts: async (projectId?: string): Promise<Post[]> => {
    const params = projectId ? { projectId } : {};
    const response = await api.get<Post[]>('/posts', { params });
    return response.data;
  },

  // Get single post
  getPost: async (postId: string): Promise<Post> => {
    const response = await api.get<Post>(`/posts/${postId}`);
    return response.data;
  },

  // Create post without publishing
  createPost: async (data: CreatePostRequest): Promise<Post> => {
    const response = await api.post<Post>('/posts', data);
    return response.data;
  },

  // Get jobs for a post
  getJobs: async (postId: string): Promise<PostJob[]> => {
    const response = await api.get<PostJob[]>(`/posts/${postId}/jobs`);
    return response.data;
  },

  // Publish instantly
  publishInstant: async (data: InstantPublishRequest): Promise<PublishResult> => {
    const response = await api.post<PublishResult>('/posts/publish', data);
    return response.data;
  },

  // Retry failed job
  retryJob: async (jobId: string): Promise<PostJob> => {
    const response = await api.post<PostJob>(`/posts/jobs/${jobId}/retry`);
    return response.data;
  },

  // Delete post
  deletePost: async (postId: string): Promise<void> => {
    await api.delete(`/posts/${postId}`);
  },

  // Get post metrics
  getPostMetrics: async (jobId: string): Promise<PostMetricsData> => {
    const response = await api.get<PostMetricsData>(`/posts/jobs/${jobId}/metrics`);
    return response.data;
  },

  // Schedule a post for future publishing
  schedulePost: async (data: SchedulePostRequest): Promise<ScheduledPostResponse> => {
    const response = await api.post<ScheduledPostResponse>('/posts/schedule', data);
    return response.data;
  },

  // Get all scheduled posts
  getScheduledPosts: async (projectId?: string): Promise<ScheduledPostResponse[]> => {
    const params = projectId ? { projectId } : {};
    const response = await api.get<ScheduledPostResponse[]>('/posts/scheduled', { params });
    return response.data;
  },

  // Reschedule a scheduled job
  rescheduleJob: async (jobId: string, data: RescheduleRequest): Promise<PostJob> => {
    const response = await api.put<PostJob>(`/posts/jobs/${jobId}/reschedule`, data);
    return response.data;
  },

  // Cancel a scheduled job
  cancelScheduledJob: async (jobId: string): Promise<void> => {
    await api.delete(`/posts/jobs/${jobId}/cancel`);
  },
};
