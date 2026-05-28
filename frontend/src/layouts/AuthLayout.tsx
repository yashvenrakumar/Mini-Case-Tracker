import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import { ThemeToggle } from '@/components/common/ThemeToggle';

export const AuthLayout = () => (
  <Box
    sx={{
      position: 'relative',
      display: 'flex',
      minHeight: '100dvh',
      alignItems: 'center',
      justifyContent: 'center',
      p: { xs: 2, sm: 3, md: 4 },
      bgcolor: 'background.default'
   }}
  >
    <Box sx={{ position: 'absolute', right: { xs: 12, sm: 16 }, top: { xs: 12, sm: 16 } }}>
      <ThemeToggle />
    </Box>
    <Container
      maxWidth="sm"
      disableGutters={false}
      sx={{
        width: '100%',
        maxWidth: { xs: '100%', sm: 480 },
        px: { xs: 0, sm: 2 },
      }}
    >
      <Box className="mb-4 sm:mb-6" sx={{ color: 'primary.contrastText', textAlign: 'left' }}>
        <FolderSharedIcon sx={{ fontSize: { xs: 40, sm: 48 }, mb: 1 }} />
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.35rem', sm: '1.75rem', md: '2.125rem' },
          }}
        >
          Mini Case Tracker
        </Typography>
        
      </Box>
      <Paper
        elevation={8}
        sx={{
          p: { xs: 2.5, sm: 4, md: 5 },
          bgcolor: 'background.paper',
          color: 'text.primary',
          border: 1,
          borderColor: 'divider',
          textAlign: 'left',
          width: '100%',
        }}
      >
        <Outlet />
      </Paper>
    </Container>
  </Box>
);
