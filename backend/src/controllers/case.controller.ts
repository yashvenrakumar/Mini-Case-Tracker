import { Response } from 'express';
import { CaseService } from '../services/case.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth.middleware';
import { AuditService } from '../services/audit.service';

export const listCases = asyncHandler(async (req: AuthRequest, res: Response) => {
  const query = req.query as unknown as {
    page: number;
    limit: number;
    search?: string;
    status?: import('../utils/constants').CaseStatus;
    assignedTo?: string;
  };
  const { page, limit, search, status, assignedTo } = query;

  const result = await CaseService.list({
    page,
    limit,
    search,
    status,
    assignedTo,
    userId: req.user!.userId,
    role: req.user!.role,
  });

  ApiResponse.paginated(res, 'Cases retrieved', result.cases, result.meta);
});

export const createCase = asyncHandler(async (req: AuthRequest, res: Response) => {
  const caseDoc = await CaseService.create({
    ...req.body,
    createdBy: req.user!.userId,
  });
  ApiResponse.created(res, 'Case created successfully', caseDoc);
});

export const getCase = asyncHandler(async (req: AuthRequest, res: Response) => {
  const detail = await CaseService.getDetail(
    req.params.id as string,
    req.user!.userId,
    req.user!.role
  );
  ApiResponse.success(res, 'Case retrieved', detail);
});

export const assignCase = asyncHandler(async (req: AuthRequest, res: Response) => {
  const caseDoc = await CaseService.assign(
    req.params.id as string,
    req.user!.userId,
    req.body.assignedTo
  );
  ApiResponse.success(res, 'Case assigned successfully', caseDoc);
});

export const updateCaseStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const caseDoc = await CaseService.updateStatus(
      req.params.id as string,
      req.user!.userId,
      req.user!.role,
      req.body.status
    );
    ApiResponse.success(res, 'Case status updated', caseDoc);
  }
);

export const getCaseAudit = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await CaseService.getByIdForUser(
      req.params.id as string,
      req.user!.userId,
      req.user!.role
    );
    const logs = await AuditService.getByCaseId(req.params.id as string);
    ApiResponse.success(res, 'Audit log retrieved', logs);
  }
);

export const getDashboard = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const stats = await CaseService.getDashboardStats(
      req.user!.role,
      req.user!.userId
    );
    ApiResponse.success(res, 'Dashboard stats retrieved', stats);
  }
);

export const updateCase = asyncHandler(async (req: AuthRequest, res: Response) => {
  const caseDoc = await CaseService.update(
    req.params.id as string,
    req.user!.userId,
    req.body
  );
  ApiResponse.success(res, 'Case updated', caseDoc);
});

export const deleteCase = asyncHandler(async (req: AuthRequest, res: Response) => {
  await CaseService.remove(req.params.id as string, req.user!.userId);
  ApiResponse.success(res, 'Case deleted');
});
