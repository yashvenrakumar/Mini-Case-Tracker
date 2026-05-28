import mongoose, { Document, Schema, Types } from 'mongoose';
import { CaseStatus } from '../utils/constants';

export interface ICase extends Document {
  clientName: string;
  subjectName: string;
  caseType: string;
  dueDate: Date;
  status: CaseStatus;
  assignedTo?: Types.ObjectId;
  createdBy: Types.ObjectId;
  submittedAt?: Date;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const caseSchema = new Schema<ICase>(
  {
    clientName: { type: String, required: true, trim: true },
    subjectName: { type: String, required: true, trim: true },
    caseType: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(CaseStatus),
      default: CaseStatus.NEW,
      required: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

caseSchema.index({ status: 1, assignedTo: 1 });
caseSchema.index({ clientName: 'text', subjectName: 'text', caseType: 'text' });

export const Case = mongoose.model<ICase>('Case', caseSchema);
