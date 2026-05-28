import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, ManagerRoute } from '@/components/common/ProtectedRoute';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MainLayout } from '@/layouts/MainLayout';
import { ROUTES } from '@/constants';
import { useAppSelector } from '@/redux/hooks';
import { selectIsAuthenticated } from '@/redux/slices/authSlice';

const LoginPage = lazy(() =>
  import('@/pages/auth/login/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('@/pages/auth/register/RegisterPage').then((m) => ({
    default: m.RegisterPage,
  }))
);
const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/forgot-password/ForgotPasswordPage').then((m) => ({
    default: m.ForgotPasswordPage,
  }))
);
const ResetPasswordPage = lazy(() =>
  import('@/pages/auth/reset-password/ResetPasswordPage').then((m) => ({
    default: m.ResetPasswordPage,
  }))
);
const DashboardPage = lazy(() =>
  import('@/pages/dashboard/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  }))
);
const CasesListPage = lazy(() =>
  import('@/pages/cases/list/CasesListPage').then((m) => ({
    default: m.CasesListPage,
  }))
);
const CaseDetailPage = lazy(() =>
  import('@/pages/cases/detail/CaseDetailPage').then((m) => ({
    default: m.CaseDetailPage,
  }))
);
const CreateCasePage = lazy(() =>
  import('@/pages/cases/create/CreateCasePage').then((m) => ({
    default: m.CreateCasePage,
  }))
);

const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  console.log("isAuthenticated------  in auth  ", isAuthenticated);
  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />;
  return <>{children}</>;
};

export const AppRoutes = () => (
  <BrowserRouter>
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route
            path={ROUTES.LOGIN}
            element={
              <AuthRedirect>
                <LoginPage />
              </AuthRedirect>
            }
          />
          <Route
            path={ROUTES.REGISTER}
            element={
              <AuthRedirect>
                <RegisterPage />
              </AuthRedirect>
            }
          />
          <Route
            path={ROUTES.FORGOT_PASSWORD}
            element={
              <AuthRedirect>
                <ForgotPasswordPage />
              </AuthRedirect>
            }
          />
          <Route
            path={ROUTES.RESET_PASSWORD}
            element={
              <AuthRedirect>
                <ResetPasswordPage />
              </AuthRedirect>
            }
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.CASES} element={<CasesListPage />} />
            <Route path="/cases/:id" element={<CaseDetailPage />} />
            <Route element={<ManagerRoute />}>
              <Route path={ROUTES.CASE_CREATE} element={<CreateCasePage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);
