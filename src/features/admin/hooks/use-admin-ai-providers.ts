import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAiProvidersApi } from '../api/admin-ai-providers-api';
import type { UpdateAiProviderRequest } from '../types';

export const aiProviderKeys = {
  all: ['admin', 'ai-providers'] as const,
  detail: (key: string) => ['admin', 'ai-providers', key] as const,
};

/** Fetch all AI provider configurations */
export function useAiProviders() {
  return useQuery({
    queryKey: aiProviderKeys.all,
    queryFn: async () => {
      const response = await adminAiProvidersApi.getAll();
      return response.data;
    },
  });
}

/** Update a provider's configuration */
export function useUpdateAiProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ providerKey, data }: { providerKey: string; data: UpdateAiProviderRequest }) =>
      adminAiProvidersApi.update(providerKey, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiProviderKeys.all });
    },
  });
}

/** Activate a provider as the text generation provider */
export function useActivateTextProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (providerKey: string) =>
      adminAiProvidersApi.activateText(providerKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiProviderKeys.all });
    },
  });
}

/** Activate a provider as the image generation provider */
export function useActivateImageProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (providerKey: string) =>
      adminAiProvidersApi.activateImage(providerKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiProviderKeys.all });
    },
  });
}

/** Test provider connectivity */
export function useTestAiProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (providerKey: string) =>
      adminAiProvidersApi.testConnection(providerKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiProviderKeys.all });
    },
  });
}
