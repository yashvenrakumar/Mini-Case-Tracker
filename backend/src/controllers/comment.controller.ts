import { Response } from 'express';
import { CommentService } from '../services/comment.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth.middleware';

export const listComments = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const comments = await CommentService.list(
      req.params.caseId as string,
      req.user!.userId,
      req.user!.role
    );
    ApiResponse.success(res, 'Comments retrieved', comments);
  }
);

export const createComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const comment = await CommentService.create(
      req.params.caseId as string,
      req.user!.userId,
      req.user!.role,
      req.body.body
    );
    ApiResponse.created(res, 'Comment added', comment);
  }
);

export const updateComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const comment = await CommentService.update(
      req.params.caseId as string,
      req.params.commentId as string,
      req.user!.userId,
      req.user!.role,
      req.body.body
    );
    ApiResponse.success(res, 'Comment updated', comment);
  }
);

export const deleteComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await CommentService.remove(
      req.params.caseId as string,
      req.params.commentId as string,
      req.user!.userId,
      req.user!.role
    );
    ApiResponse.success(res, 'Comment deleted');
  }
);
