import { api } from '@/lib/api';
import type { CampaignPlaybook } from '../types';

export const campaignPlaybooksApi = {
  getAll: async (): Promise<CampaignPlaybook[]> => {
    const response = await api.get<CampaignPlaybook[]>('/campaign-playbooks');
    return response.data;
  },

  getById: async (playbookId: string): Promise<CampaignPlaybook> => {
    const response = await api.get<CampaignPlaybook>(`/campaign-playbooks/${playbookId}`);
    return response.data;
  },
};
