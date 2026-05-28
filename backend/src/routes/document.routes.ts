import { Router } from 'express';
import * as documentController from '../controllers/document.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { caseIdParamSchema } from '../validation/comment.validation';
import { documentIdParamSchema } from '../validation/document.validation';
import { upload } from '../middleware/upload.middleware';

const router = Router({ mergeParams: true });

router.use(authenticate);

/**
 * @openapi
 * /api/v1/cases/{caseId}/documents:
 *   get:
 *     tags: [Documents]
 *     summary: List documents for a case
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  validate(caseIdParamSchema, 'params'),
  documentController.listDocuments
);

/**
 * @openapi
 * /api/v1/cases/{caseId}/documents:
 *   post:
 *     tags: [Documents]
 *     summary: Upload a supporting document (Agent only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 */


router.post(
  '/',
  validate(caseIdParamSchema, 'params'),
  upload.single('file'),
  documentController.uploadDocument
);

/**
 * @openapi
 * /api/v1/cases/{caseId}/documents/{docId}:
 *   delete:
 *     tags: [Documents]
 *     summary: Delete a supporting document (Agent only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: caseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: docId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted
 */
router.delete(
  '/:docId',
  validate(documentIdParamSchema, 'params'),
  documentController.deleteDocument
);

export default router;
