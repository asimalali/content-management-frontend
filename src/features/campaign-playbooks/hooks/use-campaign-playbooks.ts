import { useQuery } from '@tanstack/react-query';
import { campaignPlaybooksApi } from '../api/campaign-playbooks-api';

export const campaignPlaybookKeys = {
  all: ['campaign-playbooks'] as const,
  detail: (playbookId: string) => ['campaign-playbooks', playbookId] as const,
};

export function useCampaignPlaybooks(enabled = true) {
  return useQuery({
    queryKey: campaignPlaybookKeys.all,
    queryFn: () => campaignPlaybooksApi.getAll(),
    enabled,
  });
}

export function useCampaignPlaybook(playbookId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: campaignPlaybookKeys.detail(playbookId!),
    queryFn: () => campaignPlaybooksApi.getById(playbookId!),
    enabled: !!playbookId && enabled,
  });
}
