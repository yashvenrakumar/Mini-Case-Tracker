import { Router } from 'express';
import * as commentController from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createCommentSchema,
  caseIdParamSchema,
  commentIdParamSchema,
} from '../validation/comment.validation';

const router = Router({ mergeParams: true });

router.use(authenticate);

/**
 * @openapi
 * /api/v1/cases/{caseId}/comments:
 *   get:
 *     tags: [Comments]
 *     summary: List comments for a case
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  validate(caseIdParamSchema, 'params'),
  commentController.listComments
);

/**
 * @openapi
 * /api/v1/cases/{caseId}/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Add a note/comment to a case
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               body: { type: string, example: Client provided updated ID proof. }
 */
router.post(
  '/',
  validate(caseIdParamSchema, 'params'),
  validate(createCommentSchema),
  commentController.createComment
);

/**
 * @openapi
 * /api/v1/cases/{caseId}/comments/{commentId}:
 *   patch:
 *     tags: [Comments]
 *     summary: Update your comment on a case
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               body: { type: string }
 */
router.patch(
  '/:commentId',
  validate(commentIdParamSchema, 'params'),
  validate(createCommentSchema),
  commentController.updateComment
);

/**
 * @openapi
 * /api/v1/cases/{caseId}/comments/{commentId}:
 *   delete:
 *     tags: [Comments]
 *     summary: Delete your comment on a case
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:commentId',
  validate(commentIdParamSchema, 'params'),
  commentController.deleteComment
);

export default router;
