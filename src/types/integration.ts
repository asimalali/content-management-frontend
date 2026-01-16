// Social platform types
export type Platform = 'X' | 'Facebook' | 'Instagram' | 'TikTok';

export interface ConnectedAccount {
  id: string;
  userId: string;
  platform: Platform;
  platformUserId?: string;
  platformUsername?: string;
  status: 'Connected' | 'Expired' | 'Revoked' | 'Error';
  connectedAt: string;
  expiresAt?: string;
}

export interface ConnectedDestination {
  id: string;
  connectedAccountId: string;
  destinationType: string;
  destinationId: string;
  destinationName?: string;
  isSelected: boolean;
}

export interface AvailableConnector {
  platform: Platform;
  displayName: string;
  description: string;
  iconUrl?: string;
  isEnabled: boolean;
}

export interface ConnectAccountResponse {
  authorizationUrl: string;
}

// Publishing types
export interface Post {
  id: string;
  projectId: string;
  contentItemId?: string;
  postText: string;
  hashtags?: string[];
  mediaAssetIds?: string[];
  createdAt: string;
}

export interface PostJob {
  id: string;
  postId: string;
  connectedAccountId: string;
  destinationId?: string;
  scheduledAt?: string;
  status: 'Draft' | 'Scheduled' | 'Publishing' | 'Published' | 'Failed' | 'Cancelled';
  platformPostId?: string;
  platformUrl?: string;
  errorMessage?: string;
  publishedAt?: string;
}

export interface CreatePostRequest {
  projectId: string;
  contentItemId?: string;
  postText: string;
  hashtags?: string[];
  destinationIds: string[];
  scheduledAt?: string;
}
