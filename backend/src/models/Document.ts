import mongoose, { Document as MongooseDoc, Schema, Types } from 'mongoose';

export interface IDocumentFile extends MongooseDoc {
  caseId: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocumentFile>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
  },
  { timestamps: true }
);

documentSchema.index({ caseId: 1 });

export const DocumentFile = mongoose.model<IDocumentFile>(
  'Document',
  documentSchema
);
