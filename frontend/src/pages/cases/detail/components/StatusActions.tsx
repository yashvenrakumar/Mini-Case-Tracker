import { useState } from 'react';
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { STATUS_LABELS, USER_ROLES, CASE_STATUSES } from '@/constants';
import { getNextStatuses } from '@/utils/statusHelpers';
import type { CaseRecord, CaseStatus, UserRole } from '@/types';

interface StatusActionsProps {
  caseRecord: CaseRecord;
  userRole: UserRole;
  onUpdateStatus: (status: CaseStatus) => Promise<void>;
  onAssign?: (agentId: string) => Promise<void>;
  agents?: { _id: string; name: string }[];
}

export const StatusActions = ({
  caseRecord,
  userRole,
  onUpdateStatus,
  onAssign,
  agents = [],
}: StatusActionsProps) => {
  const theme = useTheme();
  const fullScreenDialog = useMediaQuery(theme.breakpoints.down('sm'));
  const [status, setStatus] = useState<CaseStatus | ''>('');
  const [agentId, setAgentId] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const nextStatuses = getNextStatuses(caseRecord.status, userRole);
  const canAssign =
    userRole === USER_ROLES.MANAGER &&
    (caseRecord.status === CASE_STATUSES.NEW ||
      caseRecord.status === CASE_STATUSES.ASSIGNED);

  console.log("caseRecord------", caseRecord);
  console.log("userRole===", userRole);
  console.log("nextStatuses=", nextStatuses);
  console.log("canAssign-----", canAssign);
  const handleStatus = async () => {
    if (!status) return;
    setLoading(true);
    try {
      await onUpdateStatus(status);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!agentId || !onAssign) return;
    setLoading(true);
    try {
      await onAssign(agentId);
      setAssignOpen(false);
      setAgentId('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2} useFlexGap sx={{ width: '100%' }}>
      {canAssign && onAssign && (
        <Button
          variant="outlined"
          onClick={() => setAssignOpen(true)}
          sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
        >
          {caseRecord.assignedTo ? 'Reassign Agent' : 'Assign Agent'}
        </Button>
      )}
      {nextStatuses.length > 0 && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{
            alignItems: { xs: 'stretch', sm: 'center' },
            flexWrap: 'wrap',
          }}
          useFlexGap
        >
          <FormControl
            size="small"
            sx={{
              minWidth: { sm: 180 },
              width: { xs: '100%', sm: 'auto' },
              flex: { sm: '1 1 180px' },
            }}
          >
            <InputLabel id="update-status-label">Update Status</InputLabel>
            <Select
              labelId="update-status-label"
              label="Update Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as CaseStatus)}
            >
              {nextStatuses.map((s) => (
                <MenuItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleStatus}
            disabled={!status || loading}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Apply
          </Button>
        </Stack>
      )}

      <Dialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        fullScreen={fullScreenDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Assign to Agent</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" sx={{ mt: 1 }}>
            <InputLabel id="assign-agent-label">Agent</InputLabel>
            <Select
              labelId="assign-agent-label"
              label="Agent"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
            >
              {agents.map((a) => (
                <MenuItem key={a._id} value={a._id}>
                  {a.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
          <Button onClick={() => setAssignOpen(false)} fullWidth={fullScreenDialog}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={!agentId || loading}
            fullWidth={fullScreenDialog}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
