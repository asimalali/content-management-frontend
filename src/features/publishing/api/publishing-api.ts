import { api } from '@/lib/api';
import type {
  Post,
  PostJob,
  CreatePostRequest,
  InstantPublishRequest,
  PublishResult,
  PostMetrics,
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
  getPostMetrics: async (jobId: string): Promise<PostMetrics> => {
    const response = await api.get<PostMetrics>(`/posts/jobs/${jobId}/metrics`);
    return response.data;
  },
};
