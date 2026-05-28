import { useState } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { Box, Button, TextField, Typography, Link } from "@mui/material";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/slices/authSlice";
import { useAuthApi } from "@/hooks/api";
import { PasswordField } from "@/pages/auth/components/PasswordField";
import { AuthActionRow } from "@/pages/auth/components/AuthFooterLinks";
import { ROUTES } from "@/constants";
import { getApiErrorMessage } from "@/utils/apiClient";
import toast from "react-hot-toast";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthApi();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    ROUTES.DASHBOARD;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login({ email: email.trim(), password });

      console.log("result------>", result);

      dispatch(setCredentials({ token: result.token, user: result.user }));
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" sx={{ fontWeight: 600 }} className="mb-1">
        Sign in
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mb-4">
        Sign in with your manager or agent account
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

      <PasswordField
        fullWidth
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
        required
        autoComplete="current-password"
      />

      <Box className="mt-1 flex justify-start sm:justify-end py-2">
        <Link
          component={RouterLink}
          to={ROUTES.FORGOT_PASSWORD}
          variant="body2"
          underline="hover"
        >
          Forgot password?
        </Link>
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        className="mt-4"
      >
        {loading ? "Signing in..." : "Sign in"}
      </Button>

      <AuthActionRow>
        <Button
          fullWidth
          variant="outlined"
          size="large"
          component={RouterLink}
          to={ROUTES.REGISTER}
        >
          Create account
        </Button>
      </AuthActionRow>
    </Box>
  );
};
