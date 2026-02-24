import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productCatalogApi } from '../api/product-catalog-api';
import type { CreateProductRequest, UpdateProductRequest } from '../types';

export const productKeys = {
  all: ['products'] as const,
  list: (projectId: string) => ['products', { projectId }] as const,
  detail: (projectId: string, productId: string) => ['products', projectId, productId] as const,
};

export function useProducts(projectId: string | undefined) {
  return useQuery({
    queryKey: productKeys.list(projectId!),
    queryFn: () => productCatalogApi.getProducts(projectId!),
    enabled: !!projectId,
  });
}

export function useProduct(projectId: string | undefined, productId: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(projectId!, productId!),
    queryFn: () => productCatalogApi.getProduct(projectId!, productId!),
    enabled: !!projectId && !!productId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: CreateProductRequest }) =>
      productCatalogApi.createProduct(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      productId,
      data,
    }: {
      projectId: string;
      productId: string;
      data: UpdateProductRequest;
    }) => productCatalogApi.updateProduct(projectId, productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, productId }: { projectId: string; productId: string }) =>
      productCatalogApi.deleteProduct(projectId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
