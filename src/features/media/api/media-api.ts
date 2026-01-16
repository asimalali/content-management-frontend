import { api } from '@/lib/api';
import type { MediaAsset } from '../types';

export const mediaApi = {
  // Upload a media file
  upload: async (file: File): Promise<MediaAsset> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<MediaAsset>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all user's media files
  getAll: async (): Promise<MediaAsset[]> => {
    const response = await api.get<MediaAsset[]>('/media');
    return response.data;
  },

  // Get a specific media file
  getById: async (mediaId: string): Promise<MediaAsset> => {
    const response = await api.get<MediaAsset>(`/media/${mediaId}`);
    return response.data;
  },

  // Delete a media file
  delete: async (mediaId: string): Promise<void> => {
    await api.delete(`/media/${mediaId}`);
  },
};
