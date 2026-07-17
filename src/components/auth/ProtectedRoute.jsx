import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from '../../redux/slices/authSlice';
import { ROUTES } from '../../routes/routes';

export default function ProtectedRoute() {
  const dispatch = useDispatch();
  const { isAuthenticated, authChecked } = useSelector((state) => state.auth);
  const hasToken = Boolean(localStorage.getItem('token'));

  useEffect(() => {
    if (hasToken && !authChecked) {
      dispatch(fetchCurrentUser());
    }
  }, [authChecked, dispatch, hasToken]);

  // Gate only on the initial session resolve — never on later /auth/me refreshes.
  if (hasToken && !authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8] text-sm text-gray-500">
        Checking session…
      </div>
    );
  }

  if (!isAuthenticated || !hasToken) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}
