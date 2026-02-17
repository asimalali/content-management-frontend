import { api } from '@/lib/api';
import type {
  GenerateCalendarRequest,
  UpdateCalendarEntryRequest,
  ContentCalendarSummary,
  ContentCalendarDetail,
  CalendarEntry,
} from '../types';

export interface ContentCalendarResponse {
  id: string;
  title: string;
  duration: string;
  startDate: string;
  endDate: string;
  status: string;
  entryCount: number;
  createdAt: string;
}

export const calendarApi = {
  generate: (request: GenerateCalendarRequest) =>
    api.post<ContentCalendarResponse>('/calendar/generate', request),

  getByProject: (projectId: string) =>
    api.get<ContentCalendarSummary[]>(`/calendar/project/${projectId}`),

  getWithEntries: (calendarId: string) =>
    api.get<ContentCalendarDetail>(`/calendar/${calendarId}`),

  updateEntry: (entryId: string, request: UpdateCalendarEntryRequest) =>
    api.put<CalendarEntry>(`/calendar/entries/${entryId}`, request),

  generateEntryContent: (entryId: string) =>
    api.post<CalendarEntry>(`/calendar/entries/${entryId}/generate-content`),

  deleteCalendar: (calendarId: string) =>
    api.delete(`/calendar/${calendarId}`),
};
