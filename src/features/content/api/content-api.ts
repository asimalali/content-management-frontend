import { api } from '@/lib/api';
import type { ContentItem, GenerateContentRequest, UpdateContentRequest } from '../types';

export const contentApi = {
  // Generate content using AI
  generate: async (data: GenerateContentRequest): Promise<ContentItem> => {
    const response = await api.post<ContentItem>('/content/generate', data);
    return response.data;
  },

  // Get all content items, optionally filtered by project
  getAll: async (projectId?: string): Promise<ContentItem[]> => {
    const response = await api.get<ContentItem[]>('/content', {
      params: projectId ? { projectId } : undefined,
    });
    return response.data;
  },

  // Get content item by ID
  getById: async (contentId: string): Promise<ContentItem> => {
    const response = await api.get<ContentItem>(`/content/${contentId}`);
    return response.data;
  },

  // Update content item
  update: async (contentId: string, data: UpdateContentRequest): Promise<ContentItem> => {
    const response = await api.put<ContentItem>(`/content/${contentId}`, data);
    return response.data;
  },

  // Delete content item
  delete: async (contentId: string): Promise<void> => {
    await api.delete(`/content/${contentId}`);
  },
};
