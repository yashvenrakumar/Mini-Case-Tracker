import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const documentIdParamSchema = z.object({
  caseId: objectId,
  docId: objectId,
});
