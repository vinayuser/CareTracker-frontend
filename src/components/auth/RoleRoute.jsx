import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getHomeRouteForRole, getUserRole, canAccessPath } from '../../utils/auth';
import { ROUTES } from '../../routes/routes';

export default function RoleRoute({ allowedRoles = [] }) {
  const role = getUserRole();
  const { pathname } = useLocation();
  const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

  if (!role) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!normalizedAllowed.includes(role)) {
    return <Navigate to={getHomeRouteForRole(role)} replace />;
  }

  if (!canAccessPath(pathname, role)) {
    return <Navigate to={getHomeRouteForRole(role)} replace />;
  }

  return <Outlet />;
}
