import { Box, CircularProgress } from '@mui/material';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: number;
}

export const LoadingSpinner = ({
  fullScreen = false,
  size = 40,
}: LoadingSpinnerProps) => (
  <Box
    className={`flex items-center justify-center ${
      fullScreen ? 'min-h-[60vh]' : 'py-8'
    }`}
  >
    <CircularProgress size={size} />
  </Box>
);
