import { useState } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { backToLoginLink } from '@/pages/auth/components/AuthFooterLinks';
import type { ForgotPasswordResponse } from '@/interfaces/auth.interface';

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<ForgotPasswordResponse>;
  loading: boolean;
}

export const ForgotPasswordForm = ({
  onSubmit,
  loading,
}: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onSubmit(email.trim());
    setSubmitted(true);
    if (result.resetUrl) setResetUrl(result.resetUrl);
  };

  if (submitted) {
    return (
      <Box>
        <Alert severity="success" className="mb-4">
          If an account exists for this email, password reset instructions have been
          sent.
        </Alert>
        {resetUrl && (
          <Alert severity="info" className="mb-4">
            <Typography variant="body2" className="mb-2">
              Development mode — use this link to reset your password:
            </Typography>
            <Typography
              component="a"
              href={resetUrl}
              variant="body2"
              sx={{ wordBreak: 'break-all' }}
            >
              {resetUrl}
            </Typography>
          </Alert>
        )}
        {backToLoginLink}
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" sx={{ fontWeight: 600 }} className="mb-1">
        Forgot password
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mb-4">
        Enter your email and we will send you instructions to reset your password.
      </Typography>

      <TextField
        fullWidth
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        margin="normal"
        required
        autoComplete="email"
      />

     <div className='py-4'>
     <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
       >
        {loading ? 'Sending...' : 'Send reset link'}
      </Button>
      
     </div>

      <Box className="">{backToLoginLink}</Box>
    </Box>
  );
};
