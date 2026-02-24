import { api } from '@/lib/api';
import type { GenerateBioRequest, BioGenerationResponse } from '../types';

export const bioGeneratorApi = {
  generate: async (data: GenerateBioRequest): Promise<BioGenerationResponse> => {
    const response = await api.post<BioGenerationResponse>('/content/generate-bio', data);
    return response.data;
  },
};
