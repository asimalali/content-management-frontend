import { useQuery } from '@tanstack/react-query';
import { templatesApi } from '../api/templates-api';
import type { TemplateCategory } from '../types';

// Query keys
export const templateKeys = {
  all: ['templates'] as const,
  byCategory: (category: TemplateCategory) => ['templates', { category }] as const,
  detail: (id: string) => ['templates', id] as const,
};

// Get all templates
export function useTemplates(category?: TemplateCategory) {
  return useQuery({
    queryKey: category ? templateKeys.byCategory(category) : templateKeys.all,
    queryFn: () => templatesApi.getAll(category),
  });
}

// Get single template
export function useTemplate(templateId: string | undefined) {
  return useQuery({
    queryKey: templateKeys.detail(templateId!),
    queryFn: () => templatesApi.getById(templateId!),
    enabled: !!templateId,
  });
}
