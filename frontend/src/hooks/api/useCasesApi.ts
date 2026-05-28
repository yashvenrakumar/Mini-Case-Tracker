import { useCallback } from 'react';
import { apiClient } from '@/utils/apiClient';
import type {
  ApiResponse,
  CaseRecord,
  CaseDetailResponse,
  CasesListParams,
  DashboardStats,
} from '@/types';
import type {
  CreateCasePayload,
  AssignCasePayload,
  UpdateStatusPayload,
  UpdateCasePayload,
} from '@/interfaces/case.interface';

export const useCasesApi = () => {
  const listCases = useCallback(async (params: CasesListParams) => {
    const { data } = await apiClient.get<ApiResponse<CaseRecord[]>>('/cases', {
      params,
    });
    return { cases: data.data ?? [], meta: data.meta };
  }, []);

  const getCase = useCallback(async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<CaseDetailResponse>>(
      `/cases/${id}`
    );
    return data.data!;
  }, []);

  const createCase = useCallback(async (payload: CreateCasePayload) => {
    const { data } = await apiClient.post<ApiResponse<CaseRecord>>(
      '/cases',
      payload
    );
    console.log("  create case--==", data);
    return data.data!;
  }, []);

  const assignCase = useCallback(
    async (id: string, payload: AssignCasePayload) => {
      const { data } = await apiClient.patch<ApiResponse<CaseRecord>>(
        `/cases/${id}/assign`,
        payload
      );
      return data.data!;
    },
    []
  );

  const updateStatus = useCallback(
    async (id: string, payload: UpdateStatusPayload) => {
      const { data } = await apiClient.patch<ApiResponse<CaseRecord>>(
        `/cases/${id}/status`,
        payload
      );
      return data.data!;
    },
    []
  );

  const updateCase = useCallback(async (id: string, payload: UpdateCasePayload) => {
    const { data } = await apiClient.patch<ApiResponse<CaseRecord>>(
      `/cases/${id}`,
      payload
    );
    return data.data!;
  }, []);

  const deleteCase = useCallback(async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse>(`/cases/${id}`);
    return data;
  }, []);

  const getDashboard = useCallback(async () => {
    const { data } =
      await apiClient.get<ApiResponse<DashboardStats>>('/cases/dashboard');
    return data.data!;
  }, []);

  return {
    listCases,
    getCase,
    createCase,
    assignCase,
    updateStatus,
    updateCase,
    deleteCase,
    getDashboard,
  };
};
