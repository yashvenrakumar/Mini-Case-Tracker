import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Pagination,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useCasesApi, useUsersApi } from '@/hooks/api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setPage, selectCasesFilter } from '@/redux/slices/casesFilterSlice';
import { selectAuthUser } from '@/redux/slices/authSlice';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { CaseFilters } from './components/CaseFilters';
import { CaseTable } from './components/CaseTable';
import { ROUTES, USER_ROLES } from '@/constants';
import type { CaseRecord, AgentOption, PaginationMeta } from '@/types';
import { getApiErrorMessage } from '@/utils/apiClient';
import toast from 'react-hot-toast';

export const CasesListPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectCasesFilter);
  const user = useAppSelector(selectAuthUser);
  const { listCases } = useCasesApi();
  const { listAgents } = useUsersApi();
 
  console.log("filters------", filters);
 

  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listCases({
        page: filters.page,
        limit: filters.limit,
        search: filters.search || undefined,
        status: filters.status || undefined,
        assignedTo: filters.assignedTo || undefined,
      });
      setCases(result.cases);
      setMeta(result.meta as PaginationMeta);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [listCases, filters]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  useEffect(() => {
    if (user?.role === USER_ROLES.MANAGER) {
      listAgents().then(setAgents).catch(() => {});
    }
  }, [user, listAgents]);
  console.log("agents==", agents);

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          mb: { xs: 3, md: 4 },
        }}
        spacing={2}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Cases
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {user?.role === USER_ROLES.MANAGER
              ? 'All cases — filter by status or agent'
              : 'Cases assigned to you'}
          </Typography>
        </Box>
        {user?.role === USER_ROLES.MANAGER && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(ROUTES.CASE_CREATE)}
            sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
          >
            New Case
          </Button>
        )}
      </Stack>

      <CaseFilters agents={agents} onSearch={fetchCases} />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <CaseTable cases={cases} />
          {meta && meta.totalPages > 1 && (
            <Box
              sx={{
                mt: 3,
                display: 'flex',
                justifyContent: { xs: 'center', sm: 'flex-start' },
                overflowX: 'auto',
                width: '100%',
              }}
            >
              <Pagination
                count={meta.totalPages}
                page={meta.page}
                onChange={(_, p) => dispatch(setPage(p))}
                color="primary"
                size="medium"
                siblingCount={0}
                boundaryCount={1}
                sx={{
                  '& .MuiPagination-ul': {
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};
