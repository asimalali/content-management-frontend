import { api } from '@/lib/api';
import type { ContentItem, GenerateContentRequest, GenerateImageRequest, ImageGenerationResponse, PagedContentResult, UpdateContentRequest } from '../types';

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

  // Get content items for a project with pagination
  getPaged: async (projectId: string, page = 1, pageSize = 20): Promise<PagedContentResult> => {
    const response = await api.get<PagedContentResult>('/content/paged', {
      params: { projectId, page, pageSize },
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

  // Generate image using AI
  generateImage: async (data: GenerateImageRequest): Promise<ImageGenerationResponse> => {
    const response = await api.post<ImageGenerationResponse>('/content/generate-image', data);
    return response.data;
  },
};
