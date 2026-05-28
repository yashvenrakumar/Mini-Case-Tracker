export type UserRole = 'manager' | 'agent';

export type CaseStatus =
  | 'new'
  | 'assigned'
  | 'in_progress'
  | 'submitted'
  | 'cleared'
  | 'discrepant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: { field: string; message: string }[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CaseRecord {
  _id: string;
  clientName: string;
  subjectName: string;
  caseType: string;
  dueDate: string;
  status: CaseStatus;
  assignedTo?: { _id: string; name: string; email: string };
  createdBy?: { _id: string; name: string; email: string };
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  _id: string;
  caseId: string;
  performedBy: { _id: string; name: string; email: string; role: UserRole };
  action: string;
  fromStatus?: CaseStatus;
  toStatus?: CaseStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Comment {
  _id: string;
  caseId: string;
  author: { _id: string; name: string; email: string; role: UserRole };
  body: string;
  createdAt: string;
}

export interface CaseDocument {
  _id: string;
  caseId: string;
  uploadedBy: { _id: string; name: string; email: string };
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface CaseDetailResponse {
  case: CaseRecord;
  timeline: AuditLogEntry[];
  counts: { comments: number; documents: number };
}

export interface DashboardStats {
  total: number;
  byStatus: { status: CaseStatus; count: number }[];
}

export interface AgentOption {
  _id: string;
  name: string;
  email: string;
}

export interface CasesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CaseStatus;
  assignedTo?: string;
}
