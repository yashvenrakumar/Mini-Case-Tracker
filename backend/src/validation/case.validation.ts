import { z } from 'zod';
import { CaseStatus } from '../utils/constants';

export const createCaseSchema = z.object({
  clientName: z.string().min(1, 'Client name is required').max(200),
  subjectName: z.string().min(1, 'Subject name is required').max(200),
  caseType: z.string().min(1, 'Case type is required').max(100),
  dueDate: z.coerce.date({ invalid_type_error: 'Invalid due date' }),
  assignedTo: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid agent id').optional(),
});

export const updateCaseSchema = z
  .object({
    clientName: z.string().min(1).max(200).optional(),
    subjectName: z.string().min(1).max(200).optional(),
    caseType: z.string().min(1).max(100).optional(),
    dueDate: z.coerce.date().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const assignCaseSchema = z.object({
  assignedTo: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid agent id'),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(CaseStatus),
});

export const listCasesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.nativeEnum(CaseStatus).optional(),
  assignedTo: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
});

export const caseIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid case id'),
});
