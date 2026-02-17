export interface PersonaResponse {
  id: string;
  name: string;
  avatarEmoji: string;
  age: number;
  occupation: string;
  summary: string;
  painPoints: string[];
  contentPreferences: string[];
  preferredPlatforms: string[];
  messagingDos: string[];
  messagingDonts: string[];
  createdAt: string;
}

export interface GeneratePersonasResponse {
  personas: PersonaResponse[];
  creditsUsed: number;
}

export interface UpdatePersonaRequest {
  name?: string;
  avatarEmoji?: string;
  age?: number;
  occupation?: string;
  summary?: string;
  painPoints?: string[];
  contentPreferences?: string[];
  preferredPlatforms?: string[];
  messagingDos?: string[];
  messagingDonts?: string[];
}
