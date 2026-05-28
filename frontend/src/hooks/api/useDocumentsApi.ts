import { useCallback } from 'react';
import { apiClient } from '@/utils/apiClient';
import type { ApiResponse, CaseDocument } from '@/types';

export const useDocumentsApi = () => {
  const listDocuments = useCallback(async (caseId: string) => {
    const { data } = await apiClient.get<ApiResponse<CaseDocument[]>>(
      `/cases/${caseId}/documents`
    );
    return data.data ?? [];
  }, []);

  const uploadDocument = useCallback(async (caseId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<ApiResponse<CaseDocument>>(
      `/cases/${caseId}/documents`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data.data!;
  }, []);

  const deleteDocument = useCallback(async (caseId: string, docId: string) => {
    await apiClient.delete(`/cases/${caseId}/documents/${docId}`);
  }, []);

  return { listDocuments, uploadDocument, deleteDocument };
};
