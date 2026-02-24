export type Platform = 'X' | 'Instagram' | 'Facebook' | 'TikTok';

export interface GenerateBioRequest {
  projectId: string;
  targetPlatform: Platform;
  language?: 'en' | 'ar';
  additionalInstructions?: string;
}

export interface BioVariation {
  label: string;
  bio: string;
  characterCount: number;
}

export interface BioGenerationResponse {
  variations: BioVariation[];
  creditsConsumed: number;
}
