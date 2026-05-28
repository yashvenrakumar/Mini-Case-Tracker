import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(5000, 'Comment too long'),
});

export const caseIdParamSchema = z.object({
  caseId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid case id'),
});

export const commentIdParamSchema = z.object({
  caseId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid case id'),
  commentId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid comment id'),
});
