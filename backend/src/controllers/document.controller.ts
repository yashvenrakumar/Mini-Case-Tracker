import { Response } from 'express';
import { DocumentService } from '../services/document.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiError } from '../utils/ApiError';

export const listDocuments = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const documents = await DocumentService.list(
      req.params.caseId as string,
      req.user!.userId,
      req.user!.role
    );
    ApiResponse.success(res, 'Documents retrieved', documents);
  }
);

export const uploadDocument = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      throw ApiError.badRequest('No file uploaded');
    }
    const doc = await DocumentService.upload(
      req.params.caseId as string,
      req.user!.userId,
      req.user!.role,
      req.file
    );
    ApiResponse.created(res, 'Document uploaded', doc);
  }
);

export const deleteDocument = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await DocumentService.remove(
      req.params.caseId as string,
      req.params.docId as string,
      req.user!.userId,
      req.user!.role
    );
    ApiResponse.success(res, 'Document deleted');
  }
);
