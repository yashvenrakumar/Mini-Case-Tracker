export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://mini-case-tracker.onrender.com/api/v1';

export const UPLOAD_BASE_URL =
  import.meta.env.VITE_UPLOAD_BASE_URL ?? 'https://mini-case-tracker.onrender.com';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  CASES: '/cases',
  CASE_CREATE: '/cases/new',
  CASE_DETAIL: (id: string) => `/cases/${id}`,
} as const;

export const USER_ROLES = {
  MANAGER: 'manager',
  AGENT: 'agent',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  manager: 'Manager',
  agent: 'Agent',
};

export const CASE_STATUSES = {
  NEW: 'new',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  CLEARED: 'cleared',
  DISCREPANT: 'discrepant',
} as const;

export const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  submitted: 'Submitted',
  cleared: 'Cleared',
  discrepant: 'Discrepant',
};

export const STATUS_COLORS: Record<
  string,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  new: 'default',
  assigned: 'info',
  in_progress: 'primary',
  submitted: 'warning',
  cleared: 'success',
  discrepant: 'error',
};
