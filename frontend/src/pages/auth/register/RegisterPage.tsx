import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/redux/hooks';
import { setCredentials } from '@/redux/slices/authSlice';
import { useAuthApi } from '@/hooks/api';
import { ROUTES, ROLE_LABELS } from '@/constants';
import { getApiErrorMessage } from '@/utils/apiClient';
import toast from 'react-hot-toast';
import { RegisterForm } from './components/RegisterForm';
import type { RegisterCredentials } from '@/interfaces/auth.interface';

export const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { register } = useAuthApi();

  

  const handleSubmit = async (payload: RegisterCredentials) => {
    setLoading(true);
    try {
      const result = await register(payload);
      console.log("result register------>", result);
      dispatch(setCredentials({ token: result.token, user: result.user }));
      toast.success(
        `Welcome, ${result.user.name}! Signed in as ${ROLE_LABELS[result.user.role]}.`
      );
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return <RegisterForm onSubmit={handleSubmit} loading={loading} />;
};
