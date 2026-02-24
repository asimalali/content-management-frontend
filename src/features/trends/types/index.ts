export interface MonthlyTrendResponse {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  platform: string;
  trendMonth: number;
  trendYear: number;
  contentType: string;
  exampleContent?: string;
  sourceUrl?: string;
  thumbnailUrl?: string;
  usageCount: number;
  tags?: string;
  isActive: boolean;
  createdAt: string;
}

export interface GenerateFromTrendRequest {
  projectId: string;
  language?: string;
}

export interface GenerateFromTrendResponse {
  contentItemId: string;
  generatedContent: string;
  creditsUsed: number;
}

export interface CreateMonthlyTrendRequest {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  platform: string;
  trendMonth: number;
  trendYear: number;
  contentType: string;
  exampleContent?: string;
  sourceUrl?: string;
  thumbnailUrl?: string;
  tags?: string;
  isActive?: boolean;
}

export interface UpdateMonthlyTrendRequest {
  title?: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  platform?: string;
  trendMonth?: number;
  trendYear?: number;
  contentType?: string;
  exampleContent?: string;
  sourceUrl?: string;
  thumbnailUrl?: string;
  tags?: string;
  isActive?: boolean;
}
