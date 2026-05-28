import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthApi } from "@/hooks/api";
import { getApiErrorMessage } from "@/utils/apiClient";
import toast from "react-hot-toast";
import { ResetPasswordForm } from "./components/ResetPasswordForm";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuthApi();

  const handleSubmit = async (password: string) => {
    setLoading(true);
    try {
      const result = await resetPassword({ token, password });

      console.log(" reset password------   ", result);

      toast.success(result.message);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResetPasswordForm
      token={token}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
};
