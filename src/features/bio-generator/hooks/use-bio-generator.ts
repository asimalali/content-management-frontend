import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bioGeneratorApi } from '../api/bio-generator-api';
import { creditKeys } from '@/features/credits';
import type { GenerateBioRequest } from '../types';

export function useGenerateBio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateBioRequest) => bioGeneratorApi.generate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditKeys.balance });
    },
  });
}
