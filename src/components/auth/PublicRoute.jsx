import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from '../../redux/slices/authSlice';
import { getHomeRouteForRole, getUserRole } from '../../utils/auth';
import { ROUTES } from '../../routes/routes';

export default function PublicRoute({ children }) {
  const dispatch = useDispatch();
  const { isAuthenticated, authChecked, isLoading, user } = useSelector((state) => state.auth);
  const hasToken = Boolean(localStorage.getItem('token'));

  useEffect(() => {
    if (hasToken && !authChecked) {
      dispatch(fetchCurrentUser());
    }
  }, [authChecked, dispatch, hasToken]);

  if (hasToken && (!authChecked || isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Checking session…
      </div>
    );
  }

  if (isAuthenticated) {
    const role = user?.role || getUserRole();
    return <Navigate to={getHomeRouteForRole(role)} replace />;
  }

  return children;
}
