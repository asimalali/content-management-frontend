// Project types
export interface Project {
  id: string;
  userId: string;
  name: string;
  brandName?: string;
  industry?: string;
  description?: string;
  website?: string;
  status: 'Active' | 'Archived';
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProjectRequest {
  name: string;
  brandName?: string;
  industry?: string;
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

// Brand DNA types
export interface BrandDna {
  id: string;
  projectId: string;
  voice?: string;
  tone?: string;
  targetAudience?: string;
  keyMessages?: string[];
  competitors?: string[];
  uniqueSellingPoints?: string[];
  brandValues?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface GenerateBrandDnaRequest {
  projectId: string;
}
