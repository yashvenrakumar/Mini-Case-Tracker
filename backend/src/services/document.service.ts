import path from 'path';
import fs from 'fs';
import { DocumentFile } from '../models/Document';
import { CaseService } from './case.service';
import { AuditService } from './audit.service';
import { ApiError } from '../utils/ApiError';
import { UserRole } from '../utils/constants';

export class DocumentService {
  static async list(caseId: string, userId: string, role: UserRole) {
    await CaseService.getByIdForUser(caseId, userId, role);
    return DocumentFile.find({ caseId })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
  }

  static async upload(
    caseId: string,
    userId: string,
    role: UserRole,
    file: Express.Multer.File
  ) {
    const caseDoc = await CaseService.getByIdForUser(caseId, userId, role);

    if (role !== UserRole.AGENT) {
      throw ApiError.forbidden('Only agents can upload documents');
    }

    if (caseDoc.assignedTo?.toString() !== userId) {
      throw ApiError.forbidden('You can only upload to cases assigned to you');
    }

    const allowedStatuses = ['assigned', 'in_progress', 'submitted'];
    if (!allowedStatuses.includes(caseDoc.status)) {
      throw ApiError.badRequest(
        'Documents can only be uploaded while case is active'
      );
    }

    const doc = await DocumentFile.create({
      caseId,
      uploadedBy: userId,
      originalName: file.originalname,
      filename: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
    });

    await AuditService.logAction({
      caseId,
      performedBy: userId,
      action: 'document_uploaded',
      metadata: { filename: file.originalname },
    });

    await doc.populate('uploadedBy', 'name email');
    return doc;
  }

  static async remove(
    caseId: string,
    docId: string,
    userId: string,
    role: UserRole
  ) {
    const caseDoc = await CaseService.getByIdForUser(caseId, userId, role);

    if (role !== UserRole.AGENT) {
      throw ApiError.forbidden('Only agents can delete documents');
    }

    if (caseDoc.assignedTo?.toString() !== userId) {
      throw ApiError.forbidden(
        'You can only delete documents from cases assigned to you'
      );
    }

    const allowedStatuses = ['assigned', 'in_progress', 'submitted'];
    if (!allowedStatuses.includes(caseDoc.status)) {
      throw ApiError.badRequest(
        'Documents can only be deleted while case is active'
      );
    }

    const doc = await DocumentFile.findOne({ _id: docId, caseId });
    if (!doc) {
      throw ApiError.notFound('Document not found');
    }

    const { originalName } = doc;

    if (fs.existsSync(doc.path)) {
      fs.unlinkSync(doc.path);
    }

    await DocumentFile.deleteOne({ _id: docId });

    await AuditService.logAction({
      caseId,
      performedBy: userId,
      action: 'document_deleted',
      metadata: { filename: originalName },
    });
  }
}

export const getPublicFilePath = (filename: string) =>
  path.join('/uploads', filename);
