import { Response } from 'express';

export interface ApiResponseBody<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
  errors?: unknown[];
}

export class ApiResponse {
  static success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode = 200,
    meta?: Record<string, unknown>
  ): Response {
    const body: ApiResponseBody<T> = {
      success: true,
      message,
      ...(data !== undefined && { data }),
      ...(meta && { meta }),
    };
    return res.status(statusCode).json(body);
  }

  static created<T>(
    res: Response,
    message: string,
    data?: T,
    meta?: Record<string, unknown>
  ): Response {
    return ApiResponse.success(res, message, data, 201, meta);
  }

  static paginated<T>(
    res: Response,
    message: string,
    data: T[],
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  ): Response {
    return res.status(200).json({
      success: true,
      message,
      data,
      meta,
    } satisfies ApiResponseBody<T[]>);
  }
}
