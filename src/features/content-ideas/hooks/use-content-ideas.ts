import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ideaApi } from '../api/idea-api';
import { creditKeys } from '@/features/credits';

export const ideaKeys = {
  all: ['ideas'] as const,
  byProject: (projectId: string) => ['ideas', 'project', projectId] as const,
};

export function useProjectIdeas(projectId: string | undefined) {
  return useQuery({
    queryKey: ideaKeys.byProject(projectId!),
    queryFn: () => ideaApi.getByProject(projectId!).then((r) => r.data),
    enabled: !!projectId,
  });
}

export function useRefreshIdeas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, language }: { projectId: string; language?: string }) =>
      ideaApi.refresh(projectId, language).then((r) => r.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ideaKeys.byProject(variables.projectId) });
    },
  });
}

export function useGenerateFromIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ideaId: string) =>
      ideaApi.generateFromIdea(ideaId).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ideaKeys.all });
      queryClient.invalidateQueries({ queryKey: creditKeys.balance });
    },
  });
}
