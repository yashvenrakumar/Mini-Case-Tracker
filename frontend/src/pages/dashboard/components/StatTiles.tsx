import { Grid, Paper, Typography, Box, useTheme } from '@mui/material';
import { STATUS_LABELS } from '@/constants';

const STATUS_DOT_COLORS: Record<string, string> = {
  new: '#9e9e9e',
  assigned: '#0288d1',
  in_progress: '#1565c0',
  submitted: '#ed6c02',
  cleared: '#2e7d32',
  discrepant: '#d32f2f',
};

interface StatTilesProps {
  stats: { total: number; byStatus: { status: string; count: number }[] };
}

export const StatTiles = ({ stats }: StatTilesProps) => {
  const theme = useTheme();

  console.log("stats-------11", stats);
  return (
    <Grid container spacing={2} sx={{ width: '100%', justifyContent: 'flex-start' }}>
      <Grid size={{ xs: 6, sm: 6, md: 4, lg: 3 }}>
        <Paper
          className="p-4"
          elevation={1}
          sx={{
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="overline" color="text.secondary">
            Total Cases
          </Typography>
          <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
            {stats.total}
          </Typography>
        </Paper>
      </Grid>
      {stats.byStatus.map(({ status, count }) => (
        <Grid key={status} size={{ xs: 6, sm: 6, md: 4, lg: 3 }}>
          <Paper
            className="p-4"
            elevation={1}
            sx={{
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Box className="flex items-center justify-between">
              <Typography variant="overline" color="text.secondary">
                {STATUS_LABELS[status] ?? status}
              </Typography>
              <Box
                className="h-2 w-2 shrink-0 rounded-none"
                sx={{
                  bgcolor: STATUS_DOT_COLORS[status] ?? theme.palette.custom.border,
                }}
              />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {count}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};
