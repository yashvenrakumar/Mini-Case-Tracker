import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import { useCasesApi } from '@/hooks/api';
import { CreateCaseForm } from './components/CreateCaseForm';
import { ROUTES } from '@/constants';
import type { CreateCasePayload } from '@/interfaces/case.interface';
import { getApiErrorMessage } from '@/utils/apiClient';
import toast from 'react-hot-toast';

export const CreateCasePage = () => {
  const navigate = useNavigate();
  const { createCase } = useCasesApi();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (payload: CreateCasePayload) => {
    setLoading(true);
    try {
      const created = await createCase(payload);
      toast.success('Case created successfully');
      navigate(ROUTES.CASE_DETAIL(created._id));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

 
  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }} className="mb-1">
          Create Case
        </Typography>
        <Typography color="text.secondary">
          Add a new client case and optionally assign an agent
        </Typography>
      </Box>
      <Paper
        elevation={1}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          width: '100%',
          maxWidth: { sm: 560 },
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <CreateCaseForm onSubmit={handleSubmit} loading={loading} />
      </Paper>
    </Box>
  );
};
