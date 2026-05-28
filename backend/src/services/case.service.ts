import { FilterQuery, Types } from 'mongoose';
import fs from 'fs';
import { Case, ICase } from '../models/Case';
import { Comment } from '../models/Comment';
import { DocumentFile } from '../models/Document';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import {
  CaseStatus,
  UserRole,
} from '../utils/constants';
import {
  assertValidStatusTransition,
  initialStatusForCreate,
} from '../utils/statusTransitions';
import { AuditService } from './audit.service';

interface ListCasesParams {
  page: number;
  limit: number;
  search?: string;
  status?: CaseStatus;
  assignedTo?: string;
  userId: string;
  role: UserRole;
}

interface CreateCaseInput {
  clientName: string;
  subjectName: string;
  caseType: string;
  dueDate: Date;
  assignedTo?: string;
  createdBy: string;
}

export class CaseService {
  static async list(params: ListCasesParams) {
    const { page, limit, search, status, assignedTo, userId, role } = params;
    const filter: FilterQuery<ICase> = {};

    if (role === UserRole.AGENT) {
      filter.assignedTo = new Types.ObjectId(userId);
    } else if (assignedTo) {
      filter.assignedTo = new Types.ObjectId(assignedTo);
    }

    if (status) filter.status = status;

    console.log("filter-->", filter);
    if (search?.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { clientName: regex },
        { subjectName: regex },
        { caseType: regex },
      ];
    }


    const skip = (page - 1) * limit;

    const [cases, total] = await Promise.all([
      Case.find(filter)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Case.countDocuments(filter),
    ]);

    console.log("cases-->", cases);
    return {
      cases,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async create(input: CreateCaseInput) {
    if (input.assignedTo) {
      const agent = await User.findOne({
        _id: input.assignedTo,
        role: UserRole.AGENT,
        isActive: true,
      });
      if (!agent) {
        throw ApiError.badRequest('Assigned user must be an active agent');
      }
    }

    const status = initialStatusForCreate(input.assignedTo);

    const caseDoc = await Case.create({
      ...input,
      status,
      createdBy: input.createdBy,
      ...(input.assignedTo && { assignedTo: input.assignedTo }),
    });

    await AuditService.logAction({
      caseId: caseDoc._id,
      performedBy: input.createdBy,
      action: 'case_created',
      metadata: { status },
    });

    if (status === CaseStatus.ASSIGNED) {
      await AuditService.logStatusChange({
        caseId: caseDoc._id,
        performedBy: input.createdBy,
        fromStatus: CaseStatus.NEW,
        toStatus: CaseStatus.ASSIGNED,
        metadata: { assignedTo: input.assignedTo },
      });
    }

    console.log("caseDoc-->", caseDoc);
    await caseDoc.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
    ]);

    return caseDoc;
  }

  static async getByIdForUser(
    caseId: string,
    userId: string,
    role: UserRole
  ): Promise<ICase> {
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) throw ApiError.notFound('Case not found');

    if (
      role === UserRole.AGENT &&
      caseDoc.assignedTo?.toString() !== userId
    ) {
      throw ApiError.forbidden('You do not have access to this case');
    }
    console.log("caseDoc----", caseDoc);

    return caseDoc;
  }

  static async getDetail(caseId: string, userId: string, role: UserRole) {
    await this.getByIdForUser(caseId, userId, role);

    const [caseDoc, auditLog, commentCount, documentCount] = await Promise.all([
      Case.findById(caseId)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .lean(),
      AuditService.getByCaseId(caseId),
      import('../models/Comment').then((m) =>
        m.Comment.countDocuments({ caseId })
      ),
      import('../models/Document').then((m) =>
        m.DocumentFile.countDocuments({ caseId })
      ),
    ]);

    console.log("auditLog-->", auditLog);
    console.log("commentCount-->", commentCount);
    console.log("documentCount-->", documentCount);
    return {
      case: caseDoc,
      timeline: auditLog,
      counts: { comments: commentCount, documents: documentCount },
    };
  }

  static async assign(
    caseId: string,
    managerId: string,
    assignedTo: string
  ) {
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) throw ApiError.notFound('Case not found');

    if (
      caseDoc.status !== CaseStatus.NEW &&
      caseDoc.status !== CaseStatus.ASSIGNED
    ) {
      throw ApiError.badRequest(
        'Can only assign cases in New or Assigned status'
      );
    }

    const agent = await User.findOne({
      _id: assignedTo,
      role: UserRole.AGENT,
      isActive: true,
    });
    if (!agent) {
      throw ApiError.badRequest('Assigned user must be an active agent');
    }

    const fromStatus = caseDoc.status;
    caseDoc.assignedTo = new Types.ObjectId(assignedTo);
    caseDoc.status = CaseStatus.ASSIGNED;
    await caseDoc.save();

    if (fromStatus !== CaseStatus.ASSIGNED) {
      await AuditService.logStatusChange({
        caseId,
        performedBy: managerId,
        fromStatus,
        toStatus: CaseStatus.ASSIGNED,
        metadata: { assignedTo },
      });
    } else {
      await AuditService.logAction({
        caseId,
        performedBy: managerId,
        action: 'case_reassigned',
        metadata: { assignedTo },
      });
    }
 
    console.log("caseDoc-->", caseDoc);
    await caseDoc.populate('assignedTo', 'name email');
 
    return caseDoc;
  }

  static async updateStatus(
    caseId: string,
    userId: string,
    role: UserRole,
    nextStatus: CaseStatus
  ) {
    const caseDoc = await this.getByIdForUser(caseId, userId, role);
    const fromStatus = caseDoc.status;

    assertValidStatusTransition(fromStatus, nextStatus, role);

    if (role === UserRole.AGENT) {
      if (caseDoc.assignedTo?.toString() !== userId) {
        throw ApiError.forbidden('You can only update cases assigned to you');
      }
    }

    if (nextStatus === CaseStatus.SUBMITTED) {
      const docCount = await import('../models/Document').then((m) =>
        m.DocumentFile.countDocuments({ caseId })
      );
      if (docCount === 0) {
        throw ApiError.badRequest(
          'Upload at least one document before submitting'
        );
      }
      caseDoc.submittedAt = new Date();
    }

    if (
      nextStatus === CaseStatus.CLEARED ||
      nextStatus === CaseStatus.DISCREPANT
    ) {
      caseDoc.reviewedAt = new Date();
    }

    caseDoc.status = nextStatus;
    await caseDoc.save();

    await AuditService.logStatusChange({
      caseId,
      performedBy: userId,
      fromStatus,
      toStatus: nextStatus,
    });

    await caseDoc.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
    ]);

    return caseDoc;
  }

  static async getDashboardStats(role: UserRole, userId: string) {
    const filter: FilterQuery<ICase> =
      role === UserRole.AGENT
        ? { assignedTo: new Types.ObjectId(userId) }
        : {};
    console.log('filter-->', filter);

    const statuses = Object.values(CaseStatus);
    console.log('statuses-->', statuses);
    const counts = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await Case.countDocuments({ ...filter, status }),
      }))
    );
    console.log('counts-->', counts);

    const total = counts.reduce((sum, c) => sum + c.count, 0);
    console.log('total-->', total); 
    return { total, byStatus: counts };
  }

  static async update(
    caseId: string,
    managerId: string,
    input: {
      clientName?: string;
      subjectName?: string;
      caseType?: string;
      dueDate?: Date;
    }
  ) {
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) throw ApiError.notFound('Case not found');

    const changed: Record<string, unknown> = {};

    if (input.clientName !== undefined && input.clientName !== caseDoc.clientName) {
      changed.clientName = { from: caseDoc.clientName, to: input.clientName };
      caseDoc.clientName = input.clientName;
    }
    if (
      input.subjectName !== undefined &&
      input.subjectName !== caseDoc.subjectName
    ) {
      changed.subjectName = { from: caseDoc.subjectName, to: input.subjectName };
      caseDoc.subjectName = input.subjectName;
    }
    if (input.caseType !== undefined && input.caseType !== caseDoc.caseType) {
      changed.caseType = { from: caseDoc.caseType, to: input.caseType };
      caseDoc.caseType = input.caseType;
    }
    if (input.dueDate !== undefined) {
      const prev = caseDoc.dueDate?.toISOString();
      const next = input.dueDate.toISOString();
      if (prev !== next) {
        changed.dueDate = { from: prev, to: next };
        caseDoc.dueDate = input.dueDate;
      }
    }

    await caseDoc.save();

    await AuditService.logAction({
      caseId,
      performedBy: managerId,
      action: 'case_updated',
      metadata: { changed },
    });

    await caseDoc.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
    ]);

    return caseDoc;
  }

  static async remove(caseId: string, managerId: string) {
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) throw ApiError.notFound('Case not found');

    await AuditService.logAction({
      caseId,
      performedBy: managerId,
      action: 'case_deleted',
      metadata: {
        clientName: caseDoc.clientName,
        subjectName: caseDoc.subjectName,
        caseType: caseDoc.caseType,
        dueDate: caseDoc.dueDate?.toISOString(),
        status: caseDoc.status,
      },
    });

    const docs = await DocumentFile.find({ caseId }).lean();
    for (const doc of docs) {
      if (doc.path && fs.existsSync(doc.path)) {
        fs.unlinkSync(doc.path);
      }
    }

    await Promise.all([
      DocumentFile.deleteMany({ caseId }),
      Comment.deleteMany({ caseId }),
      Case.deleteOne({ _id: caseId }),
    ]);
  }
}
  