import { api } from '@/lib/api';
import type { Product, CreateProductRequest, UpdateProductRequest } from '../types';

export const productCatalogApi = {
  getProducts: async (projectId: string): Promise<Product[]> => {
    const response = await api.get<Product[]>(`/projects/${projectId}/products`);
    return response.data;
  },

  getProduct: async (projectId: string, productId: string): Promise<Product> => {
    const response = await api.get<Product>(`/projects/${projectId}/products/${productId}`);
    return response.data;
  },

  createProduct: async (projectId: string, data: CreateProductRequest): Promise<Product> => {
    const response = await api.post<Product>(`/projects/${projectId}/products`, data);
    return response.data;
  },

  updateProduct: async (projectId: string, productId: string, data: UpdateProductRequest): Promise<Product> => {
    const response = await api.put<Product>(`/projects/${projectId}/products/${productId}`, data);
    return response.data;
  },

  deleteProduct: async (projectId: string, productId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/products/${productId}`);
  },
};
