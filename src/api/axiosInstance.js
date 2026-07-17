import axios from 'axios';
import { toast } from 'react-toastify';
import { ROUTES } from '../routes/routes';

const resolveApiBase = () => {
  const fromEnv = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined' && window.location?.origin) {
    // Production nginx serves API under /api/api (see admin/.env.docker.example)
    return `${window.location.origin}/api/api`;
  }
  return 'http://localhost:3000/api';
};

const axiosInstance = axios.create({
  baseURL: resolveApiBase(),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

let storeRef = null;
let handlingUnauthorized = false;

/** Call once from app bootstrap to avoid circular imports with the Redux store. */
export const injectStore = (store) => {
  storeRef = store;
};

const clearSessionAndRedirect = async () => {
  if (handlingUnauthorized) return;
  handlingUnauthorized = true;

  try {
    if (storeRef) {
      const { logout } = await import('../redux/slices/authSlice');
      storeRef.dispatch(logout());
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('authUser');
    }
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('authUser');
  }

  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const isPublic = path === ROUTES.LOGIN
    || path.startsWith('/register')
    || path.startsWith('/candidate');

  if (!isPublic && typeof window !== 'undefined') {
    window.location.assign(ROUTES.LOGIN);
  } else {
    handlingUnauthorized = false;
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (typeof window !== 'undefined' && window.location?.origin) {
      config.headers['X-Frontend-URL'] = window.location.origin;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const skipToast = Boolean(error.config?.skipErrorToast);

    if (status === 401) {
      const isLoginRequest = String(error.config?.url || '').includes('/auth/login');
      if (!isLoginRequest) {
        clearSessionAndRedirect();
      }
      if (!skipToast && !isLoginRequest) {
        toast.error(data?.message || 'Session expired. Please sign in again.');
      }
      return Promise.reject(error);
    }

    if (!skipToast) {
      let errorMessage = 'Something went wrong!';
      if (error.response) {
        if (data?.message) {
          errorMessage = data.message;
        } else if (data?.error?.message) {
          errorMessage = data.error.message;
        }
      } else if (error.request) {
        errorMessage = 'No response from server! Please check your network.';
      } else {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
