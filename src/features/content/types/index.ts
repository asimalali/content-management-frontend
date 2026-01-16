// Content Types - matching backend DTOs

export type ContentStatus = 'Draft' | 'Final' | 'Published' | 'Archived';

export interface ContentItem {
  id: string;
  projectId: string;
  templateId: string;
  templateName: string;
  title: string;
  content: string;
  status: ContentStatus;
  metadata?: Record<string, unknown>;
  creditsUsed: number;
  createdAt: string;
  updatedAt?: string;
}

export type ContentLanguage = 'en' | 'ar' | 'both';

export interface GenerateContentRequest {
  projectId: string;
  templateId: string;
  inputs: Record<string, string>;
  language?: ContentLanguage;
}

export interface UpdateContentRequest {
  title?: string;
  content?: string;
  status?: ContentStatus;
}
