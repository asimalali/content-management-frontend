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
export type ContentLanguageMode = 'Arabic' | 'English' | 'Bilingual';
export type ContentTone = 'professional' | 'casual' | 'friendly' | 'formal';
export type ContentLength = 'short' | 'medium' | 'long';
export type ContentGoal = 'Awareness' | 'Engagement' | 'Conversion';

export interface GenerateContentRequest {
  projectId: string;
  templateId: string;
  inputs: Record<string, string>;
  language?: ContentLanguage;
  languageMode?: ContentLanguageMode;
  tone?: ContentTone;
  length?: ContentLength;
  includeEmojis?: boolean;
  personaId?: string;
  productIds?: string[];
  goal?: ContentGoal;
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

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE EDITING
// ═══════════════════════════════════════════════════════════════════════════

export interface EditImageRequest {
  projectId: string;
  prompt: string;
  image: File;
}

export interface ImageEditingResponse {
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
