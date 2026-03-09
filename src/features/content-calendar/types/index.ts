import type { Platform } from '@/features/integrations';
import type { ContentGoal, ContentLanguageMode } from '@/features/content';

export type CalendarStatus = 'Active' | 'Completed' | 'Archived';
export type CalendarEntryStatus = 'Idea' | 'ContentGenerated' | 'Published' | 'Skipped';
export type CalendarDuration = 'Weekly' | 'Monthly';
export type AutoScheduleMode = 'None' | 'BestTime';

export interface GenerateCalendarRequest {
  projectId: string;
  duration: CalendarDuration;
  targetPlatforms: Platform[];
  language?: string;
  playbookId?: string;
  productIds?: string[];
  goal?: ContentGoal;
  languageMode?: ContentLanguageMode;
  autoScheduleMode?: AutoScheduleMode;
}

export interface UpdateCalendarEntryRequest {
  topicTitle?: string;
  topicDescription?: string;
  status?: CalendarEntryStatus;
}

export interface ContentCalendarSummary {
  id: string;
  title: string;
  duration: CalendarDuration;
  startDate: string;
  endDate: string;
  status: CalendarStatus;
  entryCount: number;
  contentGeneratedCount: number;
  createdAt: string;
}

export interface ContentCalendarDetail {
  id: string;
  title: string;
  duration: CalendarDuration;
  startDate: string;
  endDate: string;
  status: CalendarStatus;
  entries: CalendarEntry[];
  createdAt: string;
}

export interface CalendarEntry {
  id: string;
  scheduledDate: string;
  topicTitle: string;
  topicDescription: string;
  targetPlatform: Platform;
  status: CalendarEntryStatus;
  generatedContent?: string;
  suggestedHashtags?: string[];
  sortOrder: number;
}
