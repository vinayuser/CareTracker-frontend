import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';
import { ROUTES } from '../../routes/routes';

export default function ProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}
