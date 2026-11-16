import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cti_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect on login check failure, but clear invalid token if expired
      if (window.location.pathname !== '/login') {
        // Handled by AuthContext
      }
    }
    return Promise.reject(error);
  }
);

export default api;
