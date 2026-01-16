import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaApi } from '../api/media-api';

// Query keys
export const mediaKeys = {
  all: ['media'] as const,
  detail: (id: string) => ['media', id] as const,
};

// Get all user's media files
export function useMedia() {
  return useQuery({
    queryKey: mediaKeys.all,
    queryFn: mediaApi.getAll,
  });
}

// Get a specific media file
export function useMediaItem(mediaId: string | undefined) {
  return useQuery({
    queryKey: mediaKeys.detail(mediaId!),
    queryFn: () => mediaApi.getById(mediaId!),
    enabled: !!mediaId,
  });
}

// Upload media file
export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => mediaApi.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

// Delete media file
export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mediaId: string) => mediaApi.delete(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}
