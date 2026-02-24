import { api } from '@/lib/api';
import type {
  GlobalEventResponse,
  GenerateFromEventRequest,
  GenerateFromEventResponse,
  CreateGlobalEventRequest,
  UpdateGlobalEventRequest,
} from '../types';

export const eventsApi = {
  getAll: (params?: { month?: number; year?: number; category?: string }) =>
    api.get<GlobalEventResponse[]>('/events', { params }),

  getById: (id: string) =>
    api.get<GlobalEventResponse>(`/events/${id}`),

  generateContent: (id: string, data: GenerateFromEventRequest) =>
    api.post<GenerateFromEventResponse>(`/events/${id}/generate-content`, data),
};

export const adminEventsApi = {
  getAll: () =>
    api.get<GlobalEventResponse[]>('/admin/events'),

  create: (data: CreateGlobalEventRequest) =>
    api.post<GlobalEventResponse>('/admin/events', data),

  update: (id: string, data: UpdateGlobalEventRequest) =>
    api.put<GlobalEventResponse>(`/admin/events/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/events/${id}`),
};
