import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { selectAuthUser, selectIsAuthenticated } from '@/redux/slices/authSlice';
import { ROUTES, USER_ROLES } from '@/constants';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);
  const location = useLocation();
  console.log("isAuthenticated------  ", isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};

export const ManagerRoute = () => (
  <ProtectedRoute allowedRoles={[USER_ROLES.MANAGER]} />
);
