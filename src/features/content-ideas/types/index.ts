export interface ContentIdeaResponse {
  id: string;
  topic: string;
  description: string;
  suggestedPlatform: string;
  contentType: string;
  suggestedTemplate: string;
  isUsed: boolean;
  createdAt: string;
}

export interface RefreshIdeasResponse {
  ideas: ContentIdeaResponse[];
  creditsUsed: number;
}

export interface GenerateFromIdeaResponse {
  contentItemId: string;
  generatedContent: string;
  creditsUsed: number;
}
