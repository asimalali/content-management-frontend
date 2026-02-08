import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publishingApi } from '../api/publishing-api';
import type { CreatePostRequest, InstantPublishRequest } from '../types';

// Query keys
export const postKeys = {
  all: ['posts'] as const,
  list: (projectId?: string) => projectId ? ['posts', { projectId }] : ['posts'] as const,
  detail: (id: string) => ['posts', id] as const,
  jobs: (id: string) => ['posts', id, 'jobs'] as const,
  metrics: (jobId: string) => ['posts', 'jobs', jobId, 'metrics'] as const,
};

// ═══════════════════════════════════════════════════════════════════════════
// POSTS HOOKS
// ═══════════════════════════════════════════════════════════════════════════

// Get all posts
export function usePosts(projectId?: string) {
  return useQuery({
    queryKey: postKeys.list(projectId),
    queryFn: () => publishingApi.getPosts(projectId),
  });
}

// Get single post
export function usePost(postId: string | undefined) {
  return useQuery({
    queryKey: postKeys.detail(postId!),
    queryFn: () => publishingApi.getPost(postId!),
    enabled: !!postId,
  });
}

// Get post jobs
export function usePostJobs(postId: string | undefined) {
  return useQuery({
    queryKey: postKeys.jobs(postId!),
    queryFn: () => publishingApi.getJobs(postId!),
    enabled: !!postId,
  });
}

// Get post metrics
export function usePostMetrics(jobId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: postKeys.metrics(jobId!),
    queryFn: () => publishingApi.getPostMetrics(jobId!),
    enabled: !!jobId && enabled,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 25000, // Data is fresh for 25 seconds
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════════════════════

// Create post (without publishing)
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostRequest) => publishingApi.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

// Publish instantly
export function usePublishInstant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InstantPublishRequest) => publishingApi.publishInstant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

// Retry failed job
export function useRetryJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => publishingApi.retryJob(jobId),
    onSuccess: () => {
      // We need to get the postId from somewhere to invalidate correctly
      // For now, invalidate all posts
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

// Delete post
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => publishingApi.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
