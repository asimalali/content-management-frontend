import { api } from '@/lib/api';
import type { PagedResult, AdminUser, AdminUserQuery, UpdateUserRequest } from '../types';

export const adminUsersApi = {
  getUsers: async (query: AdminUserQuery): Promise<PagedResult<AdminUser>> => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    const response = await api.get<PagedResult<AdminUser>>(`/admin/users?${params.toString()}`);
    return response.data;
  },

  getUser: async (userId: string): Promise<AdminUser> => {
    const response = await api.get<AdminUser>(`/admin/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId: string, data: UpdateUserRequest): Promise<AdminUser> => {
    const response = await api.put<AdminUser>(`/admin/users/${userId}`, data);
    return response.data;
  },

  suspendUser: async (userId: string, reason: string): Promise<void> => {
    await api.post(`/admin/users/${userId}/suspend`, { reason });
  },

  activateUser: async (userId: string): Promise<void> => {
    await api.post(`/admin/users/${userId}/activate`);
  },
};
