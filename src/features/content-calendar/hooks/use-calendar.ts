import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarApi } from '../api/calendar-api';
import type { GenerateCalendarRequest, UpdateCalendarEntryRequest } from '../types';

export const calendarKeys = {
  all: ['calendars'] as const,
  byProject: (projectId: string) => ['calendars', 'project', projectId] as const,
  detail: (calendarId: string) => ['calendars', calendarId] as const,
};

export function useProjectCalendars(projectId: string | undefined) {
  return useQuery({
    queryKey: calendarKeys.byProject(projectId!),
    queryFn: () => calendarApi.getByProject(projectId!),
    enabled: !!projectId,
  });
}

export function useCalendarDetail(calendarId: string | undefined) {
  return useQuery({
    queryKey: calendarKeys.detail(calendarId!),
    queryFn: () => calendarApi.getWithEntries(calendarId!),
    enabled: !!calendarId,
  });
}

export function useGenerateCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: GenerateCalendarRequest) => calendarApi.generate(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.byProject(variables.projectId) });
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entryId, request }: { entryId: string; request: UpdateCalendarEntryRequest }) =>
      calendarApi.updateEntry(entryId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
  });
}

export function useGenerateEntryContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: string) => calendarApi.generateEntryContent(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
  });
}

export function useDeleteCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (calendarId: string) => calendarApi.deleteCalendar(calendarId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
  });
}
