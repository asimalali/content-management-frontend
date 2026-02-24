import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, adminEventsApi } from '../api/events-api';
import { creditKeys } from '@/features/credits/hooks/use-credits';
import type {
  GenerateFromEventRequest,
  CreateGlobalEventRequest,
  UpdateGlobalEventRequest,
} from '../types';

export const eventKeys = {
  all: ['events'] as const,
  list: (params?: { month?: number; year?: number; category?: string }) =>
    ['events', 'list', params] as const,
  detail: (id: string) => ['events', id] as const,
  admin: ['admin', 'events'] as const,
};

// ─── User Hooks ───

export function useEvents(params?: { month?: number; year?: number; category?: string }) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => eventsApi.getAll(params).then((r) => r.data),
  });
}

export function useEventDetail(id: string | undefined) {
  return useQuery({
    queryKey: eventKeys.detail(id!),
    queryFn: () => eventsApi.getById(id!).then((r) => r.data),
    enabled: !!id,
  });
}

export function useGenerateFromEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: GenerateFromEventRequest }) =>
      eventsApi.generateContent(eventId, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditKeys.balance });
    },
  });
}

// ─── Admin Hooks ───

export function useAdminEvents() {
  return useQuery({
    queryKey: eventKeys.admin,
    queryFn: () => adminEventsApi.getAll().then((r) => r.data),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGlobalEventRequest) =>
      adminEventsApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.admin });
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGlobalEventRequest }) =>
      adminEventsApi.update(id, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.admin });
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminEventsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.admin });
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}
