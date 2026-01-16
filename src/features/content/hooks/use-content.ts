import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentApi } from '../api/content-api';
import { creditKeys } from '@/features/credits';
import type { GenerateContentRequest, UpdateContentRequest } from '../types';

// Query keys
export const contentKeys = {
  all: ['content'] as const,
  byProject: (projectId: string) => ['content', { projectId }] as const,
  detail: (id: string) => ['content', id] as const,
};

// Get all content items
export function useContentList(projectId?: string) {
  return useQuery({
    queryKey: projectId ? contentKeys.byProject(projectId) : contentKeys.all,
    queryFn: () => contentApi.getAll(projectId),
  });
}

// Get single content item
export function useContent(contentId: string | undefined) {
  return useQuery({
    queryKey: contentKeys.detail(contentId!),
    queryFn: () => contentApi.getById(contentId!),
    enabled: !!contentId,
  });
}

// Generate content
export function useGenerateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateContentRequest) => contentApi.generate(data),
    onSuccess: (_, variables) => {
      // Invalidate content lists
      queryClient.invalidateQueries({ queryKey: contentKeys.all });
      queryClient.invalidateQueries({ queryKey: contentKeys.byProject(variables.projectId) });
      // Invalidate credits (since generating content uses credits)
      queryClient.invalidateQueries({ queryKey: creditKeys.balance });
    },
  });
}

// Update content
export function useUpdateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contentId, data }: { contentId: string; data: UpdateContentRequest }) =>
      contentApi.update(contentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.all });
      queryClient.invalidateQueries({ queryKey: contentKeys.detail(variables.contentId) });
    },
  });
}

// Delete content
export function useDeleteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentId: string) => contentApi.delete(contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.all });
    },
  });
}
