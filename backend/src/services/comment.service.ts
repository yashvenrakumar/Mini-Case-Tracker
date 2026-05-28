import { Comment } from '../models/Comment';
import { CaseService } from './case.service';
import { AuditService } from './audit.service';
import { ApiError } from '../utils/ApiError';
import { UserRole } from '../utils/constants';

const TERMINAL_STATUSES = ['cleared', 'discrepant'];

export class CommentService {
  private static assertCaseOpen(status: string) {
    if (TERMINAL_STATUSES.includes(status)) {
      throw ApiError.badRequest('Cannot modify comments on a closed case');
    }
  }

  private static async getOwnComment(
    caseId: string,
    commentId: string,
    userId: string
  ) {
    const comment = await Comment.findOne({ _id: commentId, caseId });
    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }
    if (comment.author.toString() !== userId) {
      throw ApiError.forbidden('You can only modify your own comments');
    }
    return comment;
  }
  static async list(caseId: string, userId: string, role: UserRole) {
    await CaseService.getByIdForUser(caseId, userId, role);
    return Comment.find({ caseId })
      .populate('author', 'name email role')
      .sort({ createdAt: -1 })
      .lean();
  }

  static async create(
    caseId: string,
    authorId: string,
    role: UserRole,
    body: string
  ) {
    const caseDoc = await CaseService.getByIdForUser(caseId, authorId, role);
    this.assertCaseOpen(caseDoc.status);

    const comment = await Comment.create({
      caseId,
      author: authorId,
      body,
    });

    await comment.populate('author', 'name email role');
    return comment;
  }

  static async update(
    caseId: string,
    commentId: string,
    userId: string,
    role: UserRole,
    body: string
  ) {
    const caseDoc = await CaseService.getByIdForUser(caseId, userId, role);
    this.assertCaseOpen(caseDoc.status);

    const comment = await this.getOwnComment(caseId, commentId, userId);
    comment.body = body;
    await comment.save();
    await comment.populate('author', 'name email role');

    await AuditService.logAction({
      caseId,
      performedBy: userId,
      action: 'comment_updated',
      metadata: { commentId },
    });

    return comment;
  }

  static async remove(
    caseId: string,
    commentId: string,
    userId: string,
    role: UserRole
  ) {
    const caseDoc = await CaseService.getByIdForUser(caseId, userId, role);
    this.assertCaseOpen(caseDoc.status);

    await this.getOwnComment(caseId, commentId, userId);
    await Comment.deleteOne({ _id: commentId });

    await AuditService.logAction({
      caseId,
      performedBy: userId,
      action: 'comment_deleted',
      metadata: { commentId },
    });
  }
}
