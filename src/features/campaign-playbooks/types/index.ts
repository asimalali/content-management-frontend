import type { CalendarDuration } from '@/features/content-calendar';
import type { Platform } from '@/features/integrations';

export interface PlaybookTimingDefault {
  platform: Platform;
  hour: number;
  minute: number;
}

export interface CampaignPlaybook {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  defaultDuration: CalendarDuration;
  defaultPlatforms: Platform[];
  contentPillars: string[];
  ctaGuidance: string[];
  timingDefaults: PlaybookTimingDefault[];
  promptInstructions: string;
}
