import { useCallback } from 'react';
import { apiClient } from '@/utils/apiClient';
import type { ApiResponse, Comment } from '@/types';

export const useCommentsApi = () => {
  const listComments = useCallback(async (caseId: string) => {
    const { data } = await apiClient.get<ApiResponse<Comment[]>>(
      `/cases/${caseId}/comments`
    );
    return data.data ?? [];
  }, []);

  const addComment = useCallback(async (caseId: string, body: string) => {
    const { data } = await apiClient.post<ApiResponse<Comment>>(
      `/cases/${caseId}/comments`,
      { body }
    );
    return data.data!;
  }, []);

  const updateComment = useCallback(
    async (caseId: string, commentId: string, body: string) => {
      const { data } = await apiClient.patch<ApiResponse<Comment>>(
        `/cases/${caseId}/comments/${commentId}`,
        { body }
      );
      return data.data!;
    },
    []
  );

  const deleteComment = useCallback(async (caseId: string, commentId: string) => {
    await apiClient.delete(`/cases/${caseId}/comments/${commentId}`);
  }, []);

  return { listComments, addComment, updateComment, deleteComment };
};
