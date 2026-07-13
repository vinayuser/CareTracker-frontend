import axios from 'axios';
import { toast } from 'react-toastify';

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
    let errorMessage = 'Something went wrong!';
    if (error.response) {
      const { data } = error.response;
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
    return Promise.reject(error);
  },
);

export default axiosInstance;
