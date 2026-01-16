import { api } from '@/lib/api';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  BrandDna,
  UpdateBrandDnaRequest,
} from '../types';

export const projectsApi = {
  // Get all projects for current user
  getAll: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  // Get project by ID
  getById: async (projectId: string): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${projectId}`);
    return response.data;
  },

  // Create new project
  create: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  // Update project
  update: async (projectId: string, data: UpdateProjectRequest): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${projectId}`, data);
    return response.data;
  },

  // Delete project
  delete: async (projectId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}`);
  },

  // Get brand DNA for project
  getBrandDna: async (projectId: string): Promise<BrandDna> => {
    const response = await api.get<BrandDna>(`/projects/${projectId}/dna`);
    return response.data;
  },

  // Generate brand DNA using AI
  generateBrandDna: async (projectId: string): Promise<BrandDna> => {
    const response = await api.post<BrandDna>(`/projects/${projectId}/generate-dna`);
    return response.data;
  },

  // Update brand DNA
  updateBrandDna: async (projectId: string, data: UpdateBrandDnaRequest): Promise<BrandDna> => {
    const response = await api.put<BrandDna>(`/projects/${projectId}/dna`, data);
    return response.data;
  },
};
