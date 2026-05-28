import type { ReactNode } from 'react';
import { Box, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '@/constants';

interface AuthFooterLinksProps {
  prompt: string;
  linkText: string;
  to: string;
}

export const AuthFooterLink = ({ prompt, linkText, to }: AuthFooterLinksProps) => (
  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
    {prompt}{' '}
    <Link component={RouterLink} to={to} underline="hover">
      {linkText}
    </Link>
  </Typography>
);

interface AuthActionRowProps {
  children: ReactNode;
}

 


export const AuthActionRow = ({ children }: AuthActionRowProps) => (
  <Box
  className='py-3'
    sx={{
      mt: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
      width: '100%',
      '& .MuiButton-root': {
        width: '100%',
      },
    }}
  >
    {children}
  </Box>
);

export const backToLoginLink = (
  <AuthFooterLink prompt="Remember your password?" linkText="Sign in" to={ROUTES.LOGIN} />
);
