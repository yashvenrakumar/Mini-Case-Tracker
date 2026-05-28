import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth.middleware';

export const login = asyncHandler(async (req, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);
  ApiResponse.success(res, 'Login successful', result);
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await AuthService.getProfile(req.user!.userId);
  ApiResponse.success(res, 'Profile retrieved', profile);
});

export const register = asyncHandler(async (req, res: Response) => {
  const { name, email, password, role } = req.body;
  const result = await AuthService.register(name, email, password, role);
  ApiResponse.created(res, 'Registration successful', result);
});

export const forgotPassword = asyncHandler(async (req, res: Response) => {
  const result = await AuthService.forgotPassword(req.body.email);
  ApiResponse.success(res, result.message, result);
});

export const resetPassword = asyncHandler(async (req, res: Response) => {
  const { token, password } = req.body;
  const result = await AuthService.resetPassword(token, password);
  ApiResponse.success(res, result.message, result);
});
