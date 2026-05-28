export enum UserRole {
  MANAGER = 'manager',
  AGENT = 'agent',
}

export enum CaseStatus {
  NEW = 'new',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  CLEARED = 'cleared',
  DISCREPANT = 'discrepant',
}

export const CASE_STATUS_ORDER: CaseStatus[] = [
  CaseStatus.NEW,
  CaseStatus.ASSIGNED,
  CaseStatus.IN_PROGRESS,
  CaseStatus.SUBMITTED,
  CaseStatus.CLEARED,
  CaseStatus.DISCREPANT,
];
