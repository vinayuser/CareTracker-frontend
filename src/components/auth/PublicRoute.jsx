import { Navigate } from 'react-router-dom';
import { getHomeRouteForRole, getUserRole, isAuthenticated } from '../../utils/auth';
import { ROUTES } from '../../routes/routes';

export default function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to={getHomeRouteForRole(getUserRole())} replace />;
  }

  return children;
}
