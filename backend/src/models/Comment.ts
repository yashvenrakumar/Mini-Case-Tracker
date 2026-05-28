import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IComment extends Document {
  caseId: Types.ObjectId;
  author: Types.ObjectId;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
  },
  { timestamps: true }
);

commentSchema.index({ caseId: 1, createdAt: -1 });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
