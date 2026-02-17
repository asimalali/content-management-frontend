import { api } from '@/lib/api';
import type { PersonaResponse, GeneratePersonasResponse, UpdatePersonaRequest } from '../types';

export const personaApi = {
  getByProject: (projectId: string) =>
    api.get<PersonaResponse[]>(`/projects/${projectId}/personas`),

  generate: (projectId: string, language = 'en') =>
    api.post<GeneratePersonasResponse>(`/projects/${projectId}/personas/generate`, { language }),

  update: (projectId: string, personaId: string, request: UpdatePersonaRequest) =>
    api.put<PersonaResponse>(`/projects/${projectId}/personas/${personaId}`, request),
};
