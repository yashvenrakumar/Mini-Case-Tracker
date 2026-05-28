import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          className="flex min-h-screen items-center justify-center p-4"
          sx={{ bgcolor: 'background.default' }}
        >
          <Paper
            className="max-w-md p-8"
            elevation={3}
            sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', textAlign: 'left' }}
          >
            <ErrorOutlineOutlinedIcon color="error" sx={{ fontSize: 56, mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Something went wrong
            </Typography>
            <Typography color="text.secondary" className="mb-4">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </Typography>
            <Button variant="contained" onClick={this.handleReset}>
              Go to Home
            </Button>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}
