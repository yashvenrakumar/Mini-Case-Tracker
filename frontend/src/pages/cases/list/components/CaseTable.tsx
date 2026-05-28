import { useNavigate } from 'react-router-dom';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { StatusChip } from '@/components/common/StatusChip';
import { ROUTES } from '@/constants';
import { formatDate } from '@/utils/format';
import type { CaseRecord } from '@/types';

interface CaseTableProps {
  cases: CaseRecord[];
}

export const CaseTable = ({ cases }: CaseTableProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (cases.length === 0) {
    return (
      <Paper className="p-6 sm:p-8" sx={{ textAlign: 'left' }}>
        <Typography color="text.secondary">No cases found</Typography>
      </Paper>
    );
  }

  if (isMobile) {
    return (
      <Stack spacing={2}>
        {cases.map((c) => (
          <Card
            key={c._id}
            variant="outlined"
            sx={{
              bgcolor: 'background.paper',
              borderColor: 'divider',
            }}
          >
            <CardActionArea onClick={() => navigate(ROUTES.CASE_DETAIL(c._id))}>
              <CardContent sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {c.clientName}
                  </Typography>
                  <StatusChip status={c.status} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {c.subjectName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {c.caseType}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Due {formatDate(c.dueDate)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {c.assignedTo?.name ?? 'Unassigned'}
                  </Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={1}
      sx={{
        width: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <Table sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow>
            <TableCell>Client</TableCell>
            <TableCell>Subject</TableCell>
            <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Type</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
              Assigned To
            </TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cases.map((c) => (
            <TableRow
              key={c._id}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(ROUTES.CASE_DETAIL(c._id))}
            >
              <TableCell sx={{ fontWeight: 500 }}>{c.clientName}</TableCell>
              <TableCell>{c.subjectName}</TableCell>
              <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                {c.caseType}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(c.dueDate)}</TableCell>
              <TableCell>
                <StatusChip status={c.status} />
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                {c.assignedTo?.name ?? '—'}
              </TableCell>
              <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                <IconButton
                  size="small"
                  aria-label="View case"
                  onClick={() => navigate(ROUTES.CASE_DETAIL(c._id))}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
