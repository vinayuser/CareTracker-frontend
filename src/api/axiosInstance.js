import axios from 'axios';
import { toast } from 'react-toastify';



const axiosInstance = axios.create({
  // baseURL: 'https://caretraker.com/api/api',
  baseURL: 'http://localhost:3000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
