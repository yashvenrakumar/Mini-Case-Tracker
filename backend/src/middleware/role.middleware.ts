import { Response, NextFunction } from 'express';
import { UserRole } from '../utils/constants';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from './auth.middleware';

export const authorize =
  (...roles: UserRole[]) =>
  (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    next();
  };
