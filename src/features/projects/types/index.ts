// Project Types - matching backend DTOs

export interface Project {
  id: string;
  userId: string;
  name: string;
  brandName: string;
  industry: string;
  description?: string;
  website?: string;
  status: 'Active' | 'Archived';
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProjectRequest {
  name: string;
  brandName: string;
  industry: string;
  description?: string;
  website?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  brandName?: string;
  industry?: string;
  description?: string;
  website?: string;
}

export interface BrandDna {
  id: string;
  projectId: string;
  tone: string;
  voice: string;
  values: string[];
  targetAudience: string;
  uniqueSellingPoints: string[];
  keywords: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateBrandDnaRequest {
  tone?: string;
  voice?: string;
  values?: string[];
  targetAudience?: string;
  uniqueSellingPoints?: string[];
  keywords?: string[];
}
