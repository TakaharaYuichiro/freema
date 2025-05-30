import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

export const useApi = () => {
  const config = useRuntimeConfig();
  const backUrlBase = config.public.backUrlBase;
  const auth = useAuthStore();

  const api = axios.create({
    baseURL: `${backUrlBase}/api`,
    withCredentials: true,
  });

  api.interceptors.request.use((requestConfig) => {
    if (!requestConfig.headers) requestConfig.headers = {};

    if (auth.token) {
      requestConfig.headers['Authorization'] = `Bearer ${auth.token}`;
    }

    return requestConfig;
  });

  return api;
};
