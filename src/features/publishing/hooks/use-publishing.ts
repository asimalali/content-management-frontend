import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publishingApi } from '../api/publishing-api';
import type { CreatePostRequest, InstantPublishRequest, SchedulePostRequest, RescheduleRequest } from '../types';

// Query keys
export const postKeys = {
  all: ['posts'] as const,
  list: (projectId?: string) => projectId ? ['posts', { projectId }] : ['posts'] as const,
  detail: (id: string) => ['posts', id] as const,
  jobs: (id: string) => ['posts', id, 'jobs'] as const,
  metrics: (jobId: string) => ['posts', 'jobs', jobId, 'metrics'] as const,
  scheduled: ['posts', 'scheduled'] as const,
  scheduledList: (projectId?: string) => projectId ? ['posts', 'scheduled', { projectId }] : ['posts', 'scheduled'] as const,
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

// ═══════════════════════════════════════════════════════════════════════════
// SCHEDULING HOOKS
// ═══════════════════════════════════════════════════════════════════════════

// Get scheduled posts
export function useScheduledPosts(projectId?: string) {
  return useQuery({
    queryKey: postKeys.scheduledList(projectId),
    queryFn: () => publishingApi.getScheduledPosts(projectId),
  });
}

// Schedule a post
export function useSchedulePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SchedulePostRequest) => publishingApi.schedulePost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      queryClient.invalidateQueries({ queryKey: postKeys.scheduled });
    },
  });
}

// Reschedule a job
export function useRescheduleJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: RescheduleRequest }) =>
      publishingApi.rescheduleJob(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      queryClient.invalidateQueries({ queryKey: postKeys.scheduled });
    },
  });
}

// Cancel a scheduled job
export function useCancelScheduledJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => publishingApi.cancelScheduledJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      queryClient.invalidateQueries({ queryKey: postKeys.scheduled });
    },
  });
}
