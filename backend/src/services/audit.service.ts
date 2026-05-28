import { Types } from 'mongoose';
import { AuditLog } from '../models/AuditLog';
import { CaseStatus } from '../utils/constants';

interface LogStatusChangeParams {
  caseId: Types.ObjectId | string;
  performedBy: Types.ObjectId | string;
  fromStatus: CaseStatus;
  toStatus: CaseStatus;
  metadata?: Record<string, unknown>;
}

interface LogActionParams {
  caseId: Types.ObjectId | string;
  performedBy: Types.ObjectId | string;
  action: string;
  metadata?: Record<string, unknown>;
}

export class AuditService {
  static async logStatusChange(params: LogStatusChangeParams) {
    return AuditLog.create({
      caseId: params.caseId,
      performedBy: params.performedBy,
      action: 'status_change',
      fromStatus: params.fromStatus,
      toStatus: params.toStatus,
      metadata: params.metadata,
    });
   }

  static async logAction(params: LogActionParams) {
    return AuditLog.create({
      caseId: params.caseId,
      performedBy: params.performedBy,
      action: params.action,
      metadata: params.metadata,
    });
  }

  static async getByCaseId(caseId: string) {
    return AuditLog.find({ caseId })
      .populate('performedBy', 'name email role')
      .sort({ createdAt: 1 })
      .lean();
  }
}
