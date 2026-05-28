import { useCallback } from 'react';
import { apiClient } from '@/utils/apiClient';
import type { ApiResponse } from '@/types';
import type {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ResetPasswordPayload,
} from '@/interfaces/auth.interface';
import type { AuthUser } from '@/types';

export const useAuthApi = () => {
  const login = useCallback(async (credentials: LoginCredentials) => {
    console.log("credential loign------>", credentials);
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      credentials
    );
    return data.data!;
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    console.log("credentials for tegister=====", credentials);
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/register',
      credentials
    );
    return data.data!;
  }, []);

  const forgotPassword = useCallback(async (payload: ForgotPasswordPayload) => {
    const { data } = await apiClient.post<ApiResponse<ForgotPasswordResponse>>(
      '/auth/forgot-password',
      payload
    );
    console.log("  forgot password-------: ", data);
    return data.data ?? { message: data.message };
  }, []);

  const resetPassword = useCallback(async (payload: ResetPasswordPayload) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/reset-password',
      payload
    );
    return data.data ?? { message: data.message };
  }, []);

  const getMe = useCallback(async () => {
    const { data } = await apiClient.get<ApiResponse<AuthUser>>('/auth/me');
    console.log("user detials ------>", data);
    return data.data!;
  }, []);

  return { login, register, forgotPassword, resetPassword, getMe };
};
