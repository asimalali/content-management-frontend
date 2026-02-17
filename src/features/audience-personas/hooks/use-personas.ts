import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { personaApi } from '../api/persona-api';
import { creditKeys } from '@/features/credits';
import type { UpdatePersonaRequest } from '../types';

export const personaKeys = {
  all: ['personas'] as const,
  byProject: (projectId: string) => ['personas', 'project', projectId] as const,
};

export function useProjectPersonas(projectId: string | undefined) {
  return useQuery({
    queryKey: personaKeys.byProject(projectId!),
    queryFn: () => personaApi.getByProject(projectId!).then((r) => r.data),
    enabled: !!projectId,
  });
}

export function useGeneratePersonas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, language }: { projectId: string; language?: string }) =>
      personaApi.generate(projectId, language).then((r) => r.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: personaKeys.byProject(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: creditKeys.balance });
    },
  });
}

export function useUpdatePersona() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, personaId, request }: { projectId: string; personaId: string; request: UpdatePersonaRequest }) =>
      personaApi.update(projectId, personaId, request).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personaKeys.all });
    },
  });
}
