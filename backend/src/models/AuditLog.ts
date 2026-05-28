import mongoose, { Document, Schema, Types } from 'mongoose';
import { CaseStatus } from '../utils/constants';

export interface IAuditLog extends Document {
  caseId: Types.ObjectId;
  performedBy: Types.ObjectId;
  action: string;
  fromStatus?: CaseStatus;
  toStatus?: CaseStatus;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    fromStatus: { type: String, enum: Object.values(CaseStatus) },
    toStatus: { type: String, enum: Object.values(CaseStatus) },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

auditLogSchema.index({ caseId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
