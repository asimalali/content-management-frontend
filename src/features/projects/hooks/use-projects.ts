import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects-api';
import type { CreateProjectRequest, UpdateProjectRequest, UpdateBrandDnaRequest } from '../types';

// Query keys
export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: string) => ['projects', id] as const,
  dna: (id: string) => ['projects', id, 'dna'] as const,
};

// Get all projects
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: projectsApi.getAll,
  });
}

// Get single project
export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(projectId!),
    queryFn: () => projectsApi.getById(projectId!),
    enabled: !!projectId,
  });
}

// Create project
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

// Update project
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: UpdateProjectRequest }) =>
      projectsApi.update(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
    },
  });
}

// Delete project
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectsApi.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

// Get brand DNA
export function useBrandDna(projectId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.dna(projectId!),
    queryFn: () => projectsApi.getBrandDna(projectId!),
    enabled: !!projectId,
  });
}

// Generate brand DNA
export function useGenerateBrandDna() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectsApi.generateBrandDna(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.dna(projectId) });
    },
  });
}

// Update brand DNA
export function useUpdateBrandDna() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: UpdateBrandDnaRequest }) =>
      projectsApi.updateBrandDna(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.dna(variables.projectId) });
    },
  });
}
