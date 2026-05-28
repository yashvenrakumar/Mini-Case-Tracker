import { Response } from 'express';
import { UserService } from '../services/user.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const listAgents = asyncHandler(async (_req, res: Response) => {
  const agents = await UserService.listAgents();
  ApiResponse.success(res, 'Agents retrieved', agents);
});
