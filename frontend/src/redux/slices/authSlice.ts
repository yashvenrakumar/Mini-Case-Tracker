import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
 import type { AuthState } from '@/interfaces/auth.interface';
import type { AuthUser } from '@/types';
import { setAuthToken } from '@/utils/apiClient';
import type { RootState } from '../rootReducer';

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      setAuthToken(action.payload.token);
    },
    logout: () => {
      setAuthToken(null);
      return initialState;
    },
  } 
});

export const { setCredentials, logout } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthToken = (state: RootState) => state.auth.token;

export default authSlice.reducer;
