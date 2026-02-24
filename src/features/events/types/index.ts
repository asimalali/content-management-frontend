export type EventCategory =
  | 'Commercial'
  | 'Cultural'
  | 'Religious'
  | 'Sports'
  | 'Health'
  | 'Social'
  | 'Technical'
  | 'Environmental'
  | 'Educational';

export interface GlobalEventResponse {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  eventDate: string;
  category: EventCategory;
  imageUrl?: string;
  isRecurringYearly: boolean;
  tags?: string;
  isActive: boolean;
  createdAt: string;
}

export interface GenerateFromEventRequest {
  projectId: string;
  platform?: string;
  language?: string;
}

export interface GenerateFromEventResponse {
  contentItemId: string;
  generatedContent: string;
  creditsUsed: number;
}

export interface CreateGlobalEventRequest {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  eventDate: string;
  category: EventCategory;
  imageUrl?: string;
  isRecurringYearly?: boolean;
  tags?: string;
  isActive?: boolean;
}

export interface UpdateGlobalEventRequest {
  title?: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  eventDate?: string;
  category?: EventCategory;
  imageUrl?: string;
  isRecurringYearly?: boolean;
  tags?: string;
  isActive?: boolean;
}
