import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
});

// api.interceptors.request.use((config) => {
//   config.headers = config.headers || {};
//   const auth = useAuthStore();
//   auth.loadFromStorage();
//   if (auth.token) {
//     config.headers.Authorization = `Bearer ${auth.token}`;
//   }
//   return config;
// });
api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  auth.loadFromStorage();

  if (!config.headers) config.headers = {};

  if (auth.token) {
    config.headers['Authorization'] = `Bearer ${auth.token}`;
  }

  return config;
});

export default api;
