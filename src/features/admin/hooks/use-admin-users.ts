import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUsersApi } from '../api/admin-users-api';
import type { AdminUserQuery, UpdateUserRequest } from '../types';

export const adminUserKeys = {
  all: ['admin', 'users'] as const,
  list: (query: AdminUserQuery) => ['admin', 'users', 'list', query] as const,
  detail: (id: string) => ['admin', 'users', id] as const,
};

export function useAdminUsers(query: AdminUserQuery) {
  return useQuery({
    queryKey: adminUserKeys.list(query),
    queryFn: () => adminUsersApi.getUsers(query),
  });
}

export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: adminUserKeys.detail(userId),
    queryFn: () => adminUsersApi.getUser(userId),
    enabled: !!userId,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserRequest }) =>
      adminUsersApi.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      adminUsersApi.suspendUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminUsersApi.activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
}
