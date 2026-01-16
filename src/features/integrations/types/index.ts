// Integration Types - matching backend DTOs

export type Platform = 'X' | 'Facebook' | 'Instagram' | 'TikTok';
export type ConnectionStatus = 'Connected' | 'Expired' | 'Revoked' | 'Error';

export interface ConnectedAccount {
  id: string;
  userId: string;
  platform: Platform;
  platformUserId: string;
  platformUsername: string;
  displayName?: string;
  profileImageUrl?: string;
  status: ConnectionStatus;
  scopes: string[];
  connectedAt: string;
  expiresAt?: string;
}

export interface AvailablePlatform {
  platform: Platform;
  name: string;
  description: string;
  iconUrl: string;
  isEnabled: boolean;
}

export interface Destination {
  destinationId: string; // The platform-specific destination ID (from API)
  name: string;
  type: string;
}

export interface StartOAuthRequest {
  redirectUri: string;
}

export interface OAuthConnectResponse {
  authorizationUrl: string;
  state: string;
}

export interface OAuthCallbackRequest {
  code: string;
  redirectUri: string;
  state?: string;
}
