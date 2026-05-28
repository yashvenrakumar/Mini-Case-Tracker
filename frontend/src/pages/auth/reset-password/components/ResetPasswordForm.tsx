import { useState } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PasswordField } from '@/pages/auth/components/PasswordField';
import { backToLoginLink } from '@/pages/auth/components/AuthFooterLinks';
import { ROUTES } from '@/constants';

interface ResetPasswordFormProps {
  token: string;
  onSubmit: (password: string) => Promise<void>;
  loading: boolean;
}

export const ResetPasswordForm = ({
  token,
  onSubmit,
  loading,
}: ResetPasswordFormProps) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clientError, setClientError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError('');

    if (password !== confirmPassword) {
      setClientError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setClientError('Password must be at least 6 characters');
      return;
    }

    await onSubmit(password);
    setSuccess(true);
  };

  if (success) {
    return (
      <Box>
        <Alert severity="success" className="mb-4">
          Your password has been reset. You can sign in with your new password.
        </Alert>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
        >
          Go to sign in
        </Button>
      </Box>
    );
  }

  if (!token) {
    return (
      <Box>
        <Alert severity="error" className="mb-4">
          Invalid or missing reset token. Please request a new password reset link.
        </Alert>
        <Box className="mt-4">{backToLoginLink}</Box>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" sx={{ fontWeight: 600 }} className="mb-1">
        Reset password
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mb-4">
        Enter your new password below.
      </Typography>

      {clientError && (
        <Alert severity="error" className="mb-3">
          {clientError}
        </Alert>
      )}

      <PasswordField
        fullWidth
        label="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
        required
        autoComplete="new-password"
        helperText="Minimum 6 characters"
      />

      <PasswordField
        fullWidth
        label="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        margin="normal"
        required
        autoComplete="new-password"
      />

     <div className='py-4'>
     <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        className=""
      >
        {loading ? 'Resetting...' : 'Reset password'}
      </Button>
     </div>
      <Box className="">{backToLoginLink}</Box>
    </Box>
  );
};
