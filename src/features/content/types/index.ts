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
export type ContentTone = 'professional' | 'casual' | 'friendly' | 'formal';
export type ContentLength = 'short' | 'medium' | 'long';

export interface GenerateContentRequest {
  projectId: string;
  templateId: string;
  inputs: Record<string, string>;
  language?: ContentLanguage;
  tone?: ContentTone;
  length?: ContentLength;
  includeEmojis?: boolean;
}

export interface UpdateContentRequest {
  title?: string;
  content?: string;
  status?: ContentStatus;
}

export interface PagedContentResult {
  items: ContentItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE GENERATION
// ═══════════════════════════════════════════════════════════════════════════

export type ImageSize = '1024x1024' | '1792x1024' | '1024x1792';
export type ImageQuality = 'standard' | 'hd';
export type ImageStyle = 'natural' | 'vivid';

export interface GenerateImageRequest {
  projectId: string;
  prompt: string;
  size?: ImageSize;
  quality?: ImageQuality;
  style?: ImageStyle;
}

export interface ImageGenerationResponse {
  mediaAsset: {
    id: string;
    fileName: string;
    url: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
  };
  revisedPrompt: string;
}
