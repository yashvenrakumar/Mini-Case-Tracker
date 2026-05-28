import { useCallback } from 'react';
import { apiClient } from '@/utils/apiClient';
import type { ApiResponse, AgentOption } from '@/types';

export const useUsersApi = () => {
  const listAgents = useCallback(async () => {
    const { data } =
      await apiClient.get<ApiResponse<AgentOption[]>>('/users/agents');
    return data.data ?? [];
  }, []);

  return { listAgents };
};
