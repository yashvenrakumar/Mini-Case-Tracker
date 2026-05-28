import { CaseStatus, UserRole } from './constants';
import { ApiError } from './ApiError';

const transitions: Record<
  CaseStatus,
  { next: CaseStatus[]; roles: UserRole[] }
> = {
  [CaseStatus.NEW]: {
    next: [CaseStatus.ASSIGNED],
    roles: [UserRole.MANAGER],
  },
  [CaseStatus.ASSIGNED]: {
    next: [CaseStatus.IN_PROGRESS],
    roles: [UserRole.AGENT],
  },
  [CaseStatus.IN_PROGRESS]: {
    next: [CaseStatus.SUBMITTED],
    roles: [UserRole.AGENT],
  },
  [CaseStatus.SUBMITTED]: {
    next: [CaseStatus.CLEARED, CaseStatus.DISCREPANT],
    roles: [UserRole.MANAGER],
  },
  [CaseStatus.CLEARED]: { next: [], roles: [] },
  [CaseStatus.DISCREPANT]: { next: [], roles: [] },
};

export function assertValidStatusTransition(
  current: CaseStatus,
  next: CaseStatus,
  role: UserRole
): void {
  const rule = transitions[current];

  if (!rule.next.includes(next)) {
    throw ApiError.badRequest(
      `Invalid status transition from "${current}" to "${next}"`
    );
  }

  if (!rule.roles.includes(role)) {
    throw ApiError.forbidden(
      `Role "${role}" cannot transition case from "${current}" to "${next}"`
    );
  }
}

export function initialStatusForCreate(assigneeId?: string): CaseStatus {
  return assigneeId ? CaseStatus.ASSIGNED : CaseStatus.NEW;
}
