import { api } from '@/lib/api';
import type { ContentIdeaResponse, RefreshIdeasResponse, GenerateFromIdeaResponse } from '../types';

export const ideaApi = {
  getByProject: (projectId: string) =>
    api.get<ContentIdeaResponse[]>(`/ideas/${projectId}`),

  refresh: (projectId: string, language = 'en') =>
    api.post<RefreshIdeasResponse>(`/ideas/${projectId}/refresh`, { language }),

  generateFromIdea: (ideaId: string) =>
    api.post<GenerateFromIdeaResponse>(`/ideas/${ideaId}/generate`),
};
