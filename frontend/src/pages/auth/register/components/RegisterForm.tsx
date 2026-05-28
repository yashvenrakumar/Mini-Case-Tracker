import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import Link from "@mui/material/Link";
import { PasswordField } from "@/pages/auth/components/PasswordField";
import { ROUTES, ROLE_LABELS, USER_ROLES } from "@/constants";
import type { RegisterCredentials } from "@/interfaces/auth.interface";
import type { UserRole } from "@/types";

interface RegisterFormProps {
  onSubmit: (payload: RegisterCredentials) => Promise<void>;
  loading: boolean;
}

export const RegisterForm = ({ onSubmit, loading }: RegisterFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>(USER_ROLES.AGENT);
  const [clientError, setClientError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError("");

    if (password !== confirmPassword) {
      setClientError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setClientError("Password must be at least 6 characters");
      return;
    }

    await onSubmit({ name: name.trim(), email: email.trim(), password, role });
  };


 

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" sx={{ fontWeight: 600 }} className="mb-1">
        Create account
      </Typography>

      {clientError && (
        <Alert severity="error" className="mb-3">
          {clientError}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        margin="normal"
        required
        autoComplete="name"
      />

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

      <FormControl fullWidth margin="normal" required>
        <InputLabel id="register-role-label">Role</InputLabel>
        <Select
          labelId="register-role-label"
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
        >
          <MenuItem value={USER_ROLES.MANAGER}>
            {ROLE_LABELS.manager} — create cases, assign agents, review
          </MenuItem>
          <MenuItem value={USER_ROLES.AGENT}>
            {ROLE_LABELS.agent} — work assigned cases, upload documents
          </MenuItem>
        </Select>
     
      </FormControl>

      <PasswordField
        fullWidth
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
        required
        autoComplete="new-password"
        helperText="Minimum 6 characters"
      />

      <PasswordField
        fullWidth
        label="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        margin="normal"
        required
        autoComplete="new-password"
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        className="mt-4 "
      >
        {loading ? "Creating account..." : "Create account "}
      </Button>

      <Typography
        variant="body2"
        color="text.secondary"
        className="mt-4 py-2"
        sx={{ textAlign: 'left' }}
      >
        Already have an account?{" "}
        <Link component={RouterLink} to={ROUTES.LOGIN} underline="hover">
          Sign in
        </Link>
      </Typography>
    </Box>
  );
};
