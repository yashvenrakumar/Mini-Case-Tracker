import { Box, Typography, Paper, Chip } from '@mui/material';
import { STATUS_LABELS } from '@/constants';
import { formatDateTime } from '@/utils/format';
import type { AuditLogEntry } from '@/types';

interface StatusTimelineProps {
  entries: AuditLogEntry[];
}

export const StatusTimeline = ({ entries }: StatusTimelineProps) => {
  if (entries.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        No activity yet
      </Typography>
    );
  }

  return (
    <Box className="flex flex-col gap-0">
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Status Timeline
      </Typography>
      {entries.map((entry, index) => (
        <Box key={entry._id} className="flex gap-3">
          <Box className="flex flex-col items-center">
            <Box className="h-3 w-3 shrink-0 rounded-none" sx={{ bgcolor: 'primary.main' }} />
            {index < entries.length - 1 && (
              <Box
                className="flex-1 min-h-[40px]"
                sx={{ bgcolor: 'divider', width: 2 }}
              />
            )}
          </Box>
          <Paper className="mb-4 flex-1 p-3" variant="outlined">
            <Box className="mb-1 flex flex-wrap items-center gap-2">
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {entry.action === 'status_change'
                  ? `${STATUS_LABELS[entry.fromStatus!] ?? entry.fromStatus} → ${STATUS_LABELS[entry.toStatus!] ?? entry.toStatus}`
                  : entry.action.replace(/_/g, ' ')}
              </Typography>
              <Chip label={formatDateTime(entry.createdAt)} size="small" variant="outlined" />
            </Box>
            <Typography variant="caption" color="text.secondary">
              by {entry.performedBy?.name ?? 'System'}
            </Typography>
          </Paper>
        </Box>
      ))}
    </Box>
  );
};
