import { api } from '@/lib/api';
import type { Template, TemplateCategory } from '../types';

export const templatesApi = {
  // Get all templates, optionally filtered by category
  getAll: async (category?: TemplateCategory): Promise<Template[]> => {
    const response = await api.get<Template[]>('/templates', {
      params: category ? { category } : undefined,
    });
    return response.data;
  },

  // Get template by ID
  getById: async (templateId: string): Promise<Template> => {
    const response = await api.get<Template>(`/templates/${templateId}`);
    return response.data;
  },
};
