export interface Product {
  id: string;
  projectId: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price?: number;
  currency?: string;
  category?: string;
  imageUrl?: string;
  uniqueSellingPoint?: string;
  features: string[];
  isActive: boolean;
  createdAt: string;
}

export interface CreateProductRequest {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price?: number;
  currency?: string;
  category?: string;
  imageUrl?: string;
  uniqueSellingPoint?: string;
  features?: string[];
}

export interface UpdateProductRequest {
  name?: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  price?: number;
  currency?: string;
  category?: string;
  imageUrl?: string;
  uniqueSellingPoint?: string;
  features?: string[];
  isActive?: boolean;
}
