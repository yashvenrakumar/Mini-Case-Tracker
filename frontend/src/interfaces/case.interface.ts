import type { CaseStatus } from '@/types';

export interface CreateCasePayload {
  clientName: string;
  subjectName: string;
  caseType: string;
  dueDate: string;
  assignedTo?: string;
}

export interface AssignCasePayload {
  assignedTo: string;
}

export interface UpdateStatusPayload {
  status: CaseStatus;
}

export interface UpdateCasePayload {
  clientName?: string;
  subjectName?: string;
  caseType?: string;
  dueDate?: string;
}

export interface CasesFilterState {
  search: string;
  status: CaseStatus | '';
  assignedTo: string;
  page: number;
  limit: number;
}
