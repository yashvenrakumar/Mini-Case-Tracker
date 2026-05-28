import { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useUsersApi } from '@/hooks/api';
import type { AgentOption } from '@/types';
import type { CreateCasePayload } from '@/interfaces/case.interface';

interface CreateCaseFormProps {
  onSubmit: (payload: CreateCasePayload) => Promise<void>;
  loading: boolean;
}

export const CreateCaseForm = ({ onSubmit, loading }: CreateCaseFormProps) => {
  const { listAgents } = useUsersApi();
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [form, setForm] = useState<CreateCasePayload>({
    clientName: '',
    subjectName: '',
    caseType: '',
    dueDate: '',
    assignedTo: '',
  });

  useEffect(() => {
    listAgents().then(setAgents).catch(() => {});
  }, [listAgents]);

  const handleChange = (field: keyof CreateCasePayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...form,
      assignedTo: form.assignedTo || undefined,
    });
  };

  console.log("form----", form);

  return (
    <Box component="form" onSubmit={handleSubmit} className="max-w-xl">
      <TextField
        fullWidth
        label="Client Name"
        value={form.clientName}
        onChange={(e) => handleChange('clientName', e.target.value)}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Subject Name"
        value={form.subjectName}
        onChange={(e) => handleChange('subjectName', e.target.value)}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Case Type"
        value={form.caseType}
        onChange={(e) => handleChange('caseType', e.target.value)}
        margin="normal"
        required
        placeholder="e.g. Background Verification"
      />
      <TextField
        fullWidth
        label="Due Date"
        type="date"
        value={form.dueDate}
        onChange={(e) => handleChange('dueDate', e.target.value)}
        margin="normal"
        required
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Assign to Agent (optional)</InputLabel>
        <Select
          label="Assign to Agent (optional)"
          value={form.assignedTo ?? ''}
          onChange={(e) => handleChange('assignedTo', e.target.value)}
        >
          <MenuItem value="">Unassigned (New)</MenuItem>
          {agents.map((a) => (
            <MenuItem key={a._id} value={a._id}>
              {a.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={loading}
        className="mt-4"
      >
        {loading ? 'Creating...' : 'Create Case'}
      </Button>
    </Box>
  );
};
