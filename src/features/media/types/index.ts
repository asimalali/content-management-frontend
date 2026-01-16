// Media Types - matching backend DTOs

export interface MediaAsset {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export type MediaType = 'image' | 'video';

export function getMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith('video/')) {
    return 'video';
  }
  return 'image';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
