import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL,
  timeout: 30000,
});

// Attach JWT
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralised error handling
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ error?: string }>) => {
    const status = error.response?.status;
    const message =
      (error.response?.data && (error.response.data.error || JSON.stringify(error.response.data))) ||
      error.message ||
      '请求失败';

    if (status === 401) {
      // Token invalid / expired — log out silently, route guard will redirect.
      const { logout, token } = useAuthStore.getState();
      if (token) {
        logout();
        toast.error('登录已过期，请重新登录');
      }
    } else if (status && status >= 500) {
      toast.error('服务器内部错误，请稍后重试');
    }
    return Promise.reject(new Error(typeof message === 'string' ? message : '请求失败'));
  },
);
