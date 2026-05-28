import { CASE_STATUSES, USER_ROLES } from "@/constants";
import type { CaseStatus, UserRole } from "@/types";

export const getNextStatuses = (
  current: CaseStatus,
  role: UserRole,
): CaseStatus[] => {
  const map: Record<CaseStatus, { next: CaseStatus[]; roles: UserRole[] }> = {
    [CASE_STATUSES.NEW]: {
      next: [CASE_STATUSES.ASSIGNED],
      roles: [USER_ROLES.MANAGER],
    },
    [CASE_STATUSES.ASSIGNED]: {
      next: [CASE_STATUSES.IN_PROGRESS],
      roles: [USER_ROLES.AGENT],
    },
    [CASE_STATUSES.IN_PROGRESS]: {
      next: [CASE_STATUSES.SUBMITTED],
      roles: [USER_ROLES.AGENT],
    },
    [CASE_STATUSES.SUBMITTED]: {
      next: [CASE_STATUSES.CLEARED, CASE_STATUSES.DISCREPANT],
      roles: [USER_ROLES.MANAGER],
    },
    [CASE_STATUSES.CLEARED]: { next: [], roles: [] },
    [CASE_STATUSES.DISCREPANT]: { next: [], roles: [] },
  };

  const rule = map[current];
  console.log(" rule----", rule);
  console.log(" role---- in getNextStatuses ", role);
  if (!rule.roles.includes(role)) return [];
  return rule.next;
};

export const isCaseClosed = (status: CaseStatus) =>
  status === CASE_STATUSES.CLEARED || status === CASE_STATUSES.DISCREPANT;
