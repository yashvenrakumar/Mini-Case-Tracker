import { useState } from 'react';
import { useAuthApi } from '@/hooks/api';
import { getApiErrorMessage } from '@/utils/apiClient';
import toast from 'react-hot-toast';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';

export const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuthApi();

  const handleSubmit = async (email: string) => {
    setLoading(true);
    try {
      const result = await forgotPassword({ email });
      toast.success(result.message);
      return result;
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return <ForgotPasswordForm onSubmit={handleSubmit} loading={loading} />;
};
