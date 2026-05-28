import { Chip } from '@mui/material';
import { STATUS_COLORS, STATUS_LABELS } from '@/constants';
import type { CaseStatus } from '@/types';

interface StatusChipProps {
  status: CaseStatus;
  size?: 'small' | 'medium';
}

export const StatusChip = ({ status, size = 'small' }: StatusChipProps) => (
  <Chip
    label={STATUS_LABELS[status] ?? status}
    color={STATUS_COLORS[status] ?? 'default'}
    size={size}
    variant="outlined"
  />
);
