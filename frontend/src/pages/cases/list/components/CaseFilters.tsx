import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { STATUS_LABELS, USER_ROLES } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  setSearch,
  setStatus,
  setAssignedTo,
  resetFilters,
  selectCasesFilter,
} from '@/redux/slices/casesFilterSlice';
import { selectAuthUser } from '@/redux/slices/authSlice';
import type { AgentOption } from '@/types';
import type { CaseStatus } from '@/types';

interface CaseFiltersProps {
  agents: AgentOption[];
  onSearch: () => void;
}

export const CaseFilters = ({ agents, onSearch }: CaseFiltersProps) => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectCasesFilter);
  const user = useAppSelector(selectAuthUser);
  const isManager = user?.role === USER_ROLES.MANAGER;

 
  console.log("filters------", filters);
 
  console.log("isManager===", isManager);
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={{ xs: 2, md: 1.5 }}
      useFlexGap
      sx={{
        mb: { xs: 3, md: 4 },
        width: '100%',
        alignItems: { xs: 'stretch', md: 'flex-start' },
        flexWrap: 'wrap',
      }}
    >
      <TextField
        size="small"
        placeholder="Search client, subject, type..."
        value={filters.search}
        onChange={(e) => dispatch(setSearch(e.target.value))}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        slotProps={{
          input: {
            startAdornment: (
              <SearchIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.5 }} />
            ),
          },
        }}
        sx={{ flex: { md: '1 1 220px' }, minWidth: 0 }}
        fullWidth
      />
      <FormControl size="small" sx={{ flex: { md: '0 1 160px' }, width: '100%', maxWidth: { md: 200 } }}>
        <InputLabel id="filter-status-label">Status</InputLabel>
        <Select
          labelId="filter-status-label"
          label="Status"
          value={filters.status}
          onChange={(e) =>
            dispatch(setStatus(e.target.value as CaseStatus | ''))
          }
        >
          <MenuItem value="">All</MenuItem>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {isManager && (
        <FormControl size="small" sx={{ flex: { md: '0 1 180px' }, width: '100%', maxWidth: { md: 220 } }}>
          <InputLabel id="filter-agent-label">Agent</InputLabel>
          <Select
            labelId="filter-agent-label"
            label="Agent"
            value={filters.assignedTo}
            onChange={(e) => dispatch(setAssignedTo(e.target.value))}
          >
            <MenuItem value="">All agents</MenuItem>
            {agents.map((a) => (
              <MenuItem key={a._id} value={a._id}>
                {a.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1,
          width: { xs: '100%', md: 'auto' },
          flexShrink: 0,
          '& .MuiButton-root': {
            width: { xs: '100%', sm: 'auto' },
          },
        }}
      >
        <Button variant="contained" onClick={onSearch}>
          Search
        </Button>
        <Button variant="outlined" onClick={() => dispatch(resetFilters())}>
          Reset
        </Button>
      </Box>
    </Stack>
  );
};
