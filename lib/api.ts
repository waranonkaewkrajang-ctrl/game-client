import axios from 'axios';

const api = axios.create({
  baseURL: 'https://admintg289.sbs/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('user_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('user_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;